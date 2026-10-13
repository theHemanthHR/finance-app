import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { transactionSchema } from '../schemas/transactionSchema'
import { transactionApi } from '../api/transactionApi'
import { categoryApi } from '../api/categoryApi'
import { currencyApi } from '../api/currencyApi'
import { toApiError } from '../api/axios'
import { toIsoDate } from '../lib/format'

export function TransactionModal({ open, onClose, initial }) {
  const qc = useQueryClient()
  const isEdit = Boolean(initial?.id)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
    enabled: open,
  })
  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyApi.list(),
    enabled: open,
  })

  const defaults = useMemo(
    () => ({
      type: initial?.type ?? 'EXPENSE',
      description: initial?.description ?? '',
      amount: initial?.amount ?? '',
      currencyCode: initial?.currencyCode ?? 'INR',
      categoryId: initial?.categoryId ?? '',
      transactionDate: initial?.transactionDate ?? toIsoDate(new Date()),
      notes: initial?.notes ?? '',
    }),
    [initial],
  )

  const {
    register, handleSubmit, reset, watch, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(transactionSchema), defaultValues: defaults })

  useEffect(() => { reset(defaults) }, [defaults, reset, open])

  const type = watch('type')
  const filteredCategories = categories.filter((c) => c.type === type)

  const mutation = useMutation({
    mutationFn: (values) =>
      isEdit ? transactionApi.update(initial.id, values) : transactionApi.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Transaction updated' : 'Transaction added')
      qc.invalidateQueries()
      onClose()
    },
    onError: (err) => {
      const e = toApiError(err)
      toast.error(e.message)
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit transaction' : 'Add transaction'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="tx-form" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface2 rounded-xl">
          {['EXPENSE', 'INCOME'].map((t) => (
            <label
              key={t}
              className={`text-center text-sm font-medium py-2 rounded-lg cursor-pointer transition ${
                type === t ? 'bg-accent text-slate-900' : 'text-muted hover:text-slate-200'
              }`}
            >
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              {t === 'EXPENSE' ? 'Expense' : 'Income'}
            </label>
          ))}
        </div>

        <div>
          <label className="label" htmlFor="tx-desc">Description</label>
          <Input id="tx-desc" placeholder="e.g. Grocery shopping" error={errors.description?.message} {...register('description')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="tx-amount">Amount</label>
            <Input id="tx-amount" type="number" step="0.01" min="0" placeholder="0.00"
                   error={errors.amount?.message} {...register('amount')} />
          </div>
          <div>
            <label className="label" htmlFor="tx-currency">Currency</label>
            <Select id="tx-currency" error={errors.currencyCode?.message} {...register('currencyCode')}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="tx-cat">Category</label>
            <Select id="tx-cat" error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">Select a category</option>
              {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="label" htmlFor="tx-date">Date</label>
            <Input id="tx-date" type="date" error={errors.transactionDate?.message} {...register('transactionDate')} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="tx-notes">Notes (optional)</label>
          <textarea id="tx-notes" rows={3} className="input resize-none" placeholder="Add any extra detail…" {...register('notes')} />
        </div>
      </form>
    </Modal>
  )
}

TransactionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initial: PropTypes.object,
}
