const steps = [
  {
    number: '01',
    title: 'Define Your Direction',
    description:
      'Set your career goals, target roles, and the types of companies you want to work with. Clarity at this stage shapes everything that follows.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'var(--primary)',
    bg: 'var(--primary-light)',
  },
  {
    number: '02',
    title: 'Build Your Workflow',
    description:
      'Use the Workflow Builder to map out every step of your job search — from research to outreach to interviews. Structured and repeatable.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    color: 'var(--accent-dark)',
    bg: 'var(--accent-light)',
  },
  {
    number: '03',
    title: 'Execute Daily Tasks',
    description:
      'Your Daily Planner shows exactly what to work on each day. No guesswork — just clear, prioritized actions that move the needle.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'var(--primary)',
    bg: 'var(--sage-light)',
  },
  {
    number: '04',
    title: 'Track and Improve',
    description:
      'Review your progress weekly. See what\'s working, identify gaps, and refine your workflow to continuously improve your approach.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'var(--sage-dark)',
    bg: 'var(--primary-light)',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" id="how-it-works">
      <div className="max-w-6xl mx-auto">

        {/* Divider */}
        <div className="section-divider mb-20" />

        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill-label mb-5 inline-flex">Process</span>
          <h2
            className="font-extrabold leading-tight mt-5 mb-4"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'var(--text-heading)' }}
          >
            Simple Process. Real Results.
          </h2>
          <p className="max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-body)', fontSize: '1.05rem' }}>
            Four clear steps that take you from scattered effort to a structured, repeatable career system.
          </p>
        </div>

        {/* Steps — vertical list with connecting line */}
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          {steps.map((s, i) => (
            <div key={i} id={`step-${i + 1}`} className="flow-step step-wrap group">
              {/* Number circle */}
              <div className="step-circle">{s.number}</div>

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-heading)' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {s.description}
                </p>
              </div>

              {/* Step indicator tag */}
              <span
                className="hidden sm:flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 self-start mt-1"
                style={{ background: s.bg, color: s.color }}
              >
                Step {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
