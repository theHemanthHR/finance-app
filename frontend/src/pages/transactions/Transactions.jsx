import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Pencil, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { transactionApi } from '../../api/transactionApi'
import { categoryApi } from '../../api/categoryApi'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { TransactionModal } from '../../components/TransactionModal'
import { AddTransactionButton } from '../../components/AddTransactionButton'
import { useDebounce } from '../../hooks/useDebounce'
import { formatCurrency, formatDate, firstDayOfMonthIso, lastDayOfMonthIso } from '../../lib/format'
import { toApiError } from '../../api/axios'

export default function Transactions() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState({
    q: '', from: firstDayOfMonthIso(), to: lastDayOfMonthIso(),
    type: '', categoryId: '', page: 0, size: 20, sortBy: 'date', sortDir: 'desc',
  })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const debouncedQ = useDebounce(filters.q, 350)

  const params = useMemo(() => ({
    from: filters.from || undefined,
    to: filters.to || undefined,
    type: filters.type || undefined,
    categoryId: filters.categoryId || undefined,
    q: debouncedQ || undefined,
    page: filters.page, size: filters.size,
    sortBy: filters.sortBy, sortDir: filters.sortDir,
  }), [filters, debouncedQ])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionApi.list(params),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })

  const removeMutation = useMutation({
    mutationFn: (id) => transactionApi.remove(id),
    onSuccess: () => {
      toast.success('Transaction deleted')
      qc.invalidateQueries()
      setDeleting(null)
    },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const exportMutation = useMutation({
    mutationFn: () => transactionApi.exportCsv({
      from: params.from, to: params.to, type: params.type, categoryId: params.categoryId, q: params.q,
    }),
    onSuccess: () => toast.success('Export downloaded'),
    onError: (err) => toast.error(toApiError(err).message),
  })

  const currency = data?.content?.[0]?.baseCurrencyCode || 'INR'
  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: 0 }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted mt-1">Search, filter and export your income and expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
            <Download size={15} /> {exportMutation.isPending ? 'Exporting…' : 'Export CSV'}
          </Button>
          <AddTransactionButton />
        </div>
      </div>

      <Card>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search…" className="pl-9" value={filters.q}
                   onChange={(e) => update({ q: e.target.value })} />
          </div>
          <Input type="date" value={filters.from} onChange={(e) => update({ from: e.target.value })} />
          <Input type="date" value={filters.to} onChange={(e) => update({ to: e.target.value })} />
          <Select value={filters.type} onChange={(e) => update({ type: e.target.value })}>
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
          <Select value={filters.categoryId} onChange={(e) => update({ categoryId: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </Card>

      {isLoading ? <CardSkeleton rows={8} /> : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : (data?.content?.length ?? 0) === 0 ? (
        <Card>
          <EmptyState title="No transactions found"
                      description="Try adjusting your filters, or add a new transaction."
                      action={<AddTransactionButton />} />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-surface2/60">
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-right">Original</th>
                  <th className="px-5 py-3 font-medium text-right">In {currency}</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((t) => (
                  <tr key={t.id} className="border-t border-border hover:bg-surface2/40">
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(t.transactionDate)}</td>
                    <td className="px-5 py-3 max-w-[260px] truncate">{t.description}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: t.categoryColor || '#64748B' }} />
                        <span className="text-muted">{t.categoryName}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={t.type === 'INCOME' ? 'success' : 'neutral'}>{t.type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">
                      {formatCurrency(t.amount, t.currencyCode)}
                    </td>
                    <td className={`px-5 py-3 text-right tabular-nums font-medium ${
                      t.type === 'INCOME' ? 'text-accent' : 'text-slate-200'}`}>
                      {t.type === 'INCOME' ? '+' : '−'} {formatCurrency(t.amountInBase, currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-surface2" onClick={() => setEditing(t)}
                                aria-label="Edit transaction">
                          <Pencil size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface2 text-danger"
                                onClick={() => setDeleting(t)} aria-label="Delete transaction">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
            <span className="text-muted">
              Page {data.page + 1} of {Math.max(data.totalPages, 1)} · {data.totalElements} records
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={data.page === 0}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</Button>
              <Button variant="ghost" disabled={data.page + 1 >= data.totalPages}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      <TransactionModal open={!!editing} initial={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete transaction"
        message={`Delete "${deleting?.description}"? This affects your reports and budgets immediately.`}
        confirmLabel="Delete"
        busy={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => removeMutation.mutate(deleting.id)}
      />
    </div>
  )
}
