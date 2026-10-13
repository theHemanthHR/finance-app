import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { registerSchema } from '../../schemas/authSchemas'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { currencyApi } from '../../api/currencyApi'
import { toApiError } from '../../api/axios'

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney', 'UTC',
]

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { data: currencies = [] } = useQuery({ queryKey: ['currencies'], queryFn: () => currencyApi.list() })

  const detectedTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' }
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', email: '', password: '', confirmPassword: '',
      baseCurrencyCode: 'INR',
      timezone: TIMEZONES.includes(detectedTz) ? detectedTz : 'UTC',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')
    const { confirmPassword: _cp, ...payload } = values
    try {
      await registerUser(payload)
      toast.success('Account created')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const e = toApiError(err)
      setServerError(e.message || 'Unable to create account')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-9 h-9 rounded-xl bg-accent text-slate-900 flex items-center justify-center font-bold">F</span>
          <span className="font-semibold text-lg">Finora</span>
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Start tracking your finances in under a minute.</p>

          {serverError && (
            <div role="alert" className="mt-5 text-sm rounded-xl bg-danger/10 border border-danger/30 text-danger px-3 py-2">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <Input id="name" placeholder="Ada Lovelace" error={errors.name?.message} {...register('name')} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                     error={errors.email?.message} {...register('email')} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••"
                       error={errors.password?.message} {...register('password')} />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••"
                       error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="currency">Reporting currency</label>
                <Select id="currency" error={errors.baseCurrencyCode?.message} {...register('baseCurrencyCode')}>
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="label" htmlFor="timezone">Timezone</label>
                <Select id="timezone" error={errors.timezone?.message} {...register('timezone')}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full py-2.5" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted text-center">
            Already registered? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
