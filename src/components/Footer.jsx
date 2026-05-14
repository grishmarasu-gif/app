const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'Workflow Builder', href: '#features' },
      { label: 'Application Tracker', href: '#features' },
      { label: 'Daily Planner', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Apply4works', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      className="px-6 pt-16 pb-10"
      style={{
        background: 'var(--bg-warm)',
        borderTop: '1px solid var(--border)',
      }}
      id="footer"
    >
      <div className="max-w-6xl mx-auto">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12" style={{ borderBottom: '1px solid var(--border)' }}>

          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5 group w-fit" id="footer-logo">
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
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
              A career productivity system for structured, consistent, and measurable job search progress.
            </p>
            <a
              href="#cta"
              className="btn-primary px-5 py-2.5 rounded-xl text-sm w-fit mt-1"
            >
              Get started free
            </a>
          </div>

          {/* Nav columns */}
          {footerCols.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {col.heading}
              </h4>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium transition-colors duration-200 w-fit"
                  style={{ color: 'var(--text-body)' }}
                  onMouseEnter={e => (e.target.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.target.style.color = 'var(--text-body)')}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            © 2026 Apply4works. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
            Built for clarity, consistency, and growth.
            <span style={{ color: 'var(--primary)' }}>🌿</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

