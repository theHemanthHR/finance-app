import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Repeat, ShieldCheck, Target, Wallet } from 'lucide-react'
import { Button } from '../components/ui/Button'

const FEATURES = [
  { icon: Wallet,     title: 'Track every rupee',    text: 'Log income and expenses across multiple currencies with automatic conversion.' },
  { icon: BarChart3,  title: 'Real analytics',       text: 'Interactive cash-flow, category and comparison reports built from your own data.' },
  { icon: Target,     title: 'Budgets & goals',      text: 'Set monthly category budgets and track progress toward savings goals.' },
  { icon: Repeat,     title: 'Recurring expenses',   text: 'Automate rent, subscriptions and bills — never miss a due date again.' },
  { icon: ShieldCheck, title: 'Private by default',  text: 'Server-managed sessions, CSRF protection and strict per-user data isolation.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-accent text-slate-900 flex items-center justify-center font-bold">F</span>
          <span className="font-semibold text-lg tracking-tight">Finora</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/register"><Button>Get started</Button></Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
        <span className="chip bg-accent/10 text-accent mx-auto">Personal finance, done properly</span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
          Understand where your
          <span className="text-accent"> money actually goes</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          Finora turns raw transactions into clear budgets, savings goals and reports —
          in your own reporting currency.
        </p>
        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <Link to="/register"><Button className="px-6 py-3">Create free account <ArrowRight size={16} /></Button></Link>
          <Link to="/login"><Button variant="ghost" className="px-6 py-3">I already have an account</Button></Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Icon size={19} />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        Finora — a full-stack personal finance tracker. Built with React, Spring Boot and PostgreSQL.
      </footer>
    </div>
  )
}
