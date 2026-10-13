import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { CalendarClock, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { recurringApi } from '../../api/recurringApi'
import { categoryApi } from '../../api/categoryApi'
import { currencyApi } from '../../api/currencyApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatCurrency, formatDate, toIsoDate } from '../../lib/format'
import { toApiError } from '../../api/axios'

export default function Recurring() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['recurring'], queryFn: () => recurringApi.list(),
  })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })
  const { data: currencies = [] } = useQuery({ queryKey: ['currencies'], queryFn: () => currencyApi.list() })

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      categoryId: '', description: '', amount: '', currencyCode: 'INR',
      frequency: 'MONTHLY', intervalValue: 1, startDate: toIsoDate(new Date()), endDate: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (v) => recurringApi.create({
      ...v,
      amount: Number(v.amount),
      intervalValue: Number(v.intervalValue),
      endDate: v.endDate || null,
    }),
    onSuccess: () => { toast.success('Recurring rule created'); qc.invalidateQueries(); setOpen(false); reset() },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => recurringApi.update(id, { active }),
    onSuccess: () => { toast.success('Rule updated'); qc.invalidateQueries() },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => recurringApi.remove(id),
    onSuccess: () => { toast.success('Rule deleted'); qc.invalidateQueries(); setDeleting(null) },
    onError: (err) => toast.error(toApiError(err).message),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recurring expenses</h1>
          <p className="text-sm text-muted mt-1">
            Scheduled expenses generate transactions automatically. They represent scheduled amounts,
            not bank-verified payments.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={15} /> New rule</Button>
      </div>

      {isLoading ? <CardSkeleton rows={5} /> : rules.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarClock} title="No recurring expenses"
                      description="Automate rent, subscriptions and bills so nothing slips through."
                      action={<Button onClick={() => setOpen(true)}>Create a rule</Button>} />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-surface2/60">
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Frequency</th>
                  <th className="px-5 py-3 font-medium">Next due</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface2/40">
                    <td className="px-5 py-3">{r.description}</td>
                    <td className="px-5 py-3 text-muted">{r.categoryName}</td>
                    <td className="px-5 py-3 text-muted">
                      Every {r.intervalValue} {r.frequency.toLowerCase()}
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(r.nextDueDate)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(r.amount, r.currencyCode)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={r.active ? 'success' : 'warning'}>{r.active ? 'ACTIVE' : 'PAUSED'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-surface2"
                                onClick={() => toggleMutation.mutate({ id: r.id, active: !r.active })}
                                aria-label={r.active ? 'Pause rule' : 'Resume rule'}>
                          {r.active ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface2 text-danger"
                                onClick={() => setDeleting(r)} aria-label="Delete rule">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New recurring expense"
             footer={
               <>
                 <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                 <Button type="submit" form="rr-form" disabled={createMutation.isPending}>
                   {createMutation.isPending ? 'Creating…' : 'Create rule'}
                 </Button>
               </>
             }>
        <form id="rr-form" onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <label className="label" htmlFor="rr-desc">Description</label>
            <Input id="rr-desc" placeholder="e.g. Apartment rent" error={errors.description?.message}
                   {...register('description', { required: 'Description is required' })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="rr-cat">Category</label>
              <Select id="rr-cat" error={errors.categoryId?.message}
                      {...register('categoryId', { required: 'Category is required' })}>
                <option value="">Select a category</option>
                {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="label" htmlFor="rr-ccy">Currency</label>
              <Select id="rr-ccy" {...register('currencyCode')}>
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="rr-amt">Amount</label>
              <Input id="rr-amt" type="number" step="0.01" min="0"
                     error={errors.amount?.message} {...register('amount', { required: 'Amount is required' })} />
            </div>
            <div>
              <label className="label" htmlFor="rr-freq">Frequency</label>
              <Select id="rr-freq" {...register('frequency')}>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label" htmlFor="rr-int">Every</label>
              <Input id="rr-int" type="number" min="1" max="60" {...register('intervalValue')} />
            </div>
            <div>
              <label className="label" htmlFor="rr-start">Start date</label>
              <Input id="rr-start" type="date" {...register('startDate', { required: true })} />
            </div>
            <div>
              <label className="label" htmlFor="rr-end">End date (optional)</label>
              <Input id="rr-end" type="date" {...register('endDate')} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete recurring rule"
        message={`Delete "${deleting?.description}"? Already-generated transactions are kept.`}
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
