import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { jobs as allJobs } from '../data/jobs'
import LogoutButton from '../components/LogoutButton'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';

const features = [
  { icon: '🎯', title: 'Domain-Based Discovery', desc: 'Tell us your industry and role. We surface only the jobs that match your career direction.' },
  { icon: '📄', title: 'Tailored Resume Generator', desc: 'Generate resumes matched to each specific job description with highlighted keyword alignment.' },
  { icon: '⚡', title: 'Smart Apply Engine', desc: 'Pre-fill applications, generate cover letters, and review before submitting in seconds.' },
  { icon: '📊', title: 'Application Tracker', desc: 'Track every application through a visual pipeline from Applied to Offer.' },
]
const steps = [
  { n: '1', t: 'Create Your Account',         d: 'Sign up in seconds — no credit card needed.' },
  { n: '2', t: 'Set Your Career Preferences', d: 'Choose your domain, target role, work type, and experience level.' },
  { n: '3', t: 'Discover Matched Jobs',        d: 'Get a daily feed of jobs tailored to your domain and roles.' },
  { n: '4', t: 'Apply with Smart Automation',  d: 'Auto-fill, generate resume & cover letter, submit with confidence.' },
]

// ── Welcome-back stats modal ────────────────────────────────────────────
function WelcomeModal({ onClose, onGo }) {
  const { currentUser, storedPrefs } = useAuth()
  const { appHistory, autoApply }     = useApp()

  const totalJobs   = allJobs.length
  const totalApps   = appHistory.length
  const autoApps    = appHistory.filter(a => a.appliedBy === 'Auto').length
  const manualApps  = appHistory.filter(a => a.appliedBy === 'Manual').length
  const bestMatch   = Math.max(...allJobs.map(j => j.matchScore))
  const name        = (currentUser?.name || 'User').split(' ')[0]
  const roles       = storedPrefs?.roles?.slice(0, 2).join(', ') || 'Not set'
  const domains     = storedPrefs?.domains?.slice(0, 2).join(', ') || 'Not set'

  const pendingJobs = allJobs.filter(j => j.status === 'New').length

  const stats = [
    { label: 'Jobs Available Today', value: totalJobs,             icon: '💼', color: 'var(--primary)',   bg: 'var(--primary-lt)' },
    { label: 'Total Applications',   value: totalApps,             icon: '📋', color: 'var(--accent-dk)', bg: 'var(--accent-lt)' },
    { label: '⚡ Auto Applied',       value: autoApps,              icon: '⚡', color: 'var(--primary)',   bg: 'var(--primary-lt)' },
    { label: '👤 Manual Applied',    value: manualApps,            icon: '👤', color: 'var(--sage-dk)',   bg: 'var(--sage-lt)' },
    { label: 'Best Match Score',     value: `${bestMatch}%`,       icon: '🎯', color: '#7c3aed',          bg: '#f5f3ff' },
    { label: 'Pending Jobs',         value: pendingJobs,           icon: '🔔', color: 'var(--accent-dk)', bg: 'var(--accent-lt)' },
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
        style={{ background: '#fff', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between"
          style={{ background: 'var(--primary-lt)', borderBottom: '1px solid rgba(31,122,108,.15)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: 'var(--primary)' }}>A</div>
              <span className="font-extrabold text-base" style={{ color: 'var(--text-h)' }}>
                Apply4<span style={{ color: 'var(--primary)' }}>works</span>
              </span>
            </div>
            <h2 className="font-extrabold text-xl" style={{ color: 'var(--text-h)' }}>
              Welcome back, {name}! 👋
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--sec-mid)' }}>
              Here's your application overview
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#fff', color: 'var(--text-m)', border: '1px solid var(--border)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Career preferences summary */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <span className="text-xl">🎯</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: 'var(--text-m)' }}>CAREER FOCUS</p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-h)' }}>{roles}</p>
              <p className="text-xs" style={{ color: 'var(--text-m)' }}>{domains}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: s.bg, border: '1px solid rgba(0,0,0,.04)' }}>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-m)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Application breakdown bar */}
          {totalApps > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold" style={{ color: 'var(--text-m)' }}>Application Mix</span>
                <span style={{ color: 'var(--text-m)' }}>{totalApps} total</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--border)' }}>
                {autoApps > 0 && (
                  <div className="h-full transition-all" title={`${autoApps} Auto Applied`}
                    style={{ width: `${(autoApps / totalApps) * 100}%`, background: 'var(--primary)' }} />
                )}
                {manualApps > 0 && (
                  <div className="h-full transition-all" title={`${manualApps} Manual`}
                    style={{ width: `${(manualApps / totalApps) * 100}%`, background: 'var(--accent-dk)' }} />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--primary)' }}></span>
                  <span style={{ color: 'var(--text-m)' }}>⚡ Auto Apply ({autoApps})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--accent-dk)' }}></span>
                  <span style={{ color: 'var(--text-m)' }}>👤 Manual ({manualApps})</span>
                </span>
              </div>
            </div>
          )}

          {totalApps === 0 && (
            <div className="rounded-xl px-4 py-3 text-center text-sm"
              style={{ background: '#fef3c7', color: '#92400e' }}>
              🚀 No applications yet — start applying today!
            </div>
          )}

          {/* CTA button */}
          <button onClick={onGo} className="btn btn-primary btn-lg justify-center font-bold w-full">
            Go to Dashboard →
          </button>

          <div className="flex gap-3">
            <button onClick={() => { onClose(); window.location.hash = '#jobs' }}
              className="btn btn-ghost btn-sm flex-1 justify-center text-xs"
              style={{ border: '1px solid var(--border)' }}>
              Browse Jobs
            </button>
            <button onClick={() => { onClose(); window.location.hash = '#resume' }}
              className="btn btn-ghost btn-sm flex-1 justify-center text-xs"
              style={{ border: '1px solid var(--border)' }}>
              Build Resume
            </button>
            <button onClick={() => { onClose(); window.location.hash = '#apps' }}
              className="btn btn-ghost btn-sm flex-1 justify-center text-xs"
              style={{ border: '1px solid var(--border)' }}>
              Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Landing page ────────────────────────────────────────────────────
