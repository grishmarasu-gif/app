import { useState, useEffect, useCallback } from 'react'
import { Link }     from 'react-router-dom'
import Sidebar       from '../components/Sidebar'
import TopBar        from '../components/TopBar'
import AutoApplyPanel from '../components/AutoApplyPanel'
import ProGate from '../components/ProGate'
import { useApp }    from '../context/AppContext'
import { useAuth }   from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';

const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site']
const JOB_TYPES  = ['All', 'Full-time', 'Internship', 'Contract']
const LEVELS     = ['All', 'Entry-Level', 'Mid-Level', 'Senior']
const STATUS_BADGE = {
  New:       'badge-blue',
  Saved:     'badge-sage',
  Applied:   'badge-orange',
  Interview: 'badge-green',
  Rejected:  'badge-red',
}

export default function DailyJobs() {
  const { appHistory, autoApply, toast, withdrawApplication } = useApp()
  const { storedPrefs, currentUser } = useAuth()

  // Safely destructure preferences
  const prefs = {
    domains: storedPrefs?.domains || [],
    roles: storedPrefs?.roles || [],
    skills: storedPrefs?.skills || [],
    workPreference: storedPrefs?.workPreference || '',
    experienceLevel: storedPrefs?.experienceLevel || ''
  }

  const [search,        setSearch]        = useState('')
  const [workType,      setWorkType]      = useState('All')
  const [jobType,       setJobType]       = useState('All')
  const [level,         setLevel]         = useState('All')
  const [view,          setView]          = useState('grid')
  const [sortBy,        setSortBy]        = useState('newest')
  const [showPrefOnly,  setShowPrefOnly]  = useState(true)
  
  // Backend states
  const [jobsData, setJobsData] = useState([])
  const [stats, setStats] = useState({ totalJobsToday: 0, appliedCount: 0, savedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  const fetchJobs = async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (workType !== 'All') params.append('workType', workType)
      if (jobType !== 'All') params.append('jobType', jobType)
      if (level !== 'All') params.append('level', level)
      if (showPrefOnly && prefs.roles.length > 0) params.append('roles', prefs.roles.join(','))
      params.append('sort', sortBy)
      params.append('page', pageNum)
      params.append('limit', 50)

      console.log(`[Frontend] Fetching jobs from: ${API_BASE}/jobs?${params.toString()}`);

      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [jobsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/jobs?${params.toString()}`, { credentials: 'include', headers }),
        !append ? fetch(`${API_BASE}/stats`, { credentials: 'include', headers }) : Promise.resolve(null)
      ])

      if (jobsRes.ok) {
        let data;
        try { data = await jobsRes.json(); } catch { data = { jobs: [] }; }
        let fetchedJobs = data.jobs || data.data || data;
        if (!Array.isArray(fetchedJobs)) fetchedJobs = [];
        setJobsData(prev => append ? [...prev, ...fetchedJobs] : fetchedJobs)
        if (data.totalPages) setTotalPages(data.totalPages)
        if (data.totalJobs !== undefined) setTotalJobs(data.totalJobs)
      } else {
        throw new Error(`API failed with status: ${jobsRes.status}`)
      }

      if (statsRes && statsRes.ok) {
        try {
          const statsData = await statsRes.json()
          setStats(statsData)
        } catch (e) {}
      }
    } catch (err) {
      console.error('[Frontend] Error fetching jobs:', err)
      if (!append) setJobsData([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Fetch when filters change (resets to page 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchJobs(1, false)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, workType, jobType, level, showPrefOnly, sortBy, storedPrefs])

  // Fetch when page changes (Load More)
  useEffect(() => {
    if (page > 1) {
      fetchJobs(page, true)
    }
  }, [page])

  const markApplied = async (job) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/apply-job`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ jobId: job.id })
      })

      if (res.ok) {
        setJobsData(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Applied' } : j))
        toast('Job marked as applied! 🎉')
        fetchJobs() // refresh stats
      }
    } catch (error) {
      console.error('Error applying:', error)
      toast('Failed to update status', 'error')
    }
  }

  const undoApply = async (job) => {
    withdrawApplication(job.id)
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/jobs/${job.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: 'New' })
      })
      if (res.ok) {
        setJobsData(prev => prev.map(j => j.id === job.id ? { ...j, status: 'New' } : j))
        fetchJobs()
      }
    } catch (e) {}
  }

  const handleSave = async (jobId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/save-job`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ jobId })
      })

      if (res.ok) {
        let data;
        try { data = await res.json() } catch { data = {} }
        setJobsData(prev => prev.map(j => j.id === jobId ? { ...j, status: data.saved ? 'Saved' : 'New' } : j))
        toast(data.saved ? 'Job saved 🔖' : 'Removed from saved')
        fetchJobs()
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const hasPref = prefs.roles.length > 0

  const isPrefMatch = (j) => {
    return j.matchScore >= 70
  }

  // Backend now handles all filtering, so we can use jobsData directly
  const filtered = jobsData;

  // Stats for UI
  const bestMatch = jobsData.length ? Math.max(...jobsData.map(j => j.matchScore)) : 0
  const prefCount = jobsData.filter(j => isPrefMatch(j)).length

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 overflow-x-hidden" style={{ marginLeft: 240 }}>
        <TopBar
          title="Daily Jobs"
          subtitle="Curated job matches updated every morning"
          actions={
            <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: autoApply ? 'var(--primary-lt)' : '#fef2f2', color: autoApply ? 'var(--primary)' : '#dc2626' }}>
              Auto Apply: {autoApply ? 'ON ⚡' : 'OFF'}
            </span>
          }
        />

        <main className="p-7 flex flex-col gap-6">

          {/* ── Stats bar ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Jobs Today',       value: 0,                     sub: 'New listings',      color: 'var(--primary)',   bg: 'var(--primary-lt)' },
              { label: 'Applied',          value: 0,                     sub: 'Total applied',     color: 'var(--accent-dk)', bg: 'var(--accent-lt)' },
              { label: 'Saved',            value: 0,                     sub: 'Ready to apply',    color: 'var(--sage-dk)',   bg: 'var(--sage-lt)' },
              { label: 'Pref. Matches',    value: 0,                     sub: 'Match your roles',  color: 'var(--primary)',   bg: 'var(--primary-lt)' },
            ].map(c => (
              <div key={c.label} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                  style={{ background: c.bg, color: c.color }}>{c.value}</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{c.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-m)' }}>{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* ── LEFT: jobs column ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* Preference filter strip */}
              {hasPref && (
                <div className="rounded-xl px-5 py-3 flex flex-wrap items-center gap-3"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-m)' }}>PREF FILTER:</span>
                  {prefs.roles.slice(0, 3).map(r => <span key={r} className="badge badge-green">{r}</span>)}
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{prefCount} matched</span>
                  <button onClick={() => setShowPrefOnly(v => !v)}
                    className="ml-auto btn btn-sm"
                    style={{ background: showPrefOnly ? 'var(--primary)' : 'transparent', color: showPrefOnly ? '#fff' : 'var(--text-b)', border: `1px solid ${showPrefOnly ? 'transparent' : 'var(--border)'}` }}>
                    {showPrefOnly ? '✓ Pref Only' : 'Show Pref Only'}
                  </button>
                </div>
              )}

              {/* Search + filters */}
              <div className="card p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-44">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input className="input" style={{ paddingLeft: '36px' }} placeholder="Search jobs, companies, skills…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Work type toggles */}
                <div className="flex gap-1.5 flex-wrap">
                  {WORK_TYPES.map(t => (
                    <button key={t} onClick={() => setWorkType(t)} className="btn btn-sm"
                      style={{ background: workType === t ? 'var(--primary)' : 'var(--bg-subtle)', color: workType === t ? '#fff' : 'var(--text-b)', border: workType === t ? 'none' : '1px solid var(--border)' }}>{t}</button>
                  ))}
                </div>

                <select className="input" style={{ width: 'auto' }} value={jobType} onChange={e => setJobType(e.target.value)}>
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>

                <select className="input" style={{ width: 'auto' }} value={level} onChange={e => setLevel(e.target.value)}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>

                {/* Grid / Table toggle */}
                <div className="flex gap-0.5 p-1 rounded-lg" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  {[['grid','▦'],['table','☰']].map(([v, ic]) => (
                    <button key={v} onClick={() => setView(v)} className="w-8 h-7 rounded-md text-sm"
                      style={{ background: view === v ? '#fff' : 'transparent', color: view === v ? 'var(--primary)' : 'var(--text-m)', boxShadow: view === v ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>{ic}</button>
                  ))}
                </div>
              </div>

              {/* Result count + sort */}
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-m)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-h)' }}>{loading ? '...' : totalJobs}</span> jobs found
                </p>
                <select className="input text-xs" style={{ width: 'auto', padding: '6px 12px' }}
                  value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="match">Best Match</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {loading && <div className="p-10 text-center"><p style={{ color: 'var(--text-m)' }}>Loading jobs from server...</p></div>}

              {/* ── GRID VIEW ── */}
              {!loading && view === 'grid' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {filtered.map(j => <JobCard key={j.id} job={j} isPrefMatch={isPrefMatch(j)} autoApply={autoApply} onMarkApplied={() => markApplied(j)} onSave={() => handleSave(j.id)} undoApply={undoApply} canApplyJobs={currentUser?.canApplyJobs !== false} />)}
                  {filtered.length === 0 && <EmptyState onClear={() => { setSearch(''); setWorkType('All'); setJobType('All'); setLevel('All') }} />}
                </div>
              )}

              {/* ── TABLE VIEW ── */}
              {!loading && view === 'table' && (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                          {['Role','Company','Location','Type','Salary','Match','Status','Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-m)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((j, i) => {
                          const score     = j.matchScore
                          const isApplied = j.status === 'Applied' || j.status === 'Interview'
                          return (
                            <tr key={j.id} className="border-b" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.012)' }}>
                              <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-h)' }}>
                                {j.title} {isPrefMatch(j) && <span className="ml-1 badge badge-green">Match</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: j.logoColor }}>{j.logo}</div>
                                  <span style={{ color: 'var(--text-b)' }}>{j.company}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3" style={{ color: 'var(--text-m)' }}>{j.location}</td>
                              <td className="px-4 py-3"><span className="badge badge-slate">{j.workType}</span></td>
                              <td className="px-4 py-3 font-medium">{j.salary}</td>
                              <td className="px-4 py-3 font-bold text-xs" style={{ color: score >= 85 ? 'var(--primary)' : 'var(--accent-dk)' }}>{score}%</td>
                              <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[j.status] || 'badge-slate'}`}>{j.status}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1.5 flex-wrap">
                                  <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm">View</Link>
                                  <button onClick={() => handleSave(j.id)} className="btn btn-ghost btn-sm">{j.status === 'Saved' ? '🔖' : 'Save'}</button>
                                  {isApplied
                                    ? <button onClick={() => undoApply(j)} className="btn btn-sm hover:opacity-80 transition-opacity" style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none' }} title="Click to undo">✓ Applied</button>
                                    : (
                                      <div className="flex gap-1">
                                        <a href={j.apply_link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply</a>
                                        <button onClick={() => markApplied(j)} className="btn btn-sm text-xs" style={{ padding: '0 6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }} title="Mark as applied">✓</button>
                                      </div>
                                    )
                                  }
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filtered.length === 0 && <div className="p-10 text-center"><p style={{ color: 'var(--text-m)' }}>No jobs found</p></div>}
                  </div>
                </div>
              )}

              {/* ── LOAD MORE BUTTON ── */}
              {!loading && page < totalPages && (
                <div className="flex justify-center mt-4 mb-8">
                  <button 
                    className="btn px-6 py-2 rounded-full" 
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-b)', border: '1px solid var(--border)' }}
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Jobs'}
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Auto Apply Panel ── */}
            <div className="flex flex-col gap-4">
              <ProGate inline featureName="Auto Apply">
                <AutoApplyPanel />
              </ProGate>

              {/* Manual apply info card */}
              <div className="card p-4">
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-m)' }}>MANUAL APPLY</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-b)' }}>
                  Click <strong>Apply</strong> on any job to open the link and mark it as applied.
                </p>
                <div className="mt-3 flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-m)' }}>
                  <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Real-time Job Postings</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Skill match analysis shown</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Filter by preferences</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: 'var(--primary)' }}>✓</span> Apply directly</div>
                </div>
              </div>

              {/* Preference summary card */}
              {hasPref && (
                <div className="card p-4" style={{ background: 'var(--primary-lt)', border: '1px solid rgba(31,122,108,.15)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--primary)' }}>YOUR FOCUS</p>
                  <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--sec-mid)' }}>
                    <div><span className="font-semibold">Roles: </span>{prefs.roles.slice(0,2).join(', ')}</div>
                    {prefs.workPreference && <div><span className="font-semibold">Work: </span>{prefs.workPreference}</div>}
                    {prefs.experienceLevel && <div><span className="font-semibold">Level: </span>{prefs.experienceLevel}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────────────────────
function JobCard({ job: j, isPrefMatch, autoApply, onMarkApplied, onSave, undoApply, canApplyJobs }) {
  const score     = j.matchScore
  const isApplied = j.status === 'Applied' || j.status === 'Interview'
  const isSaved   = j.status === 'Saved'
  const autoMark  = autoApply && isPrefMatch && score >= 80

  return (
    <div className="card p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform duration-200"
      style={{ border: autoMark ? '1.5px solid var(--primary)' : '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: j.logoColor }}>{j.logo}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-h)' }} title={j.title}>{j.title}</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-m)' }} title={j.company}>{j.company} · {j.location}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0"
          style={{ background: score >= 88 ? 'var(--primary-lt)' : 'var(--accent-lt)', color: score >= 88 ? 'var(--primary)' : 'var(--accent-dk)' }}>
          {score}%
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`badge ${j.workType === 'Remote' ? 'badge-green' : j.workType === 'Hybrid' ? 'badge-orange' : 'badge-slate'}`}>{j.workType}</span>
        <span className="badge badge-slate">{j.experienceLevel}</span>
        {isPrefMatch && <span className="badge badge-green">Role Match ✓</span>}
        <span className={`badge ${STATUS_BADGE[j.status] || 'badge-slate'}`}>{j.status}</span>
        {autoMark && <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>⚡ Auto Queue</span>}
      </div>

      {/* Salary + type */}
      <div className="text-xs flex items-center gap-3 flex-wrap" style={{ color: 'var(--text-b)' }}>
        <span className="font-semibold">{j.salary}</span>
        <span style={{ color: 'var(--border-md)' }}>·</span>
        <span>{j.jobType}</span>
        <span style={{ color: 'var(--border-md)' }}>·</span>
        <span>{j.postedDate}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 h-[50px] overflow-hidden">
        {j.skills.map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
            style={{ background: 'var(--bg-subtle)', color: 'var(--sec-mid)', border: '1px solid var(--border)' }}>{s}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
        <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">View</Link>
        <Link to={`/resume?job=${j.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">Resume</Link>
        <button onClick={onSave} className="btn btn-sm flex-shrink-0"
          style={{ background: isSaved ? 'var(--sage-lt)' : 'var(--bg-subtle)', color: isSaved ? 'var(--sage-dk)' : 'var(--text-b)', border: '1px solid var(--border)' }}>
          {isSaved ? '🔖' : '+ Save'}
        </button>
        {isApplied
          ? <button onClick={() => undoApply(j)} className="btn btn-sm flex-shrink-0 hover:opacity-80 transition-opacity" style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none' }} title="Click to undo">✓ Applied</button>
          : (
            <div className="flex gap-1 flex-shrink-0">
              {canApplyJobs ? (
                <>
                  <a href={j.apply_link} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Apply</a>
                  <button onClick={onMarkApplied} className="btn btn-sm text-xs" style={{ padding: '0 6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }} title="Mark as applied">✓</button>
                </>
              ) : (
                <button disabled className="btn btn-sm text-xs bg-gray-200 text-gray-500 cursor-not-allowed px-3">Review Required</button>
              )}
            </div>
          )
        }
      </div>
    </div>
  )
}

function EmptyState({ onClear }) {
  return (
    <div className="col-span-2 card p-12 text-center flex flex-col items-center gap-3">
      <span className="text-4xl">🔍</span>
      <p className="font-bold" style={{ color: 'var(--text-h)' }}>No jobs available yet</p>
      <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear Filters</button>
    </div>
  )
}
