import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const DURATIONS = [
  { label: '30 min',  value: 1800 },
  { label: '1 hour',  value: 3600 },
  { label: '2 hours', value: 7200 },
  { label: 'Custom',  value: 0 },
]
const APP_LIMITS = [5, 10, 20]

function fmt(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`
  return `${m}:${String(s).padStart(2,'0')}`
}

export default function AutoApplyPanel() {
  const { autoApply, autoSession, startAutoApply, stopAutoApply, appHistory } = useApp()
  const { currentUser, storedPrefs }  = useAuth()

  const [showModal,  setShowModal]  = useState(false)
  const [durOpt,     setDurOpt]     = useState(1800)
  const [customMins, setCustomMins] = useState(60)
  const [maxApps,    setMaxApps]    = useState(10)
  const [customMax,  setCustomMax]  = useState(10)
  const [minScore,   setMinScore]   = useState(80)
  const [useCustomMax, setUseCustomMax] = useState(false)

  const hasPref = storedPrefs?.roles?.length > 0
  const autoCount = appHistory.filter(a => a.appliedBy === 'Auto').length

  // ── Idle card ──────────────────────────────────────────────────────
  if (!autoApply) {
    return (
      <>
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Auto Apply</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: '#fef2f2', color: '#dc2626' }}>OFF</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-m)' }}>
                Automatically apply to matched jobs based on your profile.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-m)' }}>
            <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Checks domain, role, match score</div>
            <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Generates tailored resume &amp; cover letter</div>
            <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Stops at your time or app limit</div>
            <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Skip already-applied jobs</div>
          </div>

          {autoCount > 0 && (
            <div className="text-xs text-center font-semibold py-2 rounded-lg"
              style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>
              {autoCount} job{autoCount !== 1 ? 's' : ''} auto-applied this session
            </div>
          )}

          {!hasPref ? (
            <div className="rounded-lg px-3 py-2.5 text-xs font-medium"
              style={{ background: '#fef3c7', color: '#92400e' }}>
              ⚠️ Set your domain &amp; role preferences first.
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-md justify-center">
              ⚡ Configure &amp; Start Auto Apply
            </button>
          )}
        </div>

        {/* ── CONFIG MODAL ── */}
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid var(--border)' }}>

              {/* Modal header */}
              <div className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border)', background: 'var(--primary-lt)' }}>
                <div>
                  <h2 className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>⚡ Auto Apply Setup</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--sec-mid)' }}>
                    For: <strong>{currentUser?.name}</strong> · Roles: {storedPrefs?.roles?.slice(0,2).join(', ')}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#fff', color: 'var(--text-m)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Duration */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-2.5" style={{ color: 'var(--text-m)' }}>Session Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATIONS.map(d => (
                      <button key={d.label} onClick={() => setDurOpt(d.value)} className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: durOpt === d.value ? 'var(--primary-lt)' : 'var(--bg-subtle)', border: `1.5px solid ${durOpt === d.value ? 'var(--primary)' : 'var(--border)'}`, color: durOpt === d.value ? 'var(--primary)' : 'var(--text-b)' }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {durOpt === 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <input type="number" className="input flex-1" min={1} max={480} value={customMins}
                        onChange={e => setCustomMins(Number(e.target.value))} placeholder="Minutes" />
                      <span className="text-sm" style={{ color: 'var(--text-m)' }}>minutes</span>
                    </div>
                  )}
                </div>

                {/* Max apps */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-2.5" style={{ color: 'var(--text-m)' }}>Max Applications</label>
                  <div className="flex gap-2 flex-wrap">
                    {APP_LIMITS.map(n => (
                      <button key={n} onClick={() => { setMaxApps(n); setUseCustomMax(false) }} className="btn btn-sm"
                        style={{ background: maxApps === n && !useCustomMax ? 'var(--primary)' : 'var(--bg-subtle)', color: maxApps === n && !useCustomMax ? '#fff' : 'var(--text-b)', border: maxApps === n && !useCustomMax ? 'none' : '1px solid var(--border)' }}>
                        {n} jobs
                      </button>
                    ))}
                    <button onClick={() => setUseCustomMax(true)} className="btn btn-sm"
                      style={{ background: useCustomMax ? 'var(--primary)' : 'var(--bg-subtle)', color: useCustomMax ? '#fff' : 'var(--text-b)', border: useCustomMax ? 'none' : '1px solid var(--border)' }}>
                      Custom
                    </button>
                  </div>
                  {useCustomMax && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <input type="number" className="input flex-1" min={1} max={100} value={customMax}
                        onChange={e => setCustomMax(Number(e.target.value))} placeholder="Number of jobs" />
                      <span className="text-sm" style={{ color: 'var(--text-m)' }}>jobs</span>
                    </div>
                  )}
                </div>

                {/* Min match score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-m)' }}>Minimum Match Score</label>
                    <span className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>{minScore}%</span>
                  </div>
                  <input type="range" min={60} max={99} value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)', background: `linear-gradient(to right, var(--primary) ${minScore - 60}%, var(--border) 0)` }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-m)' }}>
                    <span>60%</span><span>80% (recommended)</span><span>99%</span>
                  </div>
                </div>

                {/* Rules reminder */}
                <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <p className="font-bold mb-1.5" style={{ color: 'var(--text-h)' }}>Auto Apply will:</p>
                  <div className="flex flex-col gap-1" style={{ color: 'var(--sec-mid)' }}>
                    <span>✓ Only apply to jobs ≥{minScore}% match</span>
                    <span>✓ Skip jobs you've already applied to</span>
                    <span>✓ Generate tailored resume + cover letter</span>
                    <span>✓ Stop after {useCustomMax ? customMax : maxApps} apps or {durOpt === 0 ? customMins + ' min' : fmt(durOpt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const tl = durOpt === 0 ? customMins * 60 : durOpt
                    const ma = useCustomMax ? customMax : maxApps
                    startAutoApply({ timeLimit: tl, maxApps: ma, minScore })
                    setShowModal(false)
                  }}
                  className="btn btn-primary btn-lg justify-center font-bold">
                  🚀 Start Auto Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── RUNNING SESSION ──────────────────────────────────────────────
  const s = autoSession
  if (!s) return null
  const pct = s.total > 0 ? Math.round((s.submitted / s.total) * 100) : 0

  return (
    <div className="card p-5 flex flex-col gap-4"
      style={{ border: '2px solid var(--primary)', background: 'var(--primary-lt)' }}>

      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Auto Apply: ON ⚡</span>
        </div>
        <button onClick={() => stopAutoApply('Auto Apply stopped')} className="btn btn-sm"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 700 }}>
          ■ Stop
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Submitted',  val: `${s.submitted} / ${s.total}`, color: 'var(--primary)' },
          { label: 'Remaining',  val: fmt(s.timeRemaining),           color: 'var(--accent-dk)' },
          { label: 'Max Limit',  val: `${s.maxApps} jobs`,            color: 'var(--sec-mid)' },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-2.5 text-center" style={{ background: '#fff' }}>
            <p className="font-extrabold text-sm" style={{ color: c.color }}>{c.val}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: 'var(--text-m)' }}>Applications progress</span>
          <span className="font-bold" style={{ color: 'var(--primary)' }}>{pct}%</span>
        </div>
        <div className="progress-track" style={{ height: 6 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, transition: 'width .5s ease' }} />
        </div>
      </div>

      {/* Current job */}
      {s.currentJob ? (
        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: s.currentJob.logoColor }}>{s.currentJob.logo}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: 'var(--text-h)' }}>
              Current: {s.currentJob.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-m)' }}>
              {s.currentJob.company} · {s.currentJob.score ?? s.currentJob.matchScore}% match
            </p>
          </div>
          <span className="text-xs font-semibold animate-pulse" style={{ color: 'var(--primary)' }}>Processing…</span>
        </div>
      ) : (
        <p className="text-xs text-center py-2" style={{ color: 'var(--sec-mid)' }}>✓ All queued jobs processed</p>
      )}

      <button onClick={() => stopAutoApply('Auto Apply stopped')} className="btn btn-md justify-center w-full font-bold"
        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
        ■ Stop Auto Apply Session
      </button>
    </div>
  )
}
