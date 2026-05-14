import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim())       return setError('Please enter your full name.')
    if (!form.email.trim())      return setError('Please enter your email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    const result = register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    setLoading(false)

    if (!result.ok) return setError(result.error)
    // After register → go to onboarding (set career preferences)
    navigate('/onboarding')
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
          <h1 className="font-extrabold text-xl mb-1" style={{ color: 'var(--text-h)' }}>Create your account</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-m)' }}>Start discovering jobs matched to your domain and role.</p>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Full Name</label>
              <input id="reg-name" className="input" placeholder="e.g. Venkat Chilukuri" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Email Address</label>
              <input id="reg-email" type="email" className="input" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Password</label>
              <input id="reg-password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Confirm Password</label>
              <input id="reg-confirm" type="password" className="input" placeholder="Re-enter password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg justify-center mt-2" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account & Continue →'}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--text-m)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
