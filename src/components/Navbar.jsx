import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#cta' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 shadow-soft border-b' : 'py-5'
        }`}
      style={{
        background: scrolled ? 'rgba(247,248,250,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="#" id="nav-logo" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ background: 'var(--primary)' }}
          >
            W
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Work4<span style={{ color: 'var(--primary)' }}>Flow</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold transition-colors duration-200 relative group"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.target.style.color = 'var(--primary)')}
              onMouseLeave={e => (e.target.style.color = 'var(--text-muted)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#cta"
            className="btn-secondary px-5 py-2.5 text-sm"
            id="nav-login"
          >
            Log In
          </a>
          <a
            href="#cta"
            className="btn-primary px-5 py-2.5 text-sm"
            id="nav-start"
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="mobile-nav-toggle"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
          }`}
        style={{ background: 'rgba(247,248,250,0.98)', backdropFilter: 'blur(16px)' }}
      >
        <div className="px-6 py-4 flex flex-col gap-1 border-t" style={{ borderColor: 'var(--border)' }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-2.5 text-sm font-semibold border-b"
              style={{ color: 'var(--text-body)', borderColor: 'var(--border)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#cta" className="btn-primary mt-3 py-3 rounded-xl text-sm text-center justify-center" onClick={() => setMenuOpen(false)}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  )
}
