import { useRef } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'


function TresPasos() {
    const ref = useRef(null)
    const visible = useScrollReveal(ref)

    const pasos = [
        {
            num: '01', icon: '🔗', titulo: 'Conecta tu wallet',
            desc: 'Usa Freighter en Stellar Testnet. Sin banco, sin papeleo, sin esperas de 3 días.'
        },
        {
            num: '02', icon: '💸', titulo: 'Deposita USDC',
            desc: 'Desde $2 USDC. Fondos blindados en contrato Soroban — ni nosotros podemos tocarlos.'
        },
        {
            num: '03', icon: '📈', titulo: 'Gana rendimiento',
            desc: 'Tu dinero crece con la tasa CETES real vía Etherfuse. Retiras al cumplir tu meta.'
        },
    ]

    return (
        <>
            <section className="py-24 bg-surface relative overflow-hidden" ref={ref}>
                <div className="container mx-auto">

                    {/* Header */}
                    <div className={`max-w-2xl mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <span className="inline-block bg-brand text-white border border-brand rounded-lg px-6 py-2 text-xs font-semibold tracking-wide mb-4">
                            ¿Cómo funciona?
                        </span>
                        <h2 className="font-display font-black text-ink tracking-tight"
                            style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05 }}>
                            Tres pasos.{' '}
                            <em className="font-bold italic text-ink/30">Nada más.</em>
                        </h2>
                    </div>

                    {/* Cards */}
                    <div className="grid md:grid-cols-3 gap-5">
                        {pasos.map((p, i) => (
                            <div key={p.num}
                                className={`group relative bg-white rounded-2xl p-7 border border-ink/8 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/8 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                                style={{ transitionDelay: `${i * 120}ms` }}>

                                {/* Número de fondo */}
                                <div className="absolute top-0 right-2 font-display font-black leading-none text-ink/[0.04] group-hover:text-brand/70 transition-colors duration-500 pointer-events-none select-none"
                                    style={{ fontSize: '7rem' }}>
                                    {p.num}
                                </div>

                                {/* Ícono */}
                                <div className="relative w-12 h-12 rounded-2xl bg-ink flex items-center justify-center mb-6 text-xl group-hover:bg-brand group-hover:-rotate-6 transition-all duration-300">
                                    {p.icon}
                                </div>

                                <h3 className="font-display font-bold text-ink text-lg mb-2">{p.titulo}</h3>
                                <p className="text-sm text-ink/55 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
}
export default TresPasos;