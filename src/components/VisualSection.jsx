const progressItems = [
  { label: 'Company Research',     pct: 88, color: 'var(--primary)' },
  { label: 'Resume Tailored',      pct: 72, color: 'var(--accent)' },
  { label: 'Outreach Sent',        pct: 55, color: 'var(--sage-dark)' },
  { label: 'Interviews Scheduled', pct: 30, color: 'var(--primary-mid)' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const activity  = [4, 7, 5, 9, 6]  // tasks completed per day

const flowNodes = [
  { label: 'Research',   status: 'done',    x: 0 },
  { label: 'Outreach',   status: 'done',    x: 1 },
  { label: 'Interview',  status: 'active',  x: 2 },
  { label: 'Offer',      status: 'pending', x: 3 },
]

export default function VisualSection() {
  const maxActivity = Math.max(...activity)

  return (
    <section
      className="py-24 px-6"
      id="visual"
      style={{ background: 'var(--bg-warm)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill-label mb-5 inline-flex">Your Dashboard</span>
          <h2
            className="font-extrabold leading-tight mt-5 mb-4"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'var(--text-heading)' }}
          >
            Everything at a Glance
          </h2>
          <p className="max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-body)', fontSize: '1.05rem' }}>
            Your workflow progress, task completion, and activity — all in one focused view.
          </p>
        </div>

        {/* Three panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Panel 1: Progress bars ── */}
          <div
            className="card p-6 flex flex-col gap-5"
            id="visual-progress"
            style={{ borderRadius: '20px' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
                Workflow Progress
              </h3>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
              >
                Active
              </span>
            </div>

            {progressItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-body)' }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-bold font-mono-dm" style={{ color: item.color }}>
                    {item.pct}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-bar-fill"
                    style={{ '--fill': `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Panel 2: Workflow flowchart ── */}
          <div
            className="card p-6 flex flex-col gap-4"
            id="visual-flow"
            style={{ borderRadius: '20px' }}
          >
            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-heading)' }}>
              Job Search Pipeline
            </h3>

            {/* Pipeline nodes */}
            <div className="relative flex items-center justify-between mt-4">
              {/* Connecting line */}
              <div
                className="absolute left-5 right-5 top-5 h-px"
                style={{ background: 'var(--border)', zIndex: 0 }}
              />
              {/* Active segment */}
              <div
                className="absolute left-5 top-5 h-px transition-all duration-1000"
                style={{ background: 'var(--primary)', width: '50%', zIndex: 1 }}
              />

              {flowNodes.map((node, i) => (
                <div key={i} className="flex flex-col items-center gap-2 z-10" style={{ width: '60px' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{
                      background: node.status === 'done'
                        ? 'var(--primary)'
                        : node.status === 'active'
                        ? '#fff'
                        : 'var(--bg-subtle)',
                      borderColor: node.status === 'pending'
                        ? 'var(--border)'
                        : 'var(--primary)',
                      color: node.status === 'done'
                        ? '#fff'
                        : node.status === 'active'
                        ? 'var(--primary)'
                        : 'var(--text-faint)',
                      boxShadow: node.status === 'active'
                        ? '0 0 0 4px var(--primary-light)'
                        : 'none',
                    }}
                  >
                    {node.status === 'done' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-semibold text-center"
                    style={{ color: node.status === 'pending' ? 'var(--text-faint)' : 'var(--text-body)' }}
                  >
                    {node.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats below pipeline */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Applications Tracked', val: '18' },
                { label: 'Responses Received',   val: '6' },
                { label: 'Interviews Booked',     val: '3' },
                { label: 'Avg. Response Rate',    val: '33%' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                >
                  <div className="font-extrabold text-lg" style={{ color: 'var(--primary)' }}>{s.val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Panel 3: Activity chart ── */}
          <div
            className="card p-6 flex flex-col gap-4"
            id="visual-activity"
            style={{ borderRadius: '20px' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
                Weekly Activity
              </h3>
              <span className="text-xs font-mono-dm font-medium" style={{ color: 'var(--text-muted)' }}>
                This week
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3 h-32 mt-2">
              {weekDays.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>
                    {activity[i]}
                  </span>
                  <div
                    className="w-full rounded-lg transition-all duration-700"
                    style={{
                      height: `${(activity[i] / maxActivity) * 96}px`,
                      background: i === 3 ? 'var(--primary)' : 'var(--sage)',
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Task completion indicator */}
            <div
              className="rounded-xl p-4 mt-2 flex items-center gap-4"
              style={{ background: 'var(--primary-light)', border: '1px solid rgba(31,122,108,0.15)' }}
            >
              <div className="flex-1">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-body)' }}>
                  Weekly goal completion
                </div>
                <div className="progress-track">
                  <div
                    className="progress-bar-fill"
                    style={{ '--fill': '74%', background: 'var(--primary)' }}
                  />
                </div>
              </div>
              <div className="font-extrabold text-xl" style={{ color: 'var(--primary)' }}>
                74%
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3 mt-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
                  12-day streak 🔥
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Keep it up — consistency compounds
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
