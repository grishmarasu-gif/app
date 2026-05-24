import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';

export default function Dashboard() {
  const { toast, appHistory } = useApp()
  const { currentUser, storedPrefs }   = useAuth()
  const navigate = useNavigate()

  const preferences = storedPrefs || { domains: [], roles: [], workPreference: '', experienceLevel: '' }
  const firstName  = (currentUser?.name || 'User').split(' ')[0]
  const hasPref    = preferences.domains.length > 0

  // Backend states
  const [dashboardJobs, setDashboardJobs] = useState([])
  const [stats, setStats] = useState({ totalJobsToday: 0, appliedCount: 0, savedCount: 0 })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      console.log(`[Frontend Dashboard] Fetching jobs from: ${API_BASE}/jobs?sort=newest`);

      const [jobsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/jobs?sort=newest`),
        fetch(`${API_BASE}/stats`)
      ])

      if (jobsRes.ok) {
        let data;
        try { data = await jobsRes.json(); } catch { data = { jobs: [] }; }
        console.log('[Frontend Dashboard] Jobs array length:', Array.isArray(data) ? data.length : (data.jobs ? data.jobs.length : 0))
        setDashboardJobs(Array.isArray(data) ? data : (data.jobs || []))
      } else {
        throw new Error(`API failed with status: ${jobsRes.status}`)
      }

      if (statsRes.ok) {
        try {
          const statsData = await statsRes.json()
          setStats(statsData)
        } catch (e) {}
      }
    } catch (err) {
      console.error('[Frontend Dashboard] Error fetching dashboard data:', err)
      setDashboardJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleApply = async (job) => {
    if (job.apply_link) {
      window.open(job.apply_link, '_blank')
    }

    try {

      const res = await fetch(`${API_BASE}/apply-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      })

      if (res.ok) {
        setDashboardJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Applied' } : j))
        toast('Job marked as applied! 🎉')
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error applying:', error)
      toast('Failed to update status', 'error')
    }
  }

  function isPrefMatch(j) {
    if (!preferences.roles?.length) return false
    return preferences.roles.some(r => j.title.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
  }

  // Recommended = top 6 jobs sorted by preference match
  const recommended = [...dashboardJobs].sort((a, b) => {
    const aMatch = isPrefMatch(a)
    const bMatch = isPrefMatch(b)
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return b.matchScore - a.matchScore
  }).slice(0, 6)

  const topScore = dashboardJobs.length ? Math.max(...dashboardJobs.map(j => j.matchScore)) : 0

  const quickActions = [
    { label: 'Daily Jobs',   to: '/jobs',         icon: '💼', color: 'var(--primary)' },
    { label: 'Build Resume', to: '/resume',        icon: '📝', color: 'var(--accent-dk)' },
    { label: 'Applications', to: '/applications',  icon: '📋', color: 'var(--sage-dk)' },
    { label: 'Edit Prefs',   to: '#',             icon: '⚙️', color: 'var(--sec-mid)', action: true },
  ]

  const statusBadge = { New: 'badge-blue', Saved: 'badge-sage', Applied: 'badge-orange', Interview: 'badge-green' }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 240 }}>
        <TopBar title="Dashboard" subtitle={`Welcome back, ${firstName} 👋`} />
        <main className="p-7 flex flex-col gap-7">

          {/* Preference banner */}
          {hasPref && (
            <div className="rounded-xl px-5 py-4 flex flex-wrap items-center gap-4"
              style={{ background: 'var(--primary-lt)', border: '1px solid rgba(31,122,108,.18)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--primary)' }}>Active Career Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.domains.map(d => <span key={d} className="badge badge-green">{d}</span>)}
                  {preferences.roles.map(r => (
                    <span key={r} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--accent-lt)', color: 'var(--accent-dk)', border: '1px solid rgba(244,162,97,.2)' }}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {preferences.workPreference && <span className="badge badge-slate">{preferences.workPreference}</span>}
                {preferences.experienceLevel && <span className="badge badge-slate">{preferences.experienceLevel}</span>}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Jobs Available Today" value={stats.totalJobsToday || 0} sub="New listings"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
            <StatCard label="Best Matches" value={`${topScore}%`} sub="Top preference match"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              color="var(--accent-dk)" iconBg="var(--accent-lt)" />
            <StatCard label="Saved Jobs" value={stats.savedCount || 0} sub="Ready to apply"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
              color="var(--sage-dk)" iconBg="var(--sage-lt)" />
            <StatCard label="Applications Submitted" value={appHistory?.length || 0} sub={`${appHistory?.length || 0} submitted`}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {/* Quick actions */}
            <div className="card p-5">
              <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(a => (
                  a.action
                    ? <button key={a.label} className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                        onClick={() => { /* Edit Prefs handled in Sidebar */ }}>
                        <span className="text-2xl">{a.icon}</span>
                        <span className="text-xs font-semibold" style={{ color: a.color }}>{a.label}</span>
                      </button>
                    : <Link key={a.label} to={a.to}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                        <span className="text-2xl">{a.icon}</span>
                        <span className="text-xs font-semibold" style={{ color: a.color }}>{a.label}</span>
                      </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-5 flex flex-col">
              <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Recent Activity</h2>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <span className="text-3xl mb-2">⏳</span>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>No activity yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>Your recent job applications will appear here.</p>
              </div>
            </div>
          </div>

          {/* ── Recommended Jobs ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>Recommended Jobs</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>
                  {loading ? 'Loading best matches...' : (hasPref ? 'Matched to your domain and role preferences' : 'Top matches for your profile')}
                </p>
              </div>
              <Link to="/jobs" className="btn btn-ghost btn-sm">See all →</Link>
            </div>

            {loading ? (
               <div className="p-10 text-center"><p style={{ color: 'var(--text-m)' }}>Loading jobs from server...</p></div>
            ) : recommended.length === 0 ? (
               <div className="p-10 text-center flex flex-col items-center gap-2 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                 <span className="text-3xl">🔍</span>
                 <p className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>No jobs available yet</p>
                 <p className="text-xs" style={{ color: 'var(--text-m)' }}>Check back later for new matches.</p>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommended.map(j => {
                  const score = j.matchScore
                  const prefMatch = isPrefMatch(j)
                  const isApplied = j.status === 'Applied' || j.status === 'Interview'

                  return (
                    <div key={j.id} className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: prefMatch ? 'var(--primary-lt)' : '#fff', border: `1px solid ${prefMatch ? 'rgba(31,122,108,.2)' : 'var(--border)'}` }}>

                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: j.logoColor }}>{j.logo}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm leading-snug truncate" style={{ color: 'var(--text-h)' }} title={j.title}>{j.title}</h3>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-m)' }} title={j.company}>{j.company} · {j.location}</p>
                        </div>
                        {/* Match score ring */}
                        <div className="match-ring flex-shrink-0"
                          style={{ width: 38, height: 38, fontSize: '.7rem', fontWeight: 800,
                            background: score >= 88 ? 'var(--primary-lt)' : 'var(--accent-lt)',
                            color: score >= 88 ? 'var(--primary)' : 'var(--accent-dk)' }}>
                          {score}%
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`badge ${j.workType === 'Remote' ? 'badge-green' : j.workType === 'Hybrid' ? 'badge-orange' : 'badge-slate'}`}>{j.workType}</span>
                        <span className="badge badge-slate">{j.experienceLevel}</span>
                        {prefMatch && <span className="badge badge-green">Role Match ✓</span>}
                        <span className={`badge ${statusBadge[j.status] || 'badge-slate'}`}>{j.status}</span>
                      </div>

                      {/* Salary + skills */}
                      <div className="text-xs" style={{ color: 'var(--text-b)' }}>
                        <span className="font-semibold">{j.salary}</span>
                        <span className="mx-2" style={{ color: 'var(--border-md)' }}>·</span>
                        {j.skills.slice(0, 3).join(', ')}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1 border-t mt-auto" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                        <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">View</Link>
                        <Link to={`/resume?job=${j.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">Resume</Link>
                        {isApplied
                          ? <span className="btn btn-sm flex-1 justify-center" style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none' }}>✓ Applied</span>
                          : <button className="btn btn-primary btn-sm flex-1 justify-center" onClick={() => handleApply(j)}>Quick Apply</button>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
