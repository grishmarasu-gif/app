const features = [
  {
    title: 'Workflow Builder',
    description: 'Create structured, step-by-step workflows for every phase of your job search — from research to offer.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    tag: 'Core',
    tagColor: 'var(--primary)',
    tagBg: 'var(--primary-light)',
    iconBg: 'var(--primary-light)',
    iconColor: 'var(--primary)',
  },
  {
    title: 'Application Tracker',
    description: 'Monitor every application — status, follow-up dates, contact details, and outcomes — in one clear view.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    tag: 'Tracking',
    tagColor: 'var(--accent-dark)',
    tagBg: 'var(--accent-light)',
    iconBg: 'var(--accent-light)',
    iconColor: 'var(--accent-dark)',
  },
  {
    title: 'Resume Feedback System',
    description: 'Improve your resume with structured, context-aware suggestions that align with your target role and industry.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    tag: 'Improvement',
    tagColor: 'var(--sage-dark)',
    tagBg: 'var(--sage-light)',
    iconBg: 'var(--sage-light)',
    iconColor: 'var(--sage-dark)',
  },
  {
    title: 'Daily Planner',
    description: 'Know exactly what to do every day. Your planner surfaces the right tasks at the right time so nothing slips.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    tag: 'Planning',
    tagColor: 'var(--primary)',
    tagBg: 'var(--primary-light)',
    iconBg: 'var(--primary-light)',
    iconColor: 'var(--primary)',
  },
]

export default function Features() {
  return (
    <section
      className="py-24 px-6"
      id="features"
      style={{ background: 'var(--bg-warm)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill-label-accent pill-label mb-5 inline-flex">Features</span>
          <h2
            className="font-extrabold leading-tight mt-5 mb-4"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'var(--text-heading)' }}
          >
            A Smarter Way to Manage Your Career
          </h2>
          <p className="max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-body)', fontSize: '1.05rem' }}>
            Every tool you need to stay organized, make progress, and improve over time — in one place.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              id={`feature-card-${i}`}
              className="card feature-card-inner flex flex-col gap-4 p-6 group"
              style={{ borderRadius: '18px' }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: f.iconBg, color: f.iconColor }}
              >
                {f.icon}
              </div>

              {/* Tag */}
              <span
                className="chip"
                style={{ background: f.tagBg, color: f.tagColor }}
              >
                {f.tag}
              </span>

              {/* Title */}
              <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-heading)' }}>
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-body)' }}>
                {f.description}
              </p>

              {/* Learn more link */}
              <a
                href="#cta"
                className="text-xs font-bold flex items-center gap-1 transition-all duration-200 group-hover:gap-2 w-fit"
                style={{ color: f.iconColor }}
              >
                Learn more
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
