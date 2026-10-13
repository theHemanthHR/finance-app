import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { goalApi } from '../../api/goalApi'
import { goalSchema } from '../../schemas/goalSchema'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '../../lib/format'
import { toApiError } from '../../api/axios'

export default function Goals() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data: goals = [], isLoading } = useQuery({ queryKey: ['goals'], queryFn: () => goalApi.list() })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', description: '', targetAmount: '', targetDate: '' },
  })

  const createMutation = useMutation({
    mutationFn: (v) => goalApi.create({
      name: v.name,
      description: v.description || null,
      targetAmount: Number(v.targetAmount),
      targetDate: v.targetDate || null,
    }),
    onSuccess: () => { toast.success('Goal created'); qc.invalidateQueries(); setOpen(false); reset() },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => goalApi.remove(id),
    onSuccess: () => { toast.success('Goal deleted'); qc.invalidateQueries(); setDeleting(null) },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const currency = goals[0]?.currencyCode || 'INR'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Savings goals</h1>
          <p className="text-sm text-muted mt-1">
            Contributions are tracked separately from expenses so your spending reports stay accurate.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={15} /> New goal</Button>
      </div>

      {isLoading ? <CardSkeleton rows={5} /> : goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No savings goals yet"
                      description="Create a goal and start tracking contributions toward it."
                      action={<Button onClick={() => setOpen(true)}>Create a goal</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g) => (
            <Card key={g.id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/goals/${g.id}`} className="font-medium hover:text-accent">{g.name}</Link>
                  <div className="mt-1.5">
                    <Badge tone={g.status === 'COMPLETED' ? 'success' : 'neutral'}>{g.status}</Badge>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface2 text-danger"
                        onClick={() => setDeleting(g)} aria-label="Delete goal">
                  <Trash2 size={15} />
                </button>
              </div>

              {g.description && <p className="mt-3 text-sm text-muted line-clamp-2">{g.description}</p>}

              <div className="mt-4 h-2 rounded-full bg-surface2 overflow-hidden">
                <div className="h-full rounded-full bg-accent"
                     style={{ width: `${Math.min(Number(g.percentage), 100)}%` }} />
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted">Saved</span>
                <span className="tabular-nums text-accent">{formatCurrency(g.contributedAmount, currency)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted">Target</span>
                <span className="tabular-nums">{formatCurrency(g.targetAmount, currency)}</span>
              </div>
              {g.targetDate && (
                <p className="mt-3 text-xs text-muted">Target date: {formatDate(g.targetDate)}</p>
              )}

              <Link to={`/goals/${g.id}`} className="mt-4 block">
                <Button variant="ghost" className="w-full">View & contribute</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New savings goal" size="sm"
             footer={
               <>
                 <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                 <Button type="submit" form="goal-form" disabled={createMutation.isPending}>
                   {createMutation.isPending ? 'Creating…' : 'Create goal'}
                 </Button>
               </>
             }>
        <form id="goal-form" onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <label className="label" htmlFor="g-name">Name</label>
            <Input id="g-name" placeholder="e.g. Emergency fund" error={errors.name?.message} {...register('name')} />
          </div>
          <div>
            <label className="label" htmlFor="g-desc">Description (optional)</label>
            <textarea id="g-desc" rows={2} className="input resize-none" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="g-amount">Target amount</label>
              <Input id="g-amount" type="number" step="0.01" min="0"
                     error={errors.targetAmount?.message} {...register('targetAmount')} />
            </div>
            <div>
              <label className="label" htmlFor="g-date">Target date</label>
              <Input id="g-date" type="date" error={errors.targetDate?.message} {...register('targetDate')} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete savings goal"
        message={`Delete "${deleting?.name}" and all of its contribution history? This cannot be undone.`}
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
