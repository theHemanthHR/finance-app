import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { LogOut, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { authApi } from '../../api/authApi'
import { categoryApi } from '../../api/categoryApi'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { toApiError } from '../../api/axios'

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney', 'UTC',
]

export default function Settings() {
  const { user, setUser, logout } = useAuth()
  const qc = useQueryClient()
  const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE', color: '#34D399' })
  const [archiving, setArchiving] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: user?.name ?? '', timezone: user?.timezone ?? 'UTC' },
  })

  useEffect(() => {
    reset({ name: user?.name ?? '', timezone: user?.timezone ?? 'UTC' })
  }, [user, reset])

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })

  const saveMutation = useMutation({
    mutationFn: (v) => authApi.updateSettings(v),
    onSuccess: ({ data }) => { setUser(data); toast.success('Settings saved') },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const createCatMutation = useMutation({
    mutationFn: (payload) => categoryApi.create(payload),
    onSuccess: () => { toast.success('Category added'); qc.invalidateQueries(); setNewCategory({ name: '', type: 'EXPENSE', color: '#34D399' }) },
    onError: (err) => toast.error(toApiError(err).message),
  })

  const archiveMutation = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => { toast.success('Category archived'); qc.invalidateQueries(); setArchiving(null) },
    onError: (err) => toast.error(toApiError(err).message),
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your profile, preferences and categories.</p>
      </div>

      <Card>
        <CardTitle>Profile</CardTitle>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="s-name">Display name</label>
              <Input id="s-name" {...register('name')} />
            </div>
            <div>
              <label className="label" htmlFor="s-tz">Timezone</label>
              <Select id="s-tz" {...register('timezone')}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <Input value={user?.email ?? ''} disabled />
            </div>
            <div>
              <label className="label">Reporting currency</label>
              <div className="input flex items-center justify-between">
                <span>{user?.baseCurrencyCode}</span>
                <Badge tone="warning">Locked in v1</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                Locked to keep historical FX conversions stable. Changing it would silently reinterpret past amounts.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Categories</CardTitle>

        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((c) => (
            <span key={c.id} className="chip bg-surface2 text-slate-300 gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: c.color || '#64748B' }} />
              {c.name}
              <button className="hover:text-danger ml-0.5" onClick={() => setArchiving(c)} aria-label={`Archive ${c.name}`}>
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-4 gap-3 items-end pt-4 border-t border-border">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="nc-name">New category</label>
            <Input id="nc-name" placeholder="e.g. Pet care" value={newCategory.name}
                   onChange={(e) => setNewCategory((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="nc-type">Type</label>
            <Select id="nc-type" value={newCategory.type}
                    onChange={(e) => setNewCategory((s) => ({ ...s, type: e.target.value }))}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </Select>
          </div>
          <Button disabled={!newCategory.name || createCatMutation.isPending}
                  onClick={() => createCatMutation.mutate({ ...newCategory, name: newCategory.name.trim() })}>
            <Plus size={15} /> Add
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Session</CardTitle>
        <p className="text-sm text-muted mb-4">
          Signing out invalidates your server-side session immediately.
        </p>
        <Button variant="ghost" onClick={logout}><LogOut size={15} /> Log out</Button>
      </Card>

      <ConfirmDialog
        open={!!archiving}
        title="Archive category"
        message={`Archive "${archiving?.name}"? Existing transactions keep this category; it will be hidden from new entries.`}
        confirmLabel="Archive"
        busy={archiveMutation.isPending}
        onCancel={() => setArchiving(null)}
        onConfirm={() => archiveMutation.mutate(archiving.id)}
      />
    </div>
  )
}
