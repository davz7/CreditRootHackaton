import { ContributionPlanner } from '../features/planner/components/ContributionPlanner'
import { useEtherfuseRate } from '../hooks/useEtherfuseRate'

export function PlannerScreen() {
  const { userRate, loading } = useEtherfuseRate()

  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="container mx-auto px-4">

        <div className="mb-8 anim-fade-up-1">
          <span className="inline-block bg-brand/10 text-brand-dark border border-brand/20 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide mb-4">
            Simulador · Mañana Seguro
          </span>
          <h2 className="font-display font-black text-ink tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', lineHeight: 1.05 }}>
            ¿Cuánto puedes ahorrar?
          </h2>
          <p className="text-ink/50 text-lg max-w-xl">
            Desde $2 USDC, con rendimiento Etherfuse al{' '}
            <span className="text-green-600 font-bold">
              {loading ? '...' : `${userRate}%`}
            </span>
            {' '}e incentivos cada 5 años. Así crece tu retiro con constancia.
          </p>
        </div>

        <div className="anim-fade-up-2">
          <ContributionPlanner />
        </div>

      </div>
    </section>
  )
}