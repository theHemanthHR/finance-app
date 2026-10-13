import PropTypes from 'prop-types'
import { cn } from '../../lib/cn'

export function Skeleton({ className }) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function CardSkeleton({ rows = 4 }) {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  )
}

Skeleton.propTypes = { className: PropTypes.string }
CardSkeleton.propTypes = { rows: PropTypes.number }
