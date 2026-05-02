import { useState, useEffect } from 'react'
import { retirarFondos, enviarTransaccion, verBalanceContrato, verFechaRetiro } from '../../../lib/stellar'
import { firmarTransaccion } from '../../../lib/wallet'
import { useEtherfuseRate } from '../../../hooks/useEtherfuseRate'
import { MANANA_SEGURO_RATES } from '../../../data/retirementContent'
import { formatCurrencyUsd, formatCurrencyMxn } from '../../../utils/formatters'
import freighterApi from '@stellar/freighter-api'

export function WithdrawalFlow({ meta = 10000 }) {
  const { userRate, cetesRate } = useEtherfuseRate()
  const [fase, setFase] = useState('verificando')
  const [address, setAddress] = useState(null)
  const [saldoContrato, setSaldoContrato] = useState(0)
  const [fechaRetiro, setFechaRetiro] = useState(null)
  const [txHash, setTxHash] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [resumenFinal, setResumenFinal] = useState(null)

  useEffect(() => { verificarEstado() }, [])

  async function verificarEstado() {
    setFase('verificando')
    setErrorMsg(null)
    try {
      const { address: addr } = await freighterApi.getAddress()
      if (!addr) throw new Error('Wallet no conectada — abre Freighter y vuelve a intentar')
      setAddress(addr)

      const saldo = await verBalanceContrato(addr)
      setSaldoContrato(Number(saldo))

      try { setFechaRetiro(await verFechaRetiro(addr)) }
      catch { setFechaRetiro('Pendiente de primer depósito') }

      setFase(Number(saldo) >= meta ? 'alcanzada' : 'no_alcanzada')
    } catch (err) {
      setErrorMsg(err.message ?? 'No se pudo conectar con el contrato')
      setFase('error')
    }
  }

  async function handleRetirar() {
    setFase('procesando')
    try {
      const tx = await retirarFondos(address)
      const signedXdr = await firmarTransaccion(tx.toXDR())
      const hash = await enviarTransaccion(signedXdr)
      setTxHash(hash)

      const comision = saldoContrato * (MANANA_SEGURO_RATES.platformRate / 100)
      const totalRecibido = saldoContrato - comision
      const rendimientoEst = saldoContrato * 0.30
      const aportadoEst = saldoContrato - rendimientoEst
      setResumenFinal({ totalAportado: aportadoEst, rendimiento: rendimientoEst, comision, total: totalRecibido })
      setFase('exitoso')
    } catch (err) {
      setErrorMsg(err.message ?? 'Error al procesar el retiro en el contrato')
      setFase('error')
    }
  }

  const falta = Math.max(0, meta - saldoContrato)
  const progresoPct = Math.min((saldoContrato / meta) * 100, 100)

  return (
    <div>

      {/* ── Verificando ── */}
      {fase === 'verificando' && (
        <div className="bg-white border border-ink/8 rounded-2xl p-10 text-center">
          <svg className="animate-spin mx-auto mb-4 text-brand" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="font-semibold text-ink mb-1">Verificando tu meta de retiro</p>
          <p className="text-sm text-ink/45">Consultando saldo real en el contrato Soroban...</p>
        </div>
      )}

      {/* ── Meta no alcanzada ── */}
      {fase === 'no_alcanzada' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-ink/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">⏳</span>
              <div>
                <h5 className="font-display font-black text-ink text-lg mb-0">Aún no alcanzas tu meta</h5>
                <p className="text-sm text-ink/45 mb-0">Sigue aportando — vas muy bien.</p>
              </div>
            </div>

            {/* Progreso */}
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-ink">Progreso hacia la meta</span>
                <span className="text-sm font-bold text-brand">{progresoPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-ink/5 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-brand-dark to-brand rounded-full transition-all duration-700"
                  style={{ width: `${progresoPct}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-ink/40">{formatCurrencyUsd(saldoContrato)} bloqueados on-chain</span>
                <span className="text-xs text-ink/40">Meta: {formatCurrencyUsd(meta)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Saldo en contrato', val: formatCurrencyUsd(saldoContrato), color: 'text-brand' },
                { label: 'Falta para la meta', val: formatCurrencyUsd(falta), color: 'text-red-400' },
                { label: 'Fecha de retiro', val: fechaRetiro ?? '—', color: 'text-yellow-500' },
                { label: 'Rendimiento activo', val: `${userRate}% APY`, color: 'text-green-600' },
              ].map(item => (
                <div key={item.label} className="bg-ink/3 border border-ink/6 rounded-xl p-3">
                  <p className="text-xs text-ink/40 mb-1">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {saldoContrato > 0 && (
            <div className="bg-yellow-400/5 border border-dashed border-yellow-400/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-semibold text-ink mb-1">¿Tienes una emergencia?</p>
                  <p className="text-sm text-ink/50 mb-3">
                    Puedes solicitar hasta {formatCurrencyUsd(saldoContrato * MANANA_SEGURO_RATES.loanMaxPct)} USDC
                    ({MANANA_SEGURO_RATES.loanMaxPct * 100}% de tu saldo) sin perder el bloqueo.
                  </p>
                  <span className="inline-block bg-yellow-400/15 text-yellow-600 border border-yellow-400/30 rounded-full px-3 py-1.5 text-xs font-semibold">
                    Ve a la pestaña Autopréstamo →
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Meta alcanzada ── */}
      {fase === 'alcanzada' && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-500/8 border border-green-500/25 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h4 className="font-display font-black text-ink text-2xl mb-2">¡Alcanzaste tu meta de retiro!</h4>
            <p className="font-black text-green-600 mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', letterSpacing: '-2px' }}>
              {formatCurrencyUsd(saldoContrato)} USDC
            </p>
            <p className="text-sm text-ink/45">≈ {formatCurrencyMxn(saldoContrato * 17)} pesos · tipo de cambio $17</p>
          </div>

          <div className="bg-white border border-ink/8 rounded-2xl p-6">
            <h6 className="font-semibold text-ink mb-4">Resumen de tu ahorro</h6>
            <div className="flex flex-col gap-0 mb-5">
              {[
                { label: 'Saldo bloqueado total', val: formatCurrencyUsd(saldoContrato), color: 'text-ink' },
                { label: 'Tasa Etherfuse aplicada', val: `${userRate}% APY`, color: 'text-green-600' },
                { label: 'Tasa bruta CETES', val: `${cetesRate}%`, color: 'text-ink/50' },
                { label: 'Comisión plataforma (1%)', val: formatCurrencyUsd(saldoContrato * 0.01), color: 'text-red-400' },
                { label: 'Fecha de retiro', val: fechaRetiro ?? '—', color: 'text-brand' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2.5 border-b border-ink/5">
                  <span className="text-xs text-ink/45">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 mb-5">
              <p className="text-xs text-blue-600/80 leading-relaxed">
                ℹ Al confirmar, el contrato Soroban ejecuta la transferencia directamente a tu
                wallet Freighter. Sin intermediarios. La operación quedará registrada on-chain.
              </p>
            </div>

            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-600/30 cursor-pointer"
              onClick={handleRetirar}>
              🏆 Retirar {formatCurrencyUsd(saldoContrato)} USDC a mi wallet
            </button>
          </div>
        </div>
      )}

      {/* ── Procesando ── */}
      {fase === 'procesando' && (
        <div className="bg-white border border-ink/8 rounded-2xl p-10 text-center">
          <svg className="animate-spin mx-auto mb-4 text-green-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="font-semibold text-ink text-lg mb-1">Procesando tu retiro</p>
          <p className="text-sm text-ink/45 mb-5">Firma la transacción en Freighter...</p>
          <div className="flex flex-col gap-2 items-center">
            {[
              'Verificando elegibilidad en el contrato',
              'Calculando comisión de plataforma (1%)',
              'Preparando transferencia a tu wallet',
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-xs text-ink/40">
                <svg className="animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Exitoso ── */}
      {fase === 'exitoso' && resumenFinal && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-500/8 border border-green-500/25 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h4 className="font-display font-black text-ink text-2xl mb-2">¡Retiro completado!</h4>
            <p className="font-black text-green-600 mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', letterSpacing: '-2px' }}>
              {formatCurrencyUsd(resumenFinal.total)}
            </p>
            <p className="text-sm text-ink/45">transferidos a tu wallet Freighter</p>
          </div>

          <div className="bg-white border border-ink/8 rounded-2xl p-6">
            <h6 className="font-semibold text-ink mb-4">Resumen de tu retiro</h6>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Aportado estimado', val: formatCurrencyUsd(resumenFinal.totalAportado), color: 'text-brand' },
                { label: 'Rendimiento Etherfuse', val: formatCurrencyUsd(resumenFinal.rendimiento), color: 'text-green-600' },
                { label: 'Comisión plataforma (1%)', val: `−${formatCurrencyUsd(resumenFinal.comision)}`, color: 'text-red-400' },
                { label: 'Total recibido', val: formatCurrencyUsd(resumenFinal.total), color: 'text-ink', bold: true },
              ].map(item => (
                <div key={item.label} className="bg-ink/3 border border-ink/6 rounded-xl p-3">
                  <p className="text-xs text-ink/40 mb-1">{item.label}</p>
                  <p className={`font-bold ${item.bold ? 'text-base' : 'text-sm'} ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-ink/40 mb-1">En pesos mexicanos</p>
              <p className="font-black text-green-600" style={{ fontSize: 'clamp(1.4rem,3vw,1.8rem)', letterSpacing: '-1px' }}>
                {formatCurrencyMxn(resumenFinal.total * 17)}
              </p>
            </div>

            {txHash && (
              <div className="bg-green-500/6 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 mb-1">✅ Transacción confirmada en Stellar</p>
                <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs font-mono text-brand hover:text-brand-dark transition-colors">
                  Ver en Stellar Expert → {txHash.slice(0, 20)}...
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {fase === 'error' && (
        <div className="bg-white border border-ink/8 rounded-2xl p-8">
          <div className="text-center mb-5">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-ink mb-1">Algo salió mal</p>
            <p className="text-sm text-ink/45">{errorMsg}</p>
          </div>
          <button
            className="w-full border border-ink/15 text-ink font-semibold py-3 rounded-xl hover:bg-ink/5 transition-all cursor-pointer"
            onClick={verificarEstado}>
            Reintentar
          </button>
        </div>
      )}

    </div>
  )
}