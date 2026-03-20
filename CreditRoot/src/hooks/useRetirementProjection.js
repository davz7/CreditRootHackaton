import { useMemo, useState } from 'react'
import { calculateRetirementProjection } from '../utils/projections'

export function useRetirementProjection(initialScenario) {
  const [scenario, setScenario] = useState(initialScenario)

  const projection = useMemo(
    () => calculateRetirementProjection(scenario),
    [scenario],
  )

  function updateScenario(field, value) {
    setScenario((currentScenario) => ({
      ...currentScenario,
      [field]: Number(value),
    }))
  }

  return {
    scenario,
    projection,
    updateScenario,
  }
}
