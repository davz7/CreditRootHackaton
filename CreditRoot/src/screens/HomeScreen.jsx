import { ConnectAccountCard } from '../features/access/components/ConnectAccountCard'
import { MetricCard } from '../components/common/MetricCard'
import { retirementInsights, retirementStats } from '../data/retirementContent'

export function HomeScreen() {
  return (
    <section id="inicio" className="screen screen--hero">
      <div className="shell-container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow">Retiro voluntario protegido</span>
          <h2 className="hero-title">
            El frontend para explicar por que el retiro tradicional no alcanza.
          </h2>
          <p className="hero-body">
            Esta primera estructura de front esta pensada para el nuevo relato:
            ahorro voluntario en USDC, onboarding accesible y proyeccion clara
            del retiro complementario.
          </p>

          <div className="hero-actions">
            <a className="button-primary" href="#proyeccion">
              Ver simulador
            </a>
            <a className="button-secondary" href="#dashboard">
              Ver estructura del dashboard
            </a>
          </div>

          <div className="screen-grid screen-grid--metrics">
            {retirementStats.map((stat) => (
              <MetricCard
                key={stat.label}
                caption={stat.caption}
                label={stat.label}
                tone={stat.tone}
                value={stat.value}
              />
            ))}
          </div>

          <div className="section-card">
            <h3>Que resuelve esta base de UI</h3>
            <ul className="list-card">
              {retirementInsights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>

        <ConnectAccountCard />
      </div>
    </section>
  )
}
