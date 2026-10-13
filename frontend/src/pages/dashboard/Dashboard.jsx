import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownRight, ArrowUpRight, Lightbulb, PiggyBank, TrendingDown, TrendingUp, Wallet,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'

import { dashboardApi, reportApi } from '../../api/reportApi'
import { SummaryCard } from '../../components/SummaryCard'
import { Card, CardTitle } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { AddTransactionButton } from '../../components/AddTransactionButton'
import { formatCurrency, formatDate, firstDayOfMonthIso, lastDayOfMonthIso } from '../../lib/format'

const CHART_COLORS = ['#34D399', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#F87171', '#22D3EE', '#84CC16']

export default function Dashboard() {
  const [period, setPeriod] = useState('this-month')

  const { from, to } = (() => {
    const now = new Date()
    if (period === 'last-month') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return { from: firstDayOfMonthIso(d), to: lastDayOfMonthIso(d) }
    }
    if (period === 'this-year') {
      return { from: `${now.getFullYear()}-01-01`, to: lastDayOfMonthIso(now) }
    }
    return { from: firstDayOfMonthIso(now), to: lastDayOfMonthIso(now) }
  })()

  const summary = useQuery({
    queryKey: ['dashboard', 'summary', from, to],
    queryFn: () => dashboardApi.summary(),
  })
  const recent = useQuery({ queryKey: ['dashboard', 'recent'], queryFn: () => dashboardApi.recent() })
  const cashFlow = useQuery({
    queryKey: ['reports', 'cash-flow', from, to],
    queryFn: () => reportApi.cashFlow({ from, to, granularity: 'month' }),
  })
  const budgets = useQuery({
    queryKey: ['reports', 'budget-vs-actual', from],
    queryFn: () => reportApi.budgetVsActual({ month: from }),
  })
  const goals = useQuery({ queryKey: ['reports', 'savings'], queryFn: () => reportApi.savings() })
  const insights = useQuery({ queryKey: ['reports', 'insights'], queryFn: () => reportApi.insights() })

  const s = summary.data
  const currency = s?.currencyCode || 'INR'
  const netPositive = (s?.netCashFlow ?? 0) >= 0

  const pieData = (s?.expensesByCategory?.slices ?? []).slice(0, 8).map((sl, i) => ({
    name: sl.categoryName,
    value: Number(sl.amount),
    color: sl.color || CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Your financial overview for the selected period.
          </p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input w-auto">
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="this-year">This year</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Total income" value={Number(s?.totalIncome ?? 0)} currency={currency}
                     icon={ArrowUpRight} tone="success" loading={summary.isLoading} />
        <SummaryCard label="Total expenses" value={Number(s?.totalExpense ?? 0)} currency={currency}
                     icon={ArrowDownRight} tone="danger" loading={summary.isLoading} />
        <SummaryCard label="Net cash flow" value={Number(s?.netCashFlow ?? 0)} currency={currency}
                     icon={netPositive ? TrendingUp : TrendingDown}
                     tone={netPositive ? 'success' : 'danger'}
                     hint="Income minus expenses — not a bank balance"
                     loading={summary.isLoading} />
        <SummaryCard label="Savings goals" value={`${goals.data?.length ?? 0} active`}
                     icon={PiggyBank} loading={goals.isLoading}
                     hint={goals.data?.[0] ? `${goals.data[0].name}: ${goals.data[0].percentage}%` : 'No goals yet'} />
      </div>

      {insights.data?.length > 0 && (
        <Card>
          <CardTitle><span className="inline-flex items-center gap-2"><Lightbulb size={15} className="text-warn" /> Insights</span></CardTitle>
          <ul className="space-y-2">
            {insights.data.slice(0, 4).map((i, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={idx} className="flex items-start gap-3 text-sm">
                <Badge tone={i.severity === 'danger' ? 'danger' : i.severity === 'warning' ? 'warning' : 'neutral'}>
                  {i.severity}
                </Badge>
                <div>
                  <p className="font-medium text-slate-200">{i.title}</p>
                  <p className="text-muted text-xs mt-0.5">{i.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardTitle>Income vs expenses</CardTitle>
          {cashFlow.isLoading ? <CardSkeleton rows={6} /> : (
            (cashFlow.data?.buckets?.length ?? 0) === 0 ? (
              <EmptyState title="No data for this period"
                          description="Add a transaction to see your cash-flow trend." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow.data.buckets}>
                    <CartesianGrid stroke="#26303B" vertical={false} />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                    <Tooltip
                      contentStyle={{ background: '#151B23', border: '1px solid #26303B', borderRadius: 12 }}
                      formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#34D399" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#F87171" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Spending by category</CardTitle>
          {summary.isLoading ? <CardSkeleton rows={6} /> : pieData.length === 0 ? (
            <EmptyState title="No expenses yet" description="Your category breakdown will appear here." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {pieData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#151B23', border: '1px solid #26303B', borderRadius: 12 }}
                    formatter={(v) => formatCurrency(v, currency)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle action={<Link to="/budgets" className="text-xs text-accent hover:underline">View all</Link>}>
            Budget progress
          </CardTitle>
          {budgets.isLoading ? <CardSkeleton rows={4} /> : (budgets.data?.length ?? 0) === 0 ? (
            <EmptyState icon={Wallet} title="No budgets set"
                        description="Create a monthly budget to track category spending."
                        action={<Link to="/budgets" className="btn-primary">Create a budget</Link>} />
          ) : (
            <ul className="space-y-4">
              {budgets.data.slice(0, 5).map((b) => (
                <li key={b.budgetId}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{b.categoryName}</span>
                    <span className={b.overBudget ? 'text-danger' : 'text-muted'}>
                      {formatCurrency(b.actualAmount, currency)} / {formatCurrency(b.limitAmount, currency)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.overBudget ? 'bg-danger' : 'bg-accent'}`}
                      style={{ width: `${Math.min(Number(b.percentageUsed), 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle action={<Link to="/goals" className="text-xs text-accent hover:underline">View all</Link>}>
            Savings goals
          </CardTitle>
          {goals.isLoading ? <CardSkeleton rows={4} /> : (goals.data?.length ?? 0) === 0 ? (
            <EmptyState icon={PiggyBank} title="No savings goals"
                        description="Set a goal and track your progress over time."
                        action={<Link to="/goals" className="btn-primary">Create a goal</Link>} />
          ) : (
            <ul className="space-y-4">
              {goals.data.slice(0, 4).map((g) => (
                <li key={g.goalId}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted">{g.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                    <div className="h-full rounded-full bg-accent"
                         style={{ width: `${Math.min(Number(g.percentage), 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatCurrency(g.contributed, currency)} of {formatCurrency(g.target, currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle action={<Link to="/transactions" className="text-xs text-accent hover:underline">View all</Link>}>
          Recent transactions
        </CardTitle>
        {recent.isLoading ? <CardSkeleton rows={5} /> : (recent.data?.length ?? 0) === 0 ? (
          <EmptyState title="No transactions yet"
                      description="Add your first income or expense to get started."
                      action={<AddTransactionButton />} />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted whitespace-nowrap">{formatDate(t.transactionDate)}</td>
                    <td className="py-2.5 pr-4 truncate max-w-[220px]">{t.description}</td>
                    <td className="py-2.5 text-muted">{t.categoryName}</td>
                    <td className={`py-2.5 text-right tabular-nums font-medium ${
                      t.type === 'INCOME' ? 'text-accent' : 'text-slate-200'}`}>
                      {t.type === 'INCOME' ? '+' : '−'} {formatCurrency(t.amountInBase, currency)}
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
