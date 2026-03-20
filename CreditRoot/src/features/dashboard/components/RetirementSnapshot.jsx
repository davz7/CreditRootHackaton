import { dashboardHighlights } from '../../../data/retirementContent'
import { SectionCard } from '../../../components/common/SectionCard'

export function RetirementSnapshot() {
  return (
    <>
      <SectionCard>
        <span className="status-pill status-pill--warning">Vista objetivo</span>
        <h3>Dashboard del ahorrador</h3>
        <ul className="list-card">
          {dashboardHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard>
        <h3>Modulos a desarrollar despues</h3>
        <ul className="list-card">
          <li>Historial de aportaciones y rendimiento mensual.</li>
          <li>Bloqueo hasta fecha objetivo y excepciones por emergencia.</li>
          <li>Vista de movimientos on-chain y estado del contrato Soroban.</li>
        </ul>
      </SectionCard>
    </>
  )
}
