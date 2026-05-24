import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [successMsg] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim())    return setError('Please enter your email address.')
    if (!form.password.trim()) return setError('Please enter your password.')

    setLoading(true)
    const result = await login({ email: form.email.trim(), password: form.password })
    setLoading(false)

    if (!result.ok) return setError('Invalid email or password. Please try again.')

    // AppRoute in App.jsx automatically redirects to /onboarding if prefs are missing
    navigate('/jobs')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-extrabold text-xl" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>

        <div className="card p-8">
          <h1 className="font-extrabold text-xl mb-1" style={{ color: 'var(--text-h)' }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-m)' }}>Log in to continue your job search.</p>

          {successMsg && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              {successMsg}
            </div>
          )}

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Email Address</label>
              <input id="login-email" type="email" className="input" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Password</label>
              <input id="login-password" type="password" className="input" placeholder="Your password" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg justify-center mt-2" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In →'}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--text-m)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up free</Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3 rounded-xl text-xs text-center" style={{ background: 'var(--bg-subtle)', color: 'var(--text-m)' }}>
            First time? Click <strong>Sign up free</strong> to create an account and set your preferences.
          </div>
        </div>
      </div>
    </div>
  )
}
