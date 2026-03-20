import { SectionHeading } from '../components/common/SectionHeading'
import { RetirementSnapshot } from '../features/dashboard/components/RetirementSnapshot'

export function DashboardScreen() {
  return (
    <section id="dashboard" className="screen">
      <div className="shell-container">
        <SectionHeading
          eyebrow="Pantalla 02"
          title="Dashboard del ahorro bloqueado"
          description="Esta seccion marca la estructura de lo que despues sera el panel principal del usuario: progreso, aportaciones, rendimiento y reglas del contrato."
        />

        <div className="dashboard-layout">
          <RetirementSnapshot />
        </div>
      </div>
    </section>
  )
}
