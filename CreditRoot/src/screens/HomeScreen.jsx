import { ConnectAccountCard } from '../features/access/components/ConnectAccountCard'
import { useNavigate } from 'react-router-dom'

export function HomeScreen({ usuario }) {
  const navigate = useNavigate()

  const stats = [
    { val: '32M', label: 'Mexicanos sin pensión', color: 'text-brand' },
    { val: '4.7% APY', label: 'Rendimiento en USDC', color: 'text-green-600' },
    { val: '$2 USDC', label: 'Para empezar', color: 'text-brand' },
    { val: '1%', label: 'Comisión plataforma', color: 'text-ink/60' },
  ]

  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Copy izquierdo */}
          <div className="anim-fade-up-1">
            <span className="inline-block bg-brand/10 text-brand-dark border border-brand/20 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide mb-6">
              🔒 Ahorro para retiro · Etherfuse CETES · Stellar
            </span>

            <h2 className="font-display font-black text-ink tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.2rem,5vw,3.2rem)', lineHeight: 1.05 }}>
              Mañana Seguro,<br />
              <em className="text-brand italic">empieza hoy.</em>
            </h2>

            <p className="text-ink/50 text-lg leading-relaxed max-w-md mb-8">
              Conecta tu wallet Freighter, deposita desde $2 USDC y bloquea
              tu ahorro en contrato inteligente. Sin banco, sin IMSS, sin burocracia.
            </p>

            <div className="flex gap-3 flex-wrap mb-10">
              <button
                className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand/30 cursor-pointer"
                onClick={() => navigate('/planner')}>
                Ver simulador →
              </button>
              <button
                className="border-[1.5px] border-ink/20 text-ink font-semibold px-6 py-3.5 rounded-xl hover:bg-ink/5 hover:border-ink/30 transition-all cursor-pointer"
                onClick={() => navigate('/dashboard')}>
                Mi dashboard
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="bg-white border border-ink/8 rounded-2xl p-4">
                  <div className={`font-display font-black text-2xl mb-1 ${s.color}`}>{s.val}</div>
                  <div className="text-sm text-ink/45">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ConnectAccountCard */}
          <div className="anim-fade-up-2">
            <div className="bg-white rounded-3xl p-8 border border-ink/8 shadow-xl shadow-ink/5">
              <ConnectAccountCard walletAddress={usuario?.walletAddress} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}