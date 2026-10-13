import PropTypes from 'prop-types'
import { cn } from '../lib/cn'
import { formatCurrency } from '../lib/format'

export function SummaryCard({ label, value, currency, icon: Icon, tone = 'neutral', hint, loading }) {
  const tones = {
    neutral: 'text-slate-100',
    success: 'text-accent',
    danger: 'text-danger',
    warn: 'text-warn',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center">
            <Icon size={15} className="text-muted" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="skeleton h-8 w-32 mt-3" />
      ) : (
        <p className={cn('mt-3 text-2xl font-semibold tabular-nums', tones[tone])}>
          {typeof value === 'number' ? formatCurrency(value, currency) : value}
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currency: PropTypes.string,
  icon: PropTypes.elementType,
  tone: PropTypes.oneOf(['neutral', 'success', 'danger', 'warn']),
  hint: PropTypes.string,
  loading: PropTypes.bool,
}
