const benefits = [
  {
    number: '01',
    title: 'Clarity Over Chaos',
    description:
      'Organize your job search into a clear, repeatable system. No more scattered spreadsheets or forgotten follow-ups — everything lives in one structured place.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'var(--primary-light)',
    iconColor: 'var(--primary)',
    accent: 'var(--primary)',
  },
  {
    number: '02',
    title: 'Consistent Execution',
    description:
      'Stay on track with guided daily actions and structured workflows. Small, intentional steps each day compound into meaningful career progress.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    bg: 'var(--accent-light)',
    iconColor: 'var(--accent-dark)',
    accent: 'var(--accent)',
  },
  {
    number: '03',
    title: 'Measurable Progress',
    description:
      'Track what\'s working and adjust your approach over time. Data-driven insights help you double down on strategies that get results.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bg: 'var(--sage-light)',
    iconColor: 'var(--sage-dark)',
    accent: 'var(--sage-dark)',
  },
  {
    number: '04',
    title: 'Sustainable Growth',
    description:
      'Build habits that improve your career long-term. Apply4works isn\'t a one-time sprint — it\'s a system that grows with you at every stage.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    bg: 'var(--primary-light)',
    iconColor: 'var(--primary)',
    accent: 'var(--primary)',
  },
]

export default function Benefits() {
  return (
    <section className="py-24 px-6" id="benefits">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill-label mb-5 inline-flex">Why Apply4works</span>
          <h2
            className="font-extrabold leading-tight mt-5 mb-4"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'var(--text-heading)' }}
          >
            Built Around How You Actually Work
          </h2>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-body)', fontSize: '1.05rem' }}>
            Most job seekers struggle not from lack of effort — but from lack of a system.
            Apply4works gives you the structure to channel your effort effectively.
          </p>
        </div>

        {/* Benefit grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              id={`benefit-${i}`}
              className="card p-8 flex gap-5 group"
              style={{ borderRadius: '18px' }}
            >
              {/* Icon */}
              <div
                className="benefit-icon-wrap flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                style={{ background: b.bg, color: b.iconColor }}
              >
                {b.icon}
              </div>

              {/* Text */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold font-mono-dm" style={{ color: 'var(--text-faint)' }}>
                    {b.number}
                  </span>
                  <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-heading)' }}>
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {b.description}
                </p>
                {/* Hover accent bar */}
                <div
                  className="mt-4 h-0.5 w-0 group-hover:w-12 transition-all duration-400 rounded-full"
                  style={{ background: b.accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

