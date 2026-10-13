import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { reportApi } from '../../api/reportApi'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency, formatPercent, firstDayOfMonthIso, lastDayOfMonthIso } from '../../lib/format'

const COLORS = ['#34D399', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#F87171', '#22D3EE', '#84CC16']

export default function Reports() {
  const [from, setFrom] = useState(firstDayOfMonthIso())
  const [to, setTo] = useState(lastDayOfMonthIso())
  const [granularity, setGranularity] = useState('month')

  const params = { from, to }

  const cashFlow  = useQuery({ queryKey: ['r', 'cf', from, to, granularity],
                               queryFn: () => reportApi.cashFlow({ ...params, granularity }) })
  const spending  = useQuery({ queryKey: ['r', 'spend', from, to],
                               queryFn: () => reportApi.spending(params) })
  const income    = useQuery({ queryKey: ['r', 'inc', from, to],
                               queryFn: () => reportApi.income(params) })
  const compare   = useQuery({ queryKey: ['r', 'cmp', from, to],
                               queryFn: () => reportApi.comparison(params) })
  const top       = useQuery({ queryKey: ['r', 'top', from, to],
                               queryFn: () => reportApi.topExpenses({ ...params, limit: 10 }) })
  const currencies= useQuery({ queryKey: ['r', 'ccy', from, to],
                               queryFn: () => reportApi.currencies(params) })

  const currency = cashFlow.data?.currencyCode || 'INR'

  const spendingPie = (spending.data?.slices ?? []).map((s, i) => ({
    name: s.categoryName, value: Number(s.amount), color: s.color || COLORS[i % COLORS.length],
  }))
  const incomePie = (income.data?.slices ?? []).map((s, i) => ({
    name: s.categoryName, value: Number(s.amount), color: s.color || COLORS[i % COLORS.length],
  }))

  const tooltipStyle = { background: '#151B23', border: '1px solid #26303B', borderRadius: 12 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports & analytics</h1>
        <p className="text-sm text-muted mt-1">
          All figures are computed on the backend from your stored transactions, in {currency}.
        </p>
      </div>

      <Card>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="rp-from">From</label>
            <Input id="rp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rp-to">To</label>
            <Input id="rp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rp-gran">Granularity</label>
            <Select id="rp-gran" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </Select>
          </div>
        </div>
      </Card>

      {compare.data && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Income', cur: compare.data.currentIncome, pct: compare.data.incomeChangePct },
            { label: 'Expenses', cur: compare.data.currentExpense, pct: compare.data.expenseChangePct },
            { label: 'Net cash flow', cur: compare.data.currentNet, pct: compare.data.netChangePct },
          ].map((row) => (
            <Card key={row.label}>
              <p className="text-xs text-muted uppercase tracking-wide">{row.label}</p>
              <p className="mt-2 text-xl font-semibold tabular-nums">{formatCurrency(row.cur, currency)}</p>
              <p className="mt-1 text-xs text-muted">
                {row.pct === null
                  ? 'No comparable prior period'
                  : `${row.pct >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(row.pct))} vs previous period`}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Cash flow</CardTitle>
          {cashFlow.isLoading ? <CardSkeleton rows={6} /> : (cashFlow.data?.buckets?.length ?? 0) === 0 ? (
            <EmptyState title="No data for this period" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow.data.buckets}>
                  <defs>
                    <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F87171" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#26303B" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, currency)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#34D399" fill="url(#cf-income)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#F87171" fill="url(#cf-expense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Net cash-flow trend</CardTitle>
          {cashFlow.isLoading ? <CardSkeleton rows={6} /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlow.data?.buckets ?? []}>
                  <CartesianGrid stroke="#26303B" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, currency)} />
                  <Line type="monotone" dataKey="net" name="Net" stroke="#60A5FA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Spending by category</CardTitle>
          {spending.isLoading ? <CardSkeleton rows={6} /> : spendingPie.length === 0 ? (
            <EmptyState title="No expenses in this period" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spendingPie} dataKey="value" nameKey="name"
                       innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {spendingPie.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, currency)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Income by category</CardTitle>
          {income.isLoading ? <CardSkeleton rows={6} /> : incomePie.length === 0 ? (
            <EmptyState title="No income in this period" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={income.data.slices.map((s) => ({ name: s.categoryName, value: Number(s.amount) }))}>
                  <CartesianGrid stroke="#26303B" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, currency)} />
                  <Bar dataKey="value" name="Income" fill="#34D399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Top expenses</CardTitle>
          {top.isLoading ? <CardSkeleton rows={5} /> : (top.data?.length ?? 0) === 0 ? (
            <EmptyState title="No expenses in this period" />
          ) : (
            <ul className="divide-y divide-border">
              {top.data.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{t.description}</p>
                    <p className="text-xs text-muted">{t.categoryName} · {t.date}</p>
                  </div>
                  <span className="tabular-nums font-medium whitespace-nowrap ml-3">
                    {formatCurrency(t.amountInBase, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Currency summary</CardTitle>
          {currencies.isLoading ? <CardSkeleton rows={4} /> : (currencies.data?.length ?? 0) === 0 ? (
            <EmptyState title="No transactions in this period" />
          ) : (
            <ul className="divide-y divide-border">
              {currencies.data.map((c) => (
                <li key={c.currencyCode} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Badge>{c.currencyCode}</Badge>
                    <span className="text-muted">{c.transactionCount} transactions</span>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums">{formatCurrency(c.originalTotal, c.currencyCode)}</p>
                    <p className="text-xs text-muted tabular-nums">
                      ≈ {formatCurrency(c.baseTotal, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
