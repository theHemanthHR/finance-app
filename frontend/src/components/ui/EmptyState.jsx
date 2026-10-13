import PropTypes from 'prop-types'
import { Inbox } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
        <Icon size={22} className="text-muted" />
      </div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
}
