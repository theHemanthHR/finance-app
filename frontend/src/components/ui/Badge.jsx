import PropTypes from 'prop-types'
import { cn } from '../../lib/cn'

export function Badge({ tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-surface2 text-slate-300',
    success: 'bg-accent/15 text-accent',
    warning: 'bg-warn/15 text-warn',
    danger:  'bg-danger/15 text-danger',
  }
  return <span className={cn('chip', tones[tone], className)}>{children}</span>
}

Badge.propTypes = {
  tone: PropTypes.oneOf(['neutral', 'success', 'warning', 'danger']),
  children: PropTypes.node,
  className: PropTypes.string,
}
