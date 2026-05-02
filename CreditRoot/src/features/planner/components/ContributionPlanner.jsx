import { useState } from 'react'
import { plannerDefaults, INCENTIVE_SCENARIOS, MANANA_SEGURO_RATES } from '../../../data/retirementContent'
import { useRetirementProjection } from '../../../hooks/useRetirementProjection'
import { useEtherfuseRate } from '../../../hooks/useEtherfuseRate'
import { formatCurrencyUsd, formatCurrencyMxn, formatPercentage } from '../../../utils/formatters'
import { calculateCycles } from '../../../utils/projections'
import { lockFunds, enviarTransaccion } from '../../../lib/stellar'
import { firmarTransaccion } from '../../../lib/wallet'
import { buildHistoryEntry, addHistoryEntry } from '../../dashboard/components/ContributionHistory'
import freighterApi from '@stellar/freighter-api'

export function ContributionPlanner() {
  const { userRate, cetesRate, platformRate, isLive } = useEtherfuseRate()
  const { scenario, projection, updateScenario } = useRetirementProjection({
    ...plannerDefaults,
    annualYieldRate: userRate,
  })
  const [estado, setEstado] = useState(null)
  const [txHash, setTxHash] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showCycles, setShowCycles] = useState(false)

  const depositoBajo = scenario.monthlyDepositUsd < MANANA_SEGURO_RATES.minDeposit
  const cycles = calculateCycles(
    scenario.monthlyDepositUsd,
    scenario.yearsToRetirement,
    userRate,
    projection.incentivePct
  )

  async function handleBloquear() {
    if (depositoBajo) return
    try {
      setEstado('loading')
      setErrorMsg(null)
      const { address } = await freighterApi.getAddress()
      if (!address) throw new Error('Conecta tu wallet primero')
      const tx = await lockFunds(address, Number(scenario.monthlyDepositUsd))
      const signedXdr = await firmarTransaccion(tx.toXDR())
      const hash = await enviarTransaccion(signedXdr)
      setTxHash(hash)
      const entry = buildHistoryEntry(Number(scenario.monthlyDepositUsd), address)
      entry.txHash = hash
      addHistoryEntry(address, entry)
      setEstado('success')
    } catch (err) {
      setErrorMsg(err.message)
      setEstado('error')
    }
  }

  const txUrl = txHash ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : null

  const projCards = [
    { label: 'Balance al retiro', val: formatCurrencyUsd(projection.projectedBalance), sub: 'incl. incentivos', color: 'text-brand', bg: 'bg-brand/8 border-brand/15' },
    { label: 'Ganancia por rendimiento', val: formatCurrencyUsd(projection.growthAmount), sub: 'sobre lo aportado', color: 'text-green-600', bg: 'bg-green-500/8 border-green-500/15' },
    { label: 'Incentivos acumulados', val: formatCurrencyUsd(projection.totalIncentives), sub: `${projection.incentivePct}% cada 5 años`, color: 'text-yellow-500', bg: 'bg-yellow-400/8 border-yellow-400/15' },
    { label: 'Ingreso mensual retiro', val: formatCurrencyUsd(projection.estimatedMonthlyIncome), sub: 'retiro del 4% anual', color: 'text-ink', bg: 'bg-ink/4 border-ink/8' },
  ]

  return (
    <div className="grid lg:grid-cols-12 gap-4">

      {/* ── Simulador ── */}
      <div className="lg:col-span-5">
        <div className="bg-white border border-ink/8 rounded-2xl p-6 h-full">
          <h5 className="font-display font-black text-ink text-lg mb-5">Configura tu ahorro</h5>

          <div className="flex flex-col gap-5">

            {/* Aportación mensual */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-ink/50 font-medium">Aportación mensual (USDC)</label>
                <span className="text-xs font-bold text-brand">{formatCurrencyUsd(scenario.monthlyDepositUsd)}</span>
              </div>
              <input
                type="number"
                className="w-full border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                min={MANANA_SEGURO_RATES.minDeposit}
                step="1"
                value={scenario.monthlyDepositUsd}
                onChange={e => updateScenario('monthlyDepositUsd', e.target.value)}
              />
              {depositoBajo && (
                <p className="text-xs text-brand mt-1.5">
                  ⚠ Mínimo ${MANANA_SEGURO_RATES.minDeposit} USDC por depósito
                </p>
              )}
              {scenario.monthlyDepositUsd >= MANANA_SEGURO_RATES.constancyMinDeposit && (
                <p className="text-xs text-green-600 mt-1.5">
                  ✓ Calificas para incentivo de constancia
                </p>
              )}
            </div>

            {/* Años al retiro */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-ink/50 font-medium">Años al retiro</label>
                <span className="text-xs font-bold text-ink">{scenario.yearsToRetirement} años</span>
              </div>
              <input
                type="number"
                className="w-full border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                min="5" max="40" step="5"
                value={scenario.yearsToRetirement}
                onChange={e => updateScenario('yearsToRetirement', e.target.value)}
              />
            </div>

            {/* Tasa */}
            <div className="bg-ink/3 border border-ink/6 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-ink/50">Tasa que recibirás</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${isLive
                    ? 'bg-green-500/10 text-green-700 border-green-500/20'
                    : 'bg-yellow-400/10 text-yellow-600 border-yellow-400/20'
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {userRate}% APY
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Bruta CETES', val: `${cetesRate}%` },
                  { label: 'Comisión plataforma', val: `−${platformRate}%` },
                  { label: 'Para ti', val: `${userRate}%`, color: 'text-green-600' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-ink/35 mb-0.5" style={{ fontSize: 10 }}>{item.label}</p>
                    <p className={`text-xs font-bold ${item.color ?? 'text-ink'}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incentivo */}
            <div>
              <label className="text-xs text-ink/50 font-medium mb-2 block">Incentivo cada 5 años</label>
              <select
                className="w-full border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all bg-white cursor-pointer"
                value={scenario.incentiveScenario}
                onChange={e => updateScenario('incentiveScenario', e.target.value)}>
                {INCENTIVE_SCENARIOS.map(s => (
                  <option key={s.key} value={s.key}>
                    {s.label} — {s.pct}% del rendimiento
                  </option>
                ))}
              </select>
              <p className="text-xs text-ink/40 mt-1.5">
                {INCENTIVE_SCENARIOS.find(s => s.key === scenario.incentiveScenario)?.description}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Proyección ── */}
      <div className="lg:col-span-7">
        <div className="bg-white border border-ink/8 rounded-2xl p-6 h-full">
          <h5 className="font-display font-black text-ink text-lg mb-5">Proyección de tu retiro</h5>

          {/* 4 cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {projCards.map(item => (
              <div key={item.label} className={`border rounded-xl p-4 ${item.bg}`}>
                <p className="text-xs text-ink/40 mb-1">{item.label}</p>
                <p className={`text-lg font-bold mb-0.5 ${item.color}`}>{item.val}</p>
                <p className="text-xs text-ink/35">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Detalles */}
          <div className="flex flex-col gap-0 mb-5">
            {[
              { label: 'Total aportado por ti', val: formatCurrencyUsd(projection.investedAmount) },
              { label: 'Tasa usuario (Cetes − comisión)', val: `${formatPercentage(userRate)} anual` },
              { label: 'Comisión plataforma', val: `${formatPercentage(MANANA_SEGURO_RATES.platformRate)} anual` },
              { label: 'En pesos (tipo cambio $17)', val: formatCurrencyMxn(projection.projectedBalance * 17) },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2.5 border-b border-ink/5">
                <span className="text-xs text-ink/45">{item.label}</span>
                <span className="text-xs font-semibold text-ink">{item.val}</span>
              </div>
            ))}
          </div>

          {/* Toggle ciclos */}
          <button
            className="w-full border border-ink/10 text-ink/40 hover:text-ink/70 hover:border-ink/20 text-xs font-medium py-2.5 rounded-xl transition-all cursor-pointer"
            onClick={() => setShowCycles(!showCycles)}>
            {showCycles ? '▲ Ocultar ciclos de 5 años' : '▼ Ver desglose por ciclos de 5 años'}
          </button>
        </div>
      </div>

      {/* ── Ciclos ── */}
      {showCycles && cycles.length > 0 && (
        <div className="lg:col-span-12">
          <div className="bg-white border border-ink/8 rounded-2xl p-6">
            <h6 className="font-semibold text-ink mb-4">Ciclos de incentivo cada 5 años</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ink/40 text-xs border-b border-ink/6">
                    <th className="text-left pb-2 font-medium">Ciclo</th>
                    <th className="text-left pb-2 font-medium">Años</th>
                    <th className="text-left pb-2 font-medium">Saldo inicio</th>
                    <th className="text-left pb-2 font-medium">Saldo fin</th>
                    <th className="text-left pb-2 font-medium">Rendimiento</th>
                    <th className="text-left pb-2 font-medium text-yellow-600">Incentivo ({projection.incentivePct}%)</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(c => (
                    <tr key={c.cycle} className="border-b border-ink/4">
                      <td className="py-2.5 font-semibold text-ink">{c.cycle}</td>
                      <td className="py-2.5 text-ink/40">{c.yearStart}–{c.yearEnd}</td>
                      <td className="py-2.5 text-ink">{formatCurrencyUsd(c.startBalance)}</td>
                      <td className="py-2.5 text-brand font-semibold">{formatCurrencyUsd(c.endBalance)}</td>
                      <td className="py-2.5 text-green-600 font-semibold">{formatCurrencyUsd(c.totalYield)}</td>
                      <td className="py-2.5 text-yellow-600 font-semibold">+{formatCurrencyUsd(c.incentiveAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Bloquear ── */}
      <div className="lg:col-span-12">
        <div className="bg-white border border-ink/8 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

            <div>
              <h5 className="font-display font-black text-ink text-lg mb-1">
                Bloquear ahorro en Mañana Seguro
              </h5>
              <p className="text-sm text-ink/50">
                Confirma tu aportación de{' '}
                <strong className="text-ink">{formatCurrencyUsd(scenario.monthlyDepositUsd)} USDC</strong>.
                Los fondos quedan bloqueados por contrato inteligente hasta tu meta.
              </p>
            </div>

            <button
              className={`shrink-0 w-full lg:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${estado === 'success'
                  ? 'bg-green-500/10 text-green-700 border border-green-500/20 cursor-default'
                  : depositoBajo
                    ? 'bg-ink/5 text-ink/25 border border-ink/8 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-dark text-white hover:-translate-y-px hover:shadow-lg hover:shadow-brand/30'
                }`}
              onClick={handleBloquear}
              disabled={estado === 'loading' || estado === 'success' || depositoBajo}>
              {estado === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Procesando...
                </span>
              ) : estado === 'success' ? '✓ Ahorro bloqueado' : '🔒 Bloquear ahorro'}
            </button>
          </div>

          {estado === 'success' && txHash && (
            <div className="mt-4 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-green-700 mb-1">✅ Transacción confirmada en testnet</p>
              <a href={txUrl} target="_blank" rel="noreferrer"
                className="text-xs text-brand hover:text-brand-dark transition-colors">
                Ver en Stellar Expert → {txHash.slice(0, 16)}...
              </a>
            </div>
          )}

          {estado === 'error' && (
            <div className="mt-4 bg-red-500/8 border border-dashed border-red-400/40 text-red-500 text-sm px-4 py-3 rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}