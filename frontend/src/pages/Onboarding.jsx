import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { authApi } from '../api/authApi'
import { categoryApi } from '../api/categoryApi'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'

export default function Onboarding() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(0)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })

  const mutation = useMutation({
    mutationFn: () => authApi.completeOnboarding(),
    onSuccess: async () => {
      await refresh()
      qc.invalidateQueries()
      toast.success('You are all set')
      navigate('/dashboard', { replace: true })
    },
    onError: () => toast.error('Could not complete onboarding'),
  })

  const steps = ['Welcome', 'Your preferences', 'Categories', 'Ready']

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= step ? 'bg-accent text-slate-900' : 'bg-surface2 text-muted'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            {i < steps.length - 1 && <span className={`h-px w-8 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              <Sparkles size={20} />
            </span>
            <div>
              <h1 className="text-xl font-semibold">Welcome to Finora, {user?.name}</h1>
              <p className="text-sm text-muted">Let&apos;s take 30 seconds to set things up.</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted">
            Finora converts every transaction into your reporting currency so your reports stay consistent,
            even when you spend in different currencies.
          </p>
          <Button className="mt-6" onClick={() => setStep(1)}>Continue</Button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardTitle>Your preferences</CardTitle>
          <dl className="space-y-4">
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-sm text-muted">Name</dt>
              <dd className="text-sm font-medium">{user?.name}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-sm text-muted">Reporting currency</dt>
              <dd className="text-sm font-medium">{user?.baseCurrencyCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted">Timezone</dt>
              <dd className="text-sm font-medium">{user?.timezone}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted">
            You can change your name and timezone later in Settings. The reporting currency is locked in
            version 1 to keep historical conversions stable.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardTitle>Review your default categories</CardTitle>
          <p className="text-sm text-muted mb-4">
            We created {categories.length} starter categories. You can rename, archive or add more at any time.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="chip bg-surface2 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color || '#64748B' }} />
                {c.name}
              </span>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardTitle>You&apos;re ready</CardTitle>
          <p className="text-sm text-muted">
            Add your first transaction and Finora will start building your dashboard, reports and budgets
            automatically.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Finishing…' : 'Go to dashboard'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
