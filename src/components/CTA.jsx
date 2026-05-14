const perks = [
  { icon: '✓', text: 'Free 14-day trial' },
  { icon: '✓', text: 'No credit card required' },
  { icon: '✓', text: 'Cancel anytime' },
]

export default function CTA() {
  return (
    <section className="py-24 px-6" id="cta">
      <div className="max-w-4xl mx-auto">
        <div className="cta-box p-12 md:p-20 text-center flex flex-col items-center gap-7">

          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full"
            style={{ background: 'rgba(202,210,197,0.15)', color: 'var(--sage)', border: '1px solid rgba(202,210,197,0.25)' }}
          >
            <span className="dot-pulse w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
            Start for free today
          </span>

          {/* Headline */}
          <h2
            className="font-extrabold leading-tight text-white max-w-2xl"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Take Control of Your{' '}
            <span style={{ color: 'var(--accent)' }}>Career Process</span>
          </h2>

          {/* Sub */}
          <p
            className="max-w-lg leading-relaxed"
            style={{ color: 'rgba(202,210,197,0.85)', fontSize: '1.05rem' }}
          >
            Stop reacting to your job search and start running it like a system.
            Apply4works gives you the structure to move with clarity and purpose.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href="#"
              id="cta-start"
              className="btn-accent px-10 py-4 rounded-xl text-sm font-bold justify-center group"
            >
              Start Building
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#"
              id="cta-free"
              className="px-10 py-4 rounded-xl text-sm font-bold transition-all duration-250 justify-center flex items-center"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.18)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
              }}
            >
              Try It Free
            </a>
          </div>

          {/* Perks */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-1">
            {perks.map((p, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(202,210,197,0.7)' }}>
                <span style={{ color: 'var(--accent)' }}>{p.icon}</span>
                {p.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

