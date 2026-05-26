import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OnboardingModal from './OnboardingModal'
import LogoutButton from './LogoutButton'

const nav = [
  { label: 'Dashboard',    to: '/dashboard',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { label: 'Daily Jobs',   to: '/jobs',         icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { label: 'Resume Builder', to: '/resume',      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Applications',  to: '/applications', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { label: 'Knowledge',  to: '/knowledge', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { label: 'LinkedIn Growth',  to: '/linkedin-growth', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
]

export default function Sidebar() {
  const { currentUser, storedPrefs, logout, savePreferences } = useAuth()
  const [showPrefs, setShowPrefs] = useState(false)
  const navigate = useNavigate()

  function handleLogout() { logout(); navigate('/login') }

  // Dynamic initials from logged-in user
  const name     = currentUser?.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const role     = storedPrefs?.roles?.[0] || 'Set your preferences'
  const domains  = storedPrefs?.domains  || []
  const roles    = storedPrefs?.roles    || []

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-bold text-base" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="section-label px-5 mb-2 mt-1">MAIN MENU</p>
          {nav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Preferences */}
          <p className="section-label px-5 mb-2 mt-4">PREFERENCES</p>

          {domains.length > 0 && (
            <div className="mx-3 p-3 rounded-xl mb-2"
              style={{ background: 'var(--primary-lt)', border: '1px solid rgba(31,122,108,.15)' }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--primary)' }}>Your Focus</p>
              <div className="flex flex-wrap gap-1">
                {domains.slice(0, 2).map(d => (
                  <span key={d} className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{ background: 'var(--primary)', color: '#fff' }}>{d}</span>
                ))}
                {domains.length > 2 && <span className="text-xs" style={{ color: 'var(--primary)' }}>+{domains.length - 2}</span>}
              </div>
              {roles.length > 0 && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--sec-mid)' }}>
                  {roles.slice(0, 2).join(', ')}{roles.length > 2 ? '…' : ''}
                </p>
              )}
            </div>
          )}

          <button onClick={() => setShowPrefs(true)} className="sidebar-link" style={{ color: 'var(--text-b)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Edit Preferences
          </button>

          <NavLink to="/payment" className="sidebar-link group mt-1" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="absolute inset-0 transition-opacity duration-300 opacity-10 group-hover:opacity-20" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, transparent 100%)' }}></div>
            <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="relative z-10 font-bold transition-all duration-300" style={{ background: 'linear-gradient(90deg, #b45309, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Upgrade Plan
            </span>
          </NavLink>
        </nav>

        {/* ── User block (dynamic) ── */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
              style={{ background: 'var(--primary)' }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-h)' }}>{name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-m)' }}>{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {showPrefs && (
        <OnboardingModal
          onClose={() => setShowPrefs(false)}
          onComplete={(prefs) => { savePreferences(prefs); setShowPrefs(false) }}
        />
      )}
    </>
  )
}
