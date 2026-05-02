import { useState } from 'react'
import ardilla from '../../assets/Ardilla_vector.png'
import { useEtherfuseRate } from '../../hooks/useEtherfuseRate'
import { useAnimatedValue } from '../../hooks/useAnimatedValue'


function CalculadoraHero({ onRegister }) {
    const { userRate, cetesRate, isLive, loading } = useEtherfuseRate()
    const apy = userRate > 0 ? userRate : 4.7
    const [cuota, setCuota] = useState(25)
    const [anios, setAnios] = useState(20)

    const total = (() => {
        const r = apy / 100 / 12
        const n = anios * 12
        if (r === 0) return cuota * n
        return cuota * ((Math.pow(1 + r, n) - 1) / r)
    })()

    const { display, key } = useAnimatedValue(Math.round(total))

    return (
        <>
            <div className="relative">

                <img
                    src={ardilla}
                    alt="Mascota Mañana Seguro"
                    className="absolute -top-20 -right-4 h-40 object-contain z-10 hidden lg:block "
                    style={{ animation: 'floatY 4s ease-in-out infinite' }}
                />

                <div className="relative bg-surface rounded-3xl p-8 border border-ink/8 overflow-hidden shadow-xl shadow-ink/5">


                    {/* Tasa en vivo */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-green-400' : 'bg-yellow-400'}`}
                            style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
                        <span className="text-xs text-gray font-medium">
                            {loading ? 'Cargando tasa...' : isLive
                                ? `Tasa CETES en vivo · ${cetesRate.toFixed(2)}% bruto`
                                : `Tasa referencial · ${cetesRate.toFixed(2)}%`}
                        </span>
                    </div>

                    {/* Resultado */}
                    <div className="bg-brand/20 rounded-2xl px-6 py-5 mb-6">
                        <p className="text-xs text-gray uppercase tracking-widest mb-1">
                            Proyección a {anios} años
                        </p>
                        <div key={key} className="font-display font-black text-brand leading-none mb-1"
                            style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', letterSpacing: '-2px', animation: 'countUp .25s ease both' }}>
                            ${display.toLocaleString('es-MX')}
                        </div>
                        <p className="text-xs text-gray mt-1">USDC · a {apy.toFixed(2)}% APY neto</p>
                    </div>

                    {/* Slider cuota */}
                    <div className="mb-5">
                        <div className="flex justify-between mb-2">
                            <label id="cuota-label" className="text-xs text-gray font-medium">Aporte mensual</label>
                            <span className="text-xs font-bold text-ink">${cuota} USDC</span>
                        </div>
                        <input type="range" className="w-full accent-brand" min={2} max={500} step={1}
                            value={cuota} onChange={e => setCuota(Number(e.target.value))}
                            aria-labelledby="cuota-label" />
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray/70">$2</span>
                            <span className="text-xs text-gray/70">$500</span>
                        </div>
                    </div>

                    {/* Slider años */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <label id="anios-label" className="text-xs text-gray font-medium">Tiempo de ahorro</label>
                            <span className="text-xs font-bold text-ink">{anios} años</span>
                        </div>
                        <input type="range" className="w-full accent-brand" min={1} max={40} step={1}
                            value={anios} onChange={e => setAnios(Number(e.target.value))}
                            aria-labelledby="anios-label" />
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray/70">1 año</span>
                            <span className="text-xs text-gray/70">40 años</span>
                        </div>
                    </div>

                    <button
                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand"
                        onClick={onRegister}>
                        Empezar a ahorrar →
                    </button>

                </div>
            </div>
        </>
    );
}
export default CalculadoraHero;