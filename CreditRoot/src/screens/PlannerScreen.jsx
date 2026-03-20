import { SectionHeading } from '../components/common/SectionHeading'
import { ContributionPlanner } from '../features/planner/components/ContributionPlanner'

export function PlannerScreen() {
  return (
    <section id="proyeccion" className="screen">
      <div className="shell-container">
        <SectionHeading
          eyebrow="Pantalla 01"
          title="Simulador de ahorro para retiro"
          description="Aqui vive la primera experiencia que deberia entender cualquier usuario: si aportas poco pero constante, cuanto puedes construir en dolares para tu retiro."
        />

        <div className="planner-layout">
          <ContributionPlanner />
        </div>
      </div>
    </section>
  )
}
