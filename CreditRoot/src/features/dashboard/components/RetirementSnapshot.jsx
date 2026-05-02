import { useEffect, useState } from 'react'
import { getBalances, verFechaRetiro, verBalanceContrato, verMeta, verDepositos } from '../../../lib/stellar'
import freighterApi from '@stellar/freighter-api'
import { useEtherfuseRate } from '../../../hooks/useEtherfuseRate'
import { MANANA_SEGURO_RATES } from '../../../data/retirementContent'
import { calculateCycles } from '../../../utils/projections'
import { formatCurrencyUsd } from '../../../utils/formatters'
import { AutoloanCard } from './AutoloanCard'
import { ContributionHistory } from './ContributionHistory'
import { ReferralModule } from '../../referrals/components/ReferralModule'
import { CarlosSimulator } from '../../simulator/components/CarlosSimulator'
import { RateBadge } from '../../../components/common/RateBadge'

export function RetirementSnapshot() {
  const [balances, setBalances] = useState(null)
  const [address, setAddress] = useState(null)
  const [fechaRetiro, setFechaRetiro] = useState(null)
  const [lockedBalance, setLockedBalance] = useState(0)
  const [meta, setMeta] = useState(10000)
  const [depositCount, setDepositCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('resumen')

  const { cetesRate, userRate, platformRate } = useEtherfuseRate()

  const tabs = [
    { key: 'resumen', label: '📊 Resumen' },
    { key: 'historial', label: '📋 Historial' },
    { key: 'ciclos', label: '🔄 Ciclos' },
    { key: 'prestamo', label: '🚨 Autopréstamo' },
    { key: 'referidos', label: '👥 Referidos' },
    { key: 'carlos', label: '🛵 Simulación' },
    { key: 'ingresos', label: '💰 Distribución' },
  ]

  // ── Issue #2: keyboard navigation ────────────────────────────────────────
  function handleTabKeyDown(e, currentIndex) {
    let newIndex = currentIndex
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      newIndex = (currentIndex + 1) % tabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = tabs.length - 1
    } else return

    setActiveTab(tabs[newIndex].key)
    setTimeout(() => {
      document.getElementById(`tab-${tabs[newIndex].key}`)?.focus()
    }, 0)
  }

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { address } = await freighterApi.getAddress()
        if (!address) throw new Error('Wallet no conectada')
        setAddress(address)

        const data = await getBalances(address)
        const xlm = data.find(b => b.asset_type === 'native')
        const usdc = data.find(b => b.asset_code === 'USDC')
        setBalances({
          xlm: xlm ? parseFloat(xlm.balance).toFixed(2) : '0.00',
          usdc: usdc ? parseFloat(usdc.balance).toFixed(2) : '0.00',
        })

        try { setFechaRetiro(await verFechaRetiro(address)) }
        catch { setFechaRetiro('Pendiente de primer depósito') }

        try { setLockedBalance(Number(await verBalanceContrato(address))) }
        catch { /* saldo en 0 si no hay depósitos */ }

        try { const m = await verMeta(address); if (m > 0) setMeta(Number(m)) }
        catch { /* meta default 10000 */ }

        try { setDepositCount(Number(await verDepositos(address))) }
        catch { /* 0 depósitos */ }

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const usdcLibre = balances ? parseFloat(balances.usdc) : 0
  const proyeccion20 = (lockedBalance * Math.pow(1 + userRate / 100, 20)).toFixed(2)
  const cycles = calculateCycles(25, 20, userRate, 9)

  return (
    <div>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <span className="inline-block bg-brand/10 text-brand-dark border border-brand/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
          📊 Mañana Seguro
        </span>
        {address && (
          <span className="text-xs text-ink/40 font-mono">
            {address.slice(0, 8)}...{address.slice(-8)}
          </span>
        )}
      </div>
      <h2 className="font-display font-black text-ink tracking-tight mb-2"
        style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)' }}>
        Dashboard de ahorro
      </h2>
      <RateBadge compact />

      {/* ── Issue #5: Skeleton cards ─────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-6 mb-4"
          aria-busy="true" aria-label="Cargando datos del dashboard">
          {['USDC en wallet', 'USDC bloqueado', 'Proyección a 20 años', 'Fecha de retiro'].map(label => (
            <div key={label} className="bg-ink/4 border border-ink/6 rounded-2xl p-4 h-28">
              <div className="text-transparent text-xs select-none mb-3">{label}</div>
              <div className="skeleton-pulse h-6 w-3/4 mb-2 rounded" />
              <div className="skeleton-pulse h-3 w-full rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Issue #3: Error states diferenciados ─────────────────────────── */}
      {error && (
        <div className="bg-ink/5 border border-brand/20 rounded-2xl p-5 mb-6 mt-4">
          {error.includes('Freighter') || error.includes('not installed') ? (
            <div>
              <p className="font-semibold text-ink mb-1">⚠️ Freighter no detectado</p>
              <p className="text-sm text-ink/50 mb-3">
                Para usar esta app necesitas la extensión Freighter Wallet.
              </p>
              <a href="https://freighter.app/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand font-semibold hover:text-brand-dark transition-colors">
                Instalar Freighter →
              </a>
            </div>
          ) : error.includes('connected') || error.includes('conectada') ? (
            <div>
              <p className="font-semibold text-ink mb-1">⚠️ Wallet no conectada</p>
              <p className="text-sm text-ink/50 mb-3">
                Conecta tu wallet para ver tu dashboard.
              </p>
              <button
                className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                onClick={() => window.location.reload()}>
                Conectar wallet
              </button>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-ink mb-1">⚠️ {error}</p>
              <p className="text-sm text-ink/50">Algo salió mal. Intenta de nuevo.</p>
            </div>
          )}
        </div>
      )}

      {balances && (
        <>
          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-6 mb-4">
            {[
              { label: 'USDC en wallet', val: `$${usdcLibre.toFixed(2)}`, sub: 'Balance libre Stellar testnet', color: 'text-brand' },
              { label: 'USDC bloqueado', val: formatCurrencyUsd(lockedBalance), sub: `${depositCount} depósito${depositCount !== 1 ? 's' : ''} on-chain`, color: 'text-green-600' },
              { label: 'Proyección a 20 años', val: formatCurrencyUsd(Number(proyeccion20)), sub: `a ${userRate.toFixed(2)}% APY`, color: 'text-yellow-500' },
              { label: 'Fecha de retiro', val: fechaRetiro ?? '—', sub: 'Según contrato Soroban', color: 'text-ink/60' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-ink/8 rounded-2xl p-4">
                <p className="text-xs text-ink/40 mb-2">{stat.label}</p>
                <p className={`text-base font-bold mb-1 ${stat.color}`}>{stat.val}</p>
                <p className="text-xs text-ink/35">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Progreso ───────────────────────────────────────────────────── */}
          <div className="bg-white border border-ink/8 rounded-2xl p-5 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-ink text-sm">Progreso hacia meta</span>
              <span className="text-xs text-ink/40">Meta: {formatCurrencyUsd(meta)}</span>
            </div>
            <div className="h-2 bg-ink/5 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-dark to-brand rounded-full transition-all duration-700"
                style={{ width: `${Math.min((lockedBalance / meta) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-ink/40">{formatCurrencyUsd(lockedBalance)} bloqueados</span>
              <span className="text-xs text-brand font-semibold">{((lockedBalance / meta) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* ── Issue #1: Tab bar mobile con scroll oculto + fade ──────────── */}
          <div className="relative mb-4">
            {/* Fade gradient derecho */}
            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-r from-transparent to-surface pointer-events-none z-10" />

            <div
              role="tablist"
              aria-label="Dashboard sections"
              className="flex gap-2 overflow-x-auto pb-1 tab-scroll">
              {tabs.map((t, index) => (
                <button
                  key={t.key}
                  id={`tab-${t.key}`}
                  role="tab"
                  aria-selected={activeTab === t.key}
                  aria-controls={`panel-${t.key}`}
                  tabIndex={activeTab === t.key ? 0 : -1}
                  className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${activeTab === t.key
                    ? 'bg-brand/10 border-brand/30 text-brand'
                    : 'bg-transparent border-ink/10 text-ink/40 hover:text-ink/70 hover:border-ink/20'
                    }`}
                  onClick={() => setActiveTab(t.key)}
                  onKeyDown={e => handleTabKeyDown(e, index)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Paneles ────────────────────────────────────────────────────── */}
          {activeTab === 'resumen' && (
            <div id="panel-resumen" role="tabpanel" aria-labelledby="tab-resumen" className="flex flex-col gap-4">
              <RateBadge />
              <div className="bg-white border border-ink/8 rounded-2xl p-5">
                <h6 className="font-semibold text-ink mb-4">Estado del contrato</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Red', val: 'Stellar Testnet' },
                    { label: 'Proveedor yield', val: 'Etherfuse CETES' },
                    { label: 'Tasa bruta CETES', val: `${cetesRate.toFixed(2)}% APY` },
                    { label: 'Tasa usuario', val: `${userRate.toFixed(2)}% APY` },
                    { label: 'Comisión plataforma', val: `${platformRate.toFixed(2)}% APY` },
                    { label: 'Mínimo depósito', val: `$${MANANA_SEGURO_RATES.minDeposit} USDC` },
                    { label: 'Autopréstamo máx.', val: `${MANANA_SEGURO_RATES.loanMaxPct * 100}% del saldo` },
                    { label: 'Incentivo máximo', val: '9% cada 5 años' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-ink/40 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-ink">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div id="panel-historial" role="tabpanel" aria-labelledby="tab-historial">
              <ContributionHistory walletAddress={address} lockedBalance={lockedBalance} depositCount={depositCount} />
            </div>
          )}

          {activeTab === 'ciclos' && (
            <div id="panel-ciclos" role="tabpanel" aria-labelledby="tab-ciclos"
              className="bg-white border border-ink/8 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h6 className="font-semibold text-ink">Ciclos cada 5 años · $25 USDC/mes</h6>
                <span className="text-xs bg-yellow-400/10 text-yellow-600 border border-yellow-400/20 rounded-full px-3 py-1 font-semibold">
                  9% incentivo máx.
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-ink/40 text-xs border-b border-ink/6">
                      <th className="text-left pb-2 font-medium">Ciclo</th>
                      <th className="text-left pb-2 font-medium">Años</th>
                      <th className="text-left pb-2 font-medium">Saldo fin</th>
                      <th className="text-left pb-2 font-medium">Rendimiento</th>
                      <th className="text-left pb-2 font-medium text-yellow-600">Incentivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.map(c => (
                      <tr key={c.cycle} className="border-b border-ink/4">
                        <td className="py-2.5 font-semibold text-ink">{c.cycle}</td>
                        <td className="py-2.5 text-ink/40">{c.yearStart}–{c.yearEnd}</td>
                        <td className="py-2.5 text-brand font-semibold">{formatCurrencyUsd(c.endBalance)}</td>
                        <td className="py-2.5 text-green-600 font-semibold">{formatCurrencyUsd(c.totalYield)}</td>
                        <td className="py-2.5 text-yellow-600 font-semibold">+{formatCurrencyUsd(c.incentiveAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-ink/10">
                      <td colSpan={4} className="pt-3 font-semibold text-ink">Total incentivos</td>
                      <td className="pt-3 font-bold text-yellow-600">
                        {formatCurrencyUsd(cycles.reduce((s, c) => s + c.incentiveAmount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'prestamo' && (
            <div id="panel-prestamo" role="tabpanel" aria-labelledby="tab-prestamo">
              <AutoloanCard lockedBalance={lockedBalance} walletAddress={address} />
            </div>
          )}

          {activeTab === 'referidos' && (
            <div id="panel-referidos" role="tabpanel" aria-labelledby="tab-referidos">
              <ReferralModule userName={address?.slice(0, 8) ?? 'usuario'} walletAddress={address} />
            </div>
          )}

          {activeTab === 'carlos' && (
            <div id="panel-carlos" role="tabpanel" aria-labelledby="tab-carlos">
              <CarlosSimulator />
            </div>
          )}

          {activeTab === 'ingresos' && (
            <div id="panel-ingresos" role="tabpanel" aria-labelledby="tab-ingresos"
              className="bg-white border border-ink/8 rounded-2xl p-5">
              <h6 className="font-semibold text-ink mb-4">Distribución del rendimiento</h6>

              <div className="mb-6">
                <div className="h-7 bg-ink/5 rounded-full overflow-hidden flex mb-2">
                  <div className="h-full bg-gradient-to-r from-brand-dark to-green-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{ width: `${(userRate / cetesRate) * 100}%` }}>
                    {userRate.toFixed(2)}% → tú
                  </div>
                  <div className="h-full bg-brand flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{ width: `${(platformRate / cetesRate) * 100}%` }}>
                    {platformRate.toFixed(2)}%
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-green-600 font-medium">{userRate.toFixed(2)}% al usuario</span>
                  <span className="text-xs text-brand font-medium">{platformRate.toFixed(2)}% Mañana Seguro</span>
                </div>
              </div>

              <h6 className="font-semibold text-ink mb-3">Proyección por escala</h6>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-ink/40 text-xs border-b border-ink/6">
                      <th className="text-left pb-2 font-medium">Usuarios</th>
                      <th className="text-left pb-2 font-medium">Activos</th>
                      <th className="text-left pb-2 font-medium">Ingreso anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['200', '$100K USDC', '$1,000'],
                      ['1,000', '$500K USDC', '$5,000'],
                      ['10,000', '$5M USDC', '$50,000'],
                      ['50,000', '$25M USDC', '$250,000'],
                    ].map(([u, a, i]) => (
                      <tr key={u} className="border-b border-ink/4">
                        <td className="py-2.5 font-semibold text-ink">{u}</td>
                        <td className="py-2.5 text-ink/40">{a}</td>
                        <td className="py-2.5 text-green-600 font-semibold">{i} USDC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}