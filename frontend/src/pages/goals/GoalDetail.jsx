import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { goalApi } from '../../api/goalApi'
import { contributionSchema } from '../../schemas/goalSchema'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, toIsoDate } from '../../lib/format'
import { toApiError } from '../../api/axios'

export default function GoalDetail() {
  const { id } = useParams()
  const qc = useQueryClient()

  const { data: goal, isLoading } = useQuery({ queryKey: ['goal', id], queryFn: () => goalApi.get(id) })
  const { data: contributions = [] } = useQuery({
    queryKey: ['goal', id, 'contributions'],
    queryFn: () => goalApi.contributions(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: '', contributionDate: toIsoDate(new Date()), note: '' },
  })

  const mutation = useMutation({
    mutationFn: (v) => goalApi.contribute(id, {
      amount: Number(v.amount), contributionDate: v.contributionDate, note: v.note || null,
    }),
    onSuccess: () => {
      toast.success('Contribution added')
      qc.invalidateQueries()
      reset({ amount: '', contributionDate: toIsoDate(new Date()), note: '' })
    },
    onError: (err) => toast.error(toApiError(err).message),
  })

  if (isLoading) return <CardSkeleton rows={6} />
  if (!goal) return <EmptyState title="Goal not found" />

  const currency = goal.currencyCode

  return (
    <div className="space-y-6">
      <Link to="/goals" className="inline-flex items-center gap-2 text-sm text-muted hover:text-slate-200">
        <ArrowLeft size={15} /> Back to goals
      </Link>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{goal.name}</h1>
              <div className="mt-2"><Badge tone={goal.status === 'COMPLETED' ? 'success' : 'neutral'}>{goal.status}</Badge></div>
            </div>
          </div>
          {goal.description && <p className="mt-4 text-sm text-muted">{goal.description}</p>}

          <div className="mt-6 h-3 rounded-full bg-surface2 overflow-hidden">
            <div className="h-full rounded-full bg-accent"
                 style={{ width: `${Math.min(Number(goal.percentage), 100)}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted">Saved</p>
              <p className="mt-1 font-semibold text-accent tabular-nums">
                {formatCurrency(goal.contributedAmount, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Target</p>
              <p className="mt-1 font-semibold tabular-nums">{formatCurrency(goal.targetAmount, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Remaining</p>
              <p className="mt-1 font-semibold tabular-nums">{formatCurrency(goal.remainingAmount, currency)}</p>
            </div>
          </div>

          {goal.targetDate && (
            <p className="mt-5 text-xs text-muted text-center">Target date: {formatDate(goal.targetDate)}</p>
          )}
        </Card>

        <Card>
          <CardTitle>Add contribution</CardTitle>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div>
              <label className="label" htmlFor="c-amount">Amount ({currency})</label>
              <Input id="c-amount" type="number" step="0.01" min="0"
                     error={errors.amount?.message} {...register('amount')} />
            </div>
            <div>
              <label className="label" htmlFor="c-date">Date</label>
              <Input id="c-date" type="date" error={errors.contributionDate?.message}
                     {...register('contributionDate')} />
            </div>
            <div>
              <label className="label" htmlFor="c-note">Note (optional)</label>
              <Input id="c-note" placeholder="e.g. Monthly transfer" {...register('note')} />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              <Plus size={15} /> {mutation.isPending ? 'Adding…' : 'Add contribution'}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardTitle>Contribution history</CardTitle>
        {contributions.length === 0 ? (
          <EmptyState title="No contributions yet" description="Add your first contribution above." />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Note</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted whitespace-nowrap">{formatDate(c.contributionDate)}</td>
                    <td className="py-2.5">{c.note || '—'}</td>
                    <td className="py-2.5 text-right tabular-nums text-accent">
                      {formatCurrency(c.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
