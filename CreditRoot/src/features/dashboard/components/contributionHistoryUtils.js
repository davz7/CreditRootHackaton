import { MANANA_SEGURO_RATES } from '../../../data/retirementContent'

export function addHistoryEntry(wallet, entry) {
  const history = loadHistory(wallet)
  const updated = [entry, ...history]
  saveHistory(wallet, updated)
  return updated
}

export function buildHistoryEntry(amount, wallet) {
  const history = loadHistory(wallet)
  const prevBalance = history.length > 0 ? history[0].balanceAfter : 0
  const monthlyRate = MANANA_SEGURO_RATES.userRate / 100 / 12
  const yieldAccrued = parseFloat((prevBalance * monthlyRate).toFixed(4))
  return {
    id: Date.now(),
    date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
    type: 'deposito',
    amount,
    yieldAccrued,
    balanceAfter: parseFloat((prevBalance + amount + yieldAccrued).toFixed(4)),
    confirmed: true,
    txHash: null,
  }
}

export function loadHistory(wallet) {
  try {
    const key = `manana_seguro_history_${wallet ?? 'demo'}`
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* storage no disponible */ }
  return []
}

export function saveHistory(wallet, history) {
  try {
    const key = `manana_seguro_history_${wallet ?? 'demo'}`
    localStorage.setItem(key, JSON.stringify(history))
  } catch { /* storage no disponible */ }
}