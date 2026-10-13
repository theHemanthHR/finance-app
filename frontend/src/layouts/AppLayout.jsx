import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { AddTransactionButton } from '../components/AddTransactionButton'
import { useAuth } from '../context/AuthContext'
import { CardSkeleton } from '../components/ui/Skeleton'

export function AppLayout() {
  const { isAuthenticated, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen p-6 grid gap-4 max-w-5xl mx-auto">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-bg/80 backdrop-blur border-b border-border flex items-center justify-between px-4 sm:px-6">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface2"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <AddTransactionButton />
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
