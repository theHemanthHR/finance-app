import PropTypes from 'prop-types'
import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

export const Input = forwardRef(function Input({ className, error, ...rest }, ref) {
  return (
    <>
      <input ref={ref} className={cn('input', error && 'border-danger/70', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </>
  )
})

Input.propTypes = { className: PropTypes.string, error: PropTypes.string }
