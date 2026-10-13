import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'

import { loginSchema } from '../../schemas/authSchemas'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toApiError } from '../../api/axios'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const user = await login(values)
      toast.success(`Welcome back, ${user.name}`)
      navigate(user.onboarded ? '/dashboard' : '/onboarding', { replace: true })
    } catch (err) {
      const e = toApiError(err)
      setServerError(e.message || 'Unable to sign in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-9 h-9 rounded-xl bg-accent text-slate-900 flex items-center justify-center font-bold">F</span>
          <span className="font-semibold text-lg">Finora</span>
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Welcome back. Enter your details to continue.</p>

          {serverError && (
            <div role="alert" className="mt-5 text-sm rounded-xl bg-danger/10 border border-danger/30 text-danger px-3 py-2">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                     error={errors.email?.message} {...register('email')} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
                     error={errors.password?.message} {...register('password')} />
            </div>
            <Button type="submit" className="w-full py-2.5" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
