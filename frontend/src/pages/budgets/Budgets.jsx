import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'

import { budgetApi } from '../../api/budgetApi'
import { categoryApi } from '../../api/categoryApi'
import { budgetSchema } from '../../schemas/budgetSchema'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatCurrency, firstDayOfMonthIso, toIsoDate } from '../../lib/format'
import { toApiError } from '../../api/axios'

export default function Budgets() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(firstDayOfMonthIso())
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetApi.list(month),
  })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { categoryId: '', monthStart: month, limitAmountBase: '' },
  })

  const createMutation = useMutation({
    mutationFn: (values) => budgetApi.create({
      ...values,
      monthStart: month,
      limitAmountBase: Number(values.limitAmountBase),
    }),
    onSuccess: () => {
      toast.success('Budget created')
      qc.invalidateQueries()
      setOpen(false)
      reset()
    },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetApi.remove(id),
    onSuccess: () => { toast.success('Budget removed'); qc.invalidateQueries(); setDeleting(null) },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const currency = budgets[0]?.currencyCode || 'INR'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted mt-1">Set monthly spending limits per category.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input type="month" value={month.slice(0, 7)}
                 onChange={(e) => setMonth(toIsoDate(new Date(`${e.target.value}-01T00:00:00`)))} />
          <Button onClick={() => setOpen(true)}><Plus size={15} /> New budget</Button>
        </div>
      </div>

      {isLoading ? <CardSkeleton rows={5} /> : budgets.length === 0 ? (
        <Card>
          <EmptyState icon={Wallet} title="No budgets for this month"
                      description="Create a budget to keep category spending under control."
                      action={<Button onClick={() => setOpen(true)}>Create a budget</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(Number(b.percentageUsed), 100)
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${b.categoryColor || '#64748B'}22`, color: b.categoryColor || '#64748B' }}>
                      <Wallet size={16} />
                    </span>
                    <div>
                      <p className="font-medium">{b.categoryName}</p>
                      <p className="text-xs text-muted">{b.overBudget ? 'Over budget' : `${b.percentageUsed}% used`}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-surface2 text-danger"
                          onClick={() => setDeleting(b)} aria-label="Delete budget">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mt-4 h-2 rounded-full bg-surface2 overflow-hidden">
                  <div className={`h-full rounded-full ${b.overBudget ? 'bg-danger' : 'bg-accent'}`}
                       style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted">Spent</span>
                  <span className="tabular-nums">{formatCurrency(b.spentAmount, currency)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-muted">Limit</span>
                  <span className="tabular-nums">{formatCurrency(b.limitAmount, currency)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm font-medium">
                  <span className="text-muted">Remaining</span>
                  <span className={`tabular-nums ${b.overBudget ? 'text-danger' : 'text-accent'}`}>
                    {formatCurrency(b.remainingAmount, currency)}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New budget" size="sm"
             footer={
               <>
                 <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                 <Button type="submit" form="budget-form" disabled={createMutation.isPending}>
                   {createMutation.isPending ? 'Creating…' : 'Create budget'}
                 </Button>
               </>
             }>
        <form id="budget-form" onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <label className="label" htmlFor="b-cat">Expense category</label>
            <Select id="b-cat" error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">Select a category</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="label" htmlFor="b-limit">Monthly limit</label>
            <Input id="b-limit" type="number" step="0.01" min="0" placeholder="0.00"
                   error={errors.limitAmountBase?.message} {...register('limitAmountBase')} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove budget"
        message={`Remove the budget for ${deleting?.categoryName}? Existing transactions are not affected.`}
        confirmLabel="Remove"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
