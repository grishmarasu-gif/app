import { useAuth } from '../context/AuthContext'
import LogoutButton from './LogoutButton'

export default function TopBar({ title, subtitle, actions }) {
  const { currentUser } = useAuth()
  const name = currentUser?.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const plan = currentUser?.plan || 'Free'

  return (
    <div className="topbar flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-base leading-tight truncate" style={{ color: 'var(--text-h)' }}>{title}</h1>
        {subtitle && <p className="text-xs truncate" style={{ color: 'var(--text-m)' }}>{subtitle}</p>}
      </div>
      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
        style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', minWidth: 220 }}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-m)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm" style={{ color: 'var(--text-f)' }}>Search…</span>
      </div>
      {/* Actions */}
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      
      {/* Notification bell & Profile Area Wrapper */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        {/* Notification bell */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative transition-colors duration-200"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-m)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="hidden md:flex items-center mr-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: plan === 'Pro' || plan === 'Pro Plus' ? 'var(--primary)' : 'var(--text-m)' }}>
              Plan: {plan}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
              style={{ background: 'var(--primary)' }}>{initials}</div>
            <span className="hidden md:block text-sm font-bold truncate max-w-[120px]" style={{ color: 'var(--text-h)' }}>{name}</span>
          </div>
          <LogoutButton isNavbar={true} iconOnly={true} />
        </div>
      </div>
    </div>
  )
}
