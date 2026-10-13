import PropTypes from 'prop-types'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card p-6 text-center">
      <AlertTriangle className="mx-auto text-warn mb-3" size={26} />
      <p className="text-sm text-slate-200">{message || 'Unable to load data.'}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}

ErrorState.propTypes = { message: PropTypes.string, onRetry: PropTypes.func }
