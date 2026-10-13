import PropTypes from 'prop-types'
import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

export const Select = forwardRef(function Select({ className, error, children, ...rest }, ref) {
  return (
    <>
      <select ref={ref} className={cn('input appearance-none', error && 'border-danger/70', className)} {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </>
  )
})

Select.propTypes = { className: PropTypes.string, error: PropTypes.string, children: PropTypes.node }
