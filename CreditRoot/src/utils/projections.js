export function calculateRetirementProjection({
  monthlyDepositUsd,
  yearsToRetirement,
  annualYieldRate,
}) {
  const months = yearsToRetirement * 12
  const monthlyRate = annualYieldRate / 100 / 12
  const investedAmount = monthlyDepositUsd * months

  let projectedBalance = 0

  for (let month = 0; month < months; month += 1) {
    projectedBalance = (projectedBalance + monthlyDepositUsd) * (1 + monthlyRate)
  }

  const growthAmount = projectedBalance - investedAmount
  const estimatedMonthlyIncome = projectedBalance * 0.04 / 12

  return {
    investedAmount,
    projectedBalance,
    growthAmount,
    estimatedMonthlyIncome,
  }
}
