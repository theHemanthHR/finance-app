import PropTypes from 'prop-types'
import { cn } from '../../lib/cn'

export function Card({ className, children }) {
  return <div className={cn('card p-5', className)}>{children}</div>
}

export function CardTitle({ children, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <h3 className="text-sm font-semibold text-slate-200">{children}</h3>
      {action}
    </div>
  )
}

Card.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardTitle.propTypes = { children: PropTypes.node, action: PropTypes.node }
