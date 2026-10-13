import PropTypes from 'prop-types'
import { cn } from '../../lib/cn'

export function Button({ variant = 'primary', className, children, ...rest }) {
  const variants = { primary: 'btn-primary', ghost: 'btn-ghost', danger: 'btn-danger' }
  return (
    <button className={cn(variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger']),
  className: PropTypes.string,
  children: PropTypes.node,
}
