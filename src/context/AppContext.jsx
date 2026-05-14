import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { jobs as initialJobs } from '../data/jobs'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────
const LS = {
  get:  (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set:  (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}

// ── Match score calculation ───────────────────────────────────────
function calcPrefScore(job, prefs) {
  if (!prefs || !prefs.roles?.length) return job.matchScore
  let boost = 0
  prefs.roles.forEach(r => {
    if (job.title.toLowerCase().includes(r.toLowerCase().split(' ')[0])) boost += 8
  })
  return Math.min(99, job.matchScore + boost)
}

// ── Build initial status map ──────────────────────────────────────
function buildStatusMap() {
  const m = {}
  initialJobs.forEach(j => { m[j.id] = j.status })
  return m
}

export function AppProvider({ children }) {
  const { sessionEmail, currentUser, storedPrefs } = useAuth()

  const email      = sessionEmail || '__guest__'
  const statusKey  = `a4f_statuses_${email}`
  const appsKey    = `a4f_apps_${email}`
  const followKey  = `a4f_followups_${email}`

  // ── Per-user state from localStorage ─────────────────────────
  const [jobStatuses, setJobStatusesState] = useState(() => LS.get(statusKey, buildStatusMap()))
  const [appHistory,  setAppHistoryState]  = useState(() => LS.get(appsKey, []))
  const [followUps,   setFollowUpsState]   = useState(() => LS.get(followKey, {}))

  // ── Auto Apply session ─────────────────────────────────────────
  const [autoApply,    setAutoApply]   = useState(false)
  const [autoSession,  setAutoSession] = useState(null)
  const timerRef   = useRef(null)
  const applierRef = useRef(null)

  // ── Toast state ───────────────────────────────────────────────
  const [toasts, setToasts] = useState([])

  function toast(msg, type = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  // ── Persisted setters ─────────────────────────────────────────
  function setJobStatuses(updater) {
    setJobStatusesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      LS.set(statusKey, next)
      return next
    })
  }
  function setAppHistory(updater) {
    setAppHistoryState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      LS.set(appsKey, next)
      return next
    })
  }
  function setFollowUps(updater) {
    setFollowUpsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      LS.set(followKey, next)
      return next
    })
  }

  // ── Enriched jobs ─────────────────────────────────────────────
  const jobs = initialJobs.map(j => ({
    ...j,
    status: jobStatuses[j.id] ?? j.status,
    prefMatchScore: calcPrefScore(j, storedPrefs),
  }))

  // ── Save job ──────────────────────────────────────────────────
  function saveJob(jobId) {
    setJobStatuses(s => {
      const next = s[jobId] === 'Saved' ? 'New' : 'Saved'
      toast(next === 'Saved' ? 'Job saved 🔖' : 'Removed from saved')
      return { ...s, [jobId]: next }
    })
  }

  // ── Apply to job ──────────────────────────────────────────────
  function applyToJob(jobId, appliedBy = 'Manual') {
    // Prevent duplicate
    if (appHistory.some(a => a.jobId === jobId)) {
      if (appliedBy === 'Manual') toast('Already applied to this job', 'info')
      return false
    }
    const job   = initialJobs.find(j => j.id === jobId)
    const score = calcPrefScore(job, storedPrefs)

    setJobStatuses(s => ({ ...s, [jobId]: 'Applied' }))
    setAppHistory(h => [...h, {
      jobId,
      appliedBy,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Applied',
      matchScore: score,
      resumeUsed: `${job?.title ?? 'Resume'} – Tailored`,
    }])

    if (appliedBy === 'Manual') toast('Application submitted! 🎉')
    else toast(`Auto Apply: Applied to ${job?.title} ⚡`, 'success')
    return true
  }

  function markInterview(jobId) {
    setJobStatuses(s => ({ ...s, [jobId]: 'Interview' }))
    setAppHistory(h => h.map(a => a.jobId === jobId ? { ...a, status: 'Interview' } : a))
    toast('Moved to Interview stage 🎤')
  }

  function markRejected(jobId) {
    setJobStatuses(s => ({ ...s, [jobId]: 'Rejected' }))
    setAppHistory(h => h.map(a => a.jobId === jobId ? { ...a, status: 'Rejected' } : a))
    toast('Marked as Rejected', 'info')
  }

  function sendFollowUp(jobId) {
    setFollowUps(f => ({ ...f, [jobId]: true }))
    toast('Follow-up sent 📧')
  }

  // ── Stop Auto Apply ───────────────────────────────────────────
  const stopAutoApply = useCallback((msg = 'Auto Apply session stopped') => {
    if (timerRef.current)   clearInterval(timerRef.current)
    if (applierRef.current) clearInterval(applierRef.current)
    timerRef.current = applierRef.current = null
    setAutoApply(false)
    setAutoSession(s => s ? { ...s, running: false, currentJob: null } : null)
    toast(msg, 'info')
  }, [])

  // ── Start Auto Apply ──────────────────────────────────────────
  const startAutoApply = useCallback(({ timeLimit, maxApps, minScore }) => {
    // Validate user profile
    if (!currentUser) { toast('Please log in first', 'error'); return }
    if (!storedPrefs?.roles?.length) { toast('Set your role preferences first', 'info'); return }

    // Build eligible queue
    const currentStatuses = LS.get(statusKey, {})
    const queue = initialJobs
      .map(j => ({ ...j, score: calcPrefScore(j, storedPrefs) }))
      .filter(j => {
        const s = currentStatuses[j.id] ?? j.status
        const alreadyApplied = LS.get(appsKey, []).some(a => a.jobId === j.id)
        return j.score >= minScore && !alreadyApplied &&
          s !== 'Applied' && s !== 'Interview' && s !== 'Rejected'
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxApps)

    if (queue.length === 0) {
      toast(`No eligible jobs found (≥${minScore}% match, not yet applied)`, 'info')
      return
    }

    setAutoApply(true)
    setAutoSession({ running: true, submitted: 0, timeRemaining: timeLimit, maxApps, minScore, currentJob: queue[0], queue, total: queue.length, idx: 0 })
    toast(`Auto Apply started — ${queue.length} jobs queued ⚡`)

    let timeLeft  = timeLimit
    let submitted = 0
    let idx       = 0

    // Countdown every second
    timerRef.current = setInterval(() => {
      timeLeft -= 1
      setAutoSession(s => s ? { ...s, timeRemaining: timeLeft } : null)
      if (timeLeft <= 0) {
        clearInterval(timerRef.current)
        clearInterval(applierRef.current)
        timerRef.current = applierRef.current = null
        setAutoApply(false)
        setAutoSession(s => s ? { ...s, running: false, currentJob: null } : null)
        toast(`Auto Apply complete — ${submitted} application${submitted !== 1 ? 's' : ''} submitted ✓`)
      }
    }, 1000)

    // Apply one job every 3 seconds
    applierRef.current = setInterval(() => {
      if (idx >= queue.length || submitted >= maxApps) {
        clearInterval(applierRef.current)
        clearInterval(timerRef.current)
        timerRef.current = applierRef.current = null
        setAutoApply(false)
        setAutoSession(s => s ? { ...s, running: false, currentJob: null } : null)
        toast(`Auto Apply complete — ${submitted} application${submitted !== 1 ? 's' : ''} submitted ✓`)
        return
      }
      const job = queue[idx]
      const applied = applyToJob(job.id, 'Auto')
      if (applied) submitted += 1
      idx += 1
      setAutoSession(s => s ? { ...s, submitted, idx, currentJob: idx < queue.length ? queue[idx] : null } : null)
    }, 3000)
  }, [sessionEmail, storedPrefs, statusKey, appsKey]) // eslint-disable-line

  return (
    <AppContext.Provider value={{
      jobs, jobStatuses,
      saveJob, applyToJob, markInterview, markRejected, sendFollowUp,
      followUps, appHistory,
      autoApply, setAutoApply,
      autoSession,
      startAutoApply, stopAutoApply,
      toast,
    }}>
      {children}

      {/* Global toast */}
      <div className="fixed bottom-6 right-6 z-[400] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 320 }}>
        {toasts.map(t => (
          <div key={t.id} className="px-5 py-3 rounded-xl text-sm font-semibold shadow-lg pointer-events-auto"
            style={{ background: t.type === 'success' ? 'var(--primary)' : t.type === 'info' ? 'var(--sec-mid)' : '#dc2626', color: '#fff', animation: 'fadeUp .3s ease both' }}>
            {t.msg}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