export default function Landing() {
  const { isLoggedIn, prefsExist } = useAuth()
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [previewJobs, setPreviewJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    async function fetchPreviewJobs() {
      try {
        const res = await fetch(`${API_BASE}/jobs?limit=6`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const fetched = data.jobs || data.data || data
          setPreviewJobs(Array.isArray(fetched) ? fetched.slice(0, 6) : [])
        }
      } catch (err) {
        console.error('Failed to fetch preview jobs', err)
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchPreviewJobs()
  }, [])

  function handleGetStarted() {
    if (isLoggedIn) {
      setShowWelcome(true)
    } else {
      navigate('/register')
    }
  }

  function handleLogin() {
    if (isLoggedIn && prefsExist) navigate('/dashboard')
    else if (isLoggedIn)          navigate('/onboarding')
    else                          navigate('/login')
  }

  function goToDashboard() {
    setShowWelcome(false)
    navigate('/dashboard')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
        style={{ background: 'rgba(245,243,239,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-bold text-base" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button onClick={() => setShowWelcome(true)} className="btn btn-ghost btn-sm">
                My Stats
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">
                Go to Dashboard →
              </button>
              <LogoutButton isNavbar={true} />
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="btn btn-ghost btn-sm">Log In</button>
              <button onClick={handleGetStarted} className="btn btn-primary btn-sm">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: '1px solid rgba(31,122,108,.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />
          Job Discovery &amp; Smart Application Platform
        </div>
        <h1 className="font-extrabold leading-tight mb-5"
          style={{ fontSize: 'clamp(2.6rem,5.5vw,4rem)', color: 'var(--text-h)' }}>
          Discover Jobs. Generate Resumes.<br />
          <span style={{ color: 'var(--primary)' }}>Apply with Confidence.</span>
        </h1>
        <p className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-b)' }}>
          Apply4works personalizes your job search by domain and role — then helps you build tailored resumes and submit smart applications in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
            {isLoggedIn ? 'View My Stats 📊' : 'Build My Profile'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          {isLoggedIn
            ? <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-lg">Go to Dashboard →</button>
            : <button onClick={handleLogin} className="btn btn-ghost btn-lg">Log In →</button>
          }
        </div>
        <p className="text-xs mt-6" style={{ color: 'var(--text-m)' }}>
          {isLoggedIn ? 'Continue your job search journey.' : 'Free to start · No credit card required'}
        </p>
      </section>

      {/* Live Jobs Preview Section */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Live Opportunities</p>
            <h2 className="font-extrabold text-3xl md:text-4xl" style={{ color: 'var(--text-h)' }}>
              Recently posted jobs matching our network
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--text-m)' }}>Sign up to see thousands more directly matching your preferences.</p>
          </div>

          {loadingJobs ? (
            <div className="text-center py-10" style={{ color: 'var(--text-m)' }}>Fetching latest opportunities...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {previewJobs.map(j => (
                <div key={j.id} className="card p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: j.logoColor || 'var(--primary)' }}>{j.logo || j.company?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-h)' }} title={j.title}>{j.title}</h3>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-m)' }}>{j.company} · {j.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`badge ${j.workType === 'Remote' ? 'badge-green' : j.workType === 'Hybrid' ? 'badge-orange' : 'badge-slate'}`}>{j.workType || 'Remote'}</span>
                    <span className="badge badge-slate">{j.experienceLevel || 'Entry-Level'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 h-[50px] overflow-hidden">
                    {(j.skills || []).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                        style={{ background: 'var(--bg)', color: 'var(--sec-mid)', border: '1px solid var(--border)' }}>{s}</span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={handleGetStarted} className="btn btn-primary btn-sm w-full justify-center">Login to Apply →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform stats strip */}
      <div className="py-4 px-6 flex flex-wrap justify-center gap-6"
        style={{ background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Jobs Available',    value: `${allJobs.length}+` },
          { label: 'Domain Categories', value: '10+' },
          { label: 'Roles Supported',   value: '50+' },
          { label: 'Smart Applications',value: 'Unlimited' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--sec-mid)' }}>
            <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-extrabold" style={{ color: 'var(--primary)' }}>{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Platform Features</p>
          <h2 className="font-extrabold text-3xl md:text-4xl" style={{ color: 'var(--text-h)' }}>
            Everything you need to land your next role
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title} className="card p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6" style={{ background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">How It Works</p>
            <h2 className="font-extrabold text-3xl md:text-4xl" style={{ color: 'var(--text-h)' }}>
              From signup to offer in 4 steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.n} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm"
                  style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>{s.n}</div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{s.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto card p-12 flex flex-col items-center gap-6">
          <h2 className="font-extrabold text-3xl" style={{ color: 'var(--text-h)' }}>
            {isLoggedIn ? 'Continue your job search' : 'Start discovering jobs that match your domain'}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-b)' }}>
            {isLoggedIn
              ? 'View your application stats, browse new jobs, and keep applying.'
              : 'Create your account, set your career preferences, and Apply4works handles the rest.'}
          </p>
          <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
            {isLoggedIn ? 'View My Stats & Continue →' : "Get Started — It's Free"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-sm border-t" style={{ color: 'var(--text-m)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'var(--primary)' }}>A</div>
            <span className="font-semibold" style={{ color: 'var(--text-h)' }}>Apply4works</span>
          </div>
          <div className="flex gap-6">
            {['About','Contact','Privacy Policy','Terms'].map(l => <a key={l} href="#" className="hover:underline">{l}</a>)}
          </div>
          <p>© 2026 Apply4works. All rights reserved.</p>
        </div>
      </footer>

      {/* Welcome stats modal */}
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onGo={goToDashboard}
        />
      )}
    </div>
  )
}
