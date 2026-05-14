/* Workflow dashboard visual data */
const tasks = [
  { label: 'Research target companies', done: true,  pct: 100, color: 'var(--primary)' },
  { label: 'Update resume for role type', done: true,  pct: 100, color: 'var(--primary)' },
  { label: 'Write outreach templates',   done: false, pct: 65,  color: 'var(--accent)'  },
  { label: 'Schedule networking calls',  done: false, pct: 30,  color: 'var(--sage-dark)' },
]

const stats = [
  { label: 'Workflows Active', value: '3' },
  { label: 'Tasks Completed', value: '24' },
  { label: 'This Week',        value: '6' },
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 pt-28 pb-20 max-w-6xl mx-auto"
    >

      {/* ── LEFT: Copy ── */}
      <div className="flex-1 max-w-xl text-center lg:text-left">

        {/* Pill */}
        <div className="fade-up fade-up-d1 inline-flex mb-6">
          <span className="pill-label">
            <span className="dot-pulse w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />
            Career Productivity System
          </span>
        </div>

        {/* Headline */}
        <h1
          className="fade-up fade-up-d2 font-extrabold leading-[1.12] tracking-tight mb-5"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: 'var(--text-heading)' }}
        >
          Design a Career System{' '}
          <span style={{ color: 'var(--primary)' }}>That Actually Works</span>
        </h1>

        {/* Subtext */}
        <p
          className="fade-up fade-up-d3 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
          style={{ color: 'var(--text-body)' }}
        >
          Apply4works helps you build repeatable workflows, stay consistent, and move forward
          with clarity in your job search.
        </p>

        {/* Buttons */}
        <div className="fade-up fade-up-d4 flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start">
          <a
            href="#cta"
            id="hero-primary-cta"
            className="btn-primary px-7 py-3.5 rounded-xl text-sm group w-full sm:w-auto justify-center"
          >
            Build My Workflow
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#features"
            id="hero-secondary-cta"
            className="btn-secondary px-7 py-3.5 rounded-xl text-sm w-full sm:w-auto justify-center"
          >
            View Demo
          </a>
        </div>

        {/* Social proof micro line */}
        <p className="fade-up fade-up-d5 mt-7 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Trusted by <span className="font-bold" style={{ color: 'var(--text-body)' }}>2,400+</span> structured job seekers · No credit card required
        </p>
      </div>

      {/* ── RIGHT: Dashboard visual ── */}
      <div className="fade-up fade-up-d3 flex-1 w-full max-w-md gentle-float">
        <div className="dashboard-card">

          {/* Topbar */}
          <div className="dashboard-topbar">
            <span className="dashboard-dot" style={{ background: '#FC8181' }} />
            <span className="dashboard-dot" style={{ background: '#F6AD55' }} />
            <span className="dashboard-dot" style={{ background: '#68D391' }} />
            <span className="ml-3 text-xs font-mono-dm font-medium" style={{ color: 'var(--text-muted)' }}>
              Apply4works / my-workflow
            </span>
          </div>

          <div className="p-5 flex flex-col gap-5">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                >
                  <div className="stat-num" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                  <div className="text-xs mt-1 font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Today's Tasks
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
              >
                2 / 4 done
              </span>
            </div>

            {/* Task list */}
            <div className="flex flex-col gap-2.5">
              {tasks.map((t, i) => (
                <div key={i} className="task-row">
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: t.done ? 'var(--primary)' : 'transparent',
                      border: t.done ? 'none' : '1.5px solid var(--border-mid)',
                    }}
                  >
                    {t.done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Label + bar */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold mb-1 truncate"
                      style={{
                        color: t.done ? 'var(--text-muted)' : 'var(--text-body)',
                        textDecoration: t.done ? 'line-through' : 'none',
                      }}
                    >
                      {t.label}
                    </div>
                    <div className="progress-track" style={{ height: '4px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{ '--fill': `${t.pct}%`, background: t.color }}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono-dm flex-shrink-0" style={{ color: t.color }}>
                    {t.pct}%
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom add button */}
            <button
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
              style={{
                border: '1.5px dashed var(--border-mid)',
                color: 'var(--text-muted)',
                background: 'transparent',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add task to workflow
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

