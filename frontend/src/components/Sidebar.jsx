import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Wallet,
  Repeat, Settings as SettingsIcon, LogOut, X,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions',      icon: ArrowLeftRight },
  { to: '/reports',      label: 'Reports',           icon: PieChart },
  { to: '/budgets',      label: 'Budgets',           icon: Wallet },
  { to: '/goals',        label: 'Savings Goals',     icon: Target },
  { to: '/recurring',    label: 'Recurring',         icon: Repeat },
  { to: '/settings',     label: 'Settings',          icon: SettingsIcon },
]

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-accent text-slate-900 flex items-center justify-center font-bold">F</span>
            <span className="font-semibold tracking-tight">Finora</span>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-surface2" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  isActive ? 'bg-accent/10 text-accent' : 'text-slate-300 hover:bg-surface2 hover:text-slate-100',
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-surface2"
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}

Sidebar.propTypes = { open: PropTypes.bool, onClose: PropTypes.func.isRequired }
