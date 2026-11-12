import { CURRENCIES } from '../data/constants'

// Module-level currency state — set by App on every render
let _currencyCode = 'USD'
export const setCurrencyCode = (code) => { _currencyCode = code }
export const getCurrency = () => CURRENCIES[_currencyCode] || CURRENCIES.USD

export function fmt(n, abbr = false) {
  const C = getCurrency()
  const sym = C.symbol
  const a = Math.abs(n)
  const neg = n < 0
  if (abbr) {
    if (a >= 1_000_000) return (neg ? '-' : '') + sym + (a / 1_000_000).toFixed(1) + 'M'
    if (a >= 1_000)     return (neg ? '-' : '') + sym + (a / 1_000).toFixed(1) + 'k'
  }
  const str = a.toLocaleString(C.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (C.code === 'SEK') return (neg ? '-' : '') + str + '\u00a0kr'
  return (neg ? '-' : '') + sym + str
}

export const pct  = (a, b) => b ? ((a / b) * 100).toFixed(1) + '%' : '0%'
export const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v))

export function calcHealthScore({ savingsRate, dti, netSurplus, goals, totalDebt, totalIncome }) {
  return Math.round(clamp(
    (savingsRate >= 20 ? 30 : savingsRate >= 10 ? 20 : 10) +
    (dti <= 20 ? 25 : dti <= 35 ? 18 : 8) +
    (netSurplus > 0 ? 20 : 0) +
    (goals.length >= 2 ? 15 : 8) +
    (totalDebt / Math.max(totalIncome * 12, 1) < 2 ? 10 : 5),
    0, 100
  ))
}

export function buildCashflow(totalIncome, totalExpenses) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const variance = [0.92, 0.95, 0.97, 0.98, 0.99, 1.00]
  return months.map((m, i) => {
    const income  = Math.round(totalIncome  * variance[i] * (0.96 + Math.random() * 0.06))
    const expense = Math.round(totalExpenses * variance[i] * (0.96 + Math.random() * 0.06))
    return { m, income, expense, net: income - expense }
  })
}
