import { plannerDefaults } from '../../../data/retirementContent'
import { useRetirementProjection } from '../../../hooks/useRetirementProjection'
import {
  formatCurrencyMxn,
  formatCurrencyUsd,
  formatPercentage,
} from '../../../utils/formatters'
import { SectionCard } from '../../../components/common/SectionCard'

export function ContributionPlanner() {
  const { scenario, projection, updateScenario } = useRetirementProjection(
    plannerDefaults,
  )

  return (
    <>
      <SectionCard>
        <h3>Simulador base</h3>
        <p className="planner-copy">
          Punto de partida para la pantalla de captacion: cuanto ahorras, cuantos
          anos bloqueas y que rendimiento esperas.
        </p>

        <form className="planner-form">
          <div className="planner-field">
            <label htmlFor="monthlyDepositUsd">Aportacion mensual en USDC</label>
            <input
              id="monthlyDepositUsd"
              min="1"
              step="1"
              type="number"
              value={scenario.monthlyDepositUsd}
              onChange={(event) => updateScenario('monthlyDepositUsd', event.target.value)}
            />
          </div>

          <div className="planner-field">
            <label htmlFor="yearsToRetirement">Anos al retiro</label>
            <input
              id="yearsToRetirement"
              min="1"
              step="1"
              type="number"
              value={scenario.yearsToRetirement}
              onChange={(event) => updateScenario('yearsToRetirement', event.target.value)}
            />
          </div>

          <div className="planner-field">
            <label htmlFor="annualYieldRate">Rendimiento anual proyectado</label>
            <input
              id="annualYieldRate"
              max="20"
              min="1"
              step="0.5"
              type="number"
              value={scenario.annualYieldRate}
              onChange={(event) => updateScenario('annualYieldRate', event.target.value)}
            />
          </div>
        </form>

        <p className="planner-footnote">
          Referencia rapida: {formatCurrencyMxn(200)} pueden convertirse en una
          microaportacion recurrente en la demo.
        </p>
      </SectionCard>

      <SectionCard>
        <h3>Lectura rapida del escenario</h3>
        <div className="projection-grid">
          <div className="projection-highlight">
            <strong>{formatCurrencyUsd(projection.projectedBalance)}</strong>
            <span>Balance proyectado al retiro</span>
          </div>

          <div className="projection-highlight">
            <strong>{formatCurrencyUsd(projection.growthAmount)}</strong>
            <span>Ganancia estimada por rendimiento</span>
          </div>
        </div>

        <ul className="list-card">
          <li>Aportado por la persona: {formatCurrencyUsd(projection.investedAmount)}</li>
          <li>
            Ingreso mensual estimado:{' '}
            {formatCurrencyUsd(projection.estimatedMonthlyIncome)}
          </li>
          <li>Tasa usada en esta vista: {formatPercentage(scenario.annualYieldRate)}</li>
        </ul>
      </SectionCard>
    </>
  )
}
