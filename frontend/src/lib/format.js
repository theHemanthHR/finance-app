export function formatCurrency(amount, currencyCode = 'INR', { compact = false } = {}) {
  const value = Number(amount ?? 0)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 2,
    }).format(value)
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value ?? 0))
}

export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(1)}%`
}

export function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function toIsoDate(date) {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function firstDayOfMonthIso(date = new Date()) {
  return toIsoDate(monthStart(date))
}

export function lastDayOfMonthIso(date = new Date()) {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}
