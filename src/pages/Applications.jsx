import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ApplyModal from '../components/ApplyModal'
import { useApp } from '../context/AppContext'

const COLS = [
  { key: 'Applied',   label: 'Applied',   color: 'var(--primary)', bg: 'var(--primary-lt)' },
  { key: 'Interview', label: 'Interview', color: '#7c3aed',         bg: '#f5f3ff' },
  { key: 'Offer',     label: 'Offer',     color: '#16a34a',         bg: '#f0fdf4' },
  { key: 'Rejected',  label: 'Rejected',  color: '#dc2626',         bg: '#fef2f2' },
]

const appliedByBadge = {
  Manual:     { bg: 'var(--accent-lt)',  color: 'var(--accent-dk)', label: '👤 Manual' },
  Auto:       { bg: 'var(--primary-lt)', color: 'var(--primary)',   label: '⚡ Auto Apply' },
  undefined:  { bg: 'var(--bg-subtle)',  color: 'var(--text-m)',    label: '—' },
}

export default function Applications() {
  const { appHistory, markInterview, markRejected, sendFollowUp, followUps, saveJob, toast } = useApp()
  const [tab, setTab]           = useState('history')
  const [applyJob, setApplyJob] = useState(null)
  const [myJobs, setMyJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://backend2-production-6818.up.railway.app/api/my-jobs')
      .then(res => res.json())
      .then(data => {
        setMyJobs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch applications', err)
        setLoading(false)
      })
  }, [])

  const updateStatus = async (jobId, newStatus) => {
    try {
      const res = await fetch(`https://backend2-production-6818.up.railway.app/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setMyJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
        toast(`Moved to ${newStatus}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (jobId) => {
    try {
      const res = await fetch('https://backend2-production-6818.up.railway.app/api/save-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        setMyJobs(prev => prev.filter(j => j.id !== jobId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const applied   = myJobs.filter(j => j.status === 'Applied')
  const interview = myJobs.filter(j => j.status === 'Interview')
  const saved     = myJobs.filter(j => j.status === 'Saved')
  const rejected  = myJobs.filter(j => j.status === 'Rejected')

  const autoCount   = 0 // To be implemented later with real tracking
  const manualCount = applied.length + interview.length + rejected.length

  const tabs = [
    { key: 'history',   label: `All Applications (${appHistory.length})` },
    { key: 'kanban',    label: 'Kanban Board' },
    { key: 'saved',     label: `Saved (${saved.length})` },
    { key: 'followups', label: `Follow-ups (${applied.length})` },
  ]

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 240 }}>
        <TopBar title="Applications" subtitle="Track every application — manual and auto" />
        <main className="p-7 flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Applied',  count: applied.length + interview.length + rejected.length,  color: 'var(--primary)', bg: 'var(--primary-lt)' },
              { label: '⚡ Auto Apply',  count: autoCount,           color: 'var(--primary)', bg: 'var(--primary-lt)' },
              { label: '👤 Manual',      count: manualCount,         color: 'var(--accent-dk)', bg: 'var(--accent-lt)' },
              { label: 'Interview',      count: interview.length,    color: '#7c3aed', bg: '#f5f3ff' },
            ].map(c => (
              <div key={c.label} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: c.bg, color: c.color }}>{c.count}</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{c.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-m)' }}>{c.count} job{c.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className="btn btn-sm whitespace-nowrap"
                style={{ background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? 'var(--primary)' : 'var(--text-m)', boxShadow: tab === t.key ? 'var(--sh-sm)' : 'none', border: 'none' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── HISTORY (All Applications) ── */}
          {tab === 'history' && (
            loading ? (
              <div className="card p-12 text-center flex flex-col items-center justify-center">
                <p>Loading applications...</p>
              </div>
            ) : myJobs.filter(j => j.status !== 'Saved').length === 0 ? (
              <div className="card p-12 text-center flex flex-col items-center gap-3">
                <span className="text-4xl">📋</span>
                <p className="font-bold" style={{ color: 'var(--text-h)' }}>No applications yet</p>
                <p className="text-sm" style={{ color: 'var(--text-m)' }}>Apply to jobs manually or start an Auto Apply session.</p>
                <div className="flex gap-3 mt-2">
                  <Link to="/jobs" className="btn btn-primary btn-md">Browse Jobs</Link>
                </div>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                        {['Job Title', 'Company', 'Date Applied', 'Status', 'Match Score', 'Resume Used', 'Applied By'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-m)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myJobs.filter(j => j.status !== 'Saved').map((job, i) => {
                        const badge = appliedByBadge['Manual']; // Default to manual for now until backend tracks it
                        return (
                          <tr key={job.id} className="border-b" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.012)' }}>
                            <td className="px-4 py-3">
                              <Link to={`/jobs/${job.id}`} className="font-semibold hover:underline" style={{ color: 'var(--text-h)', textDecoration: 'none' }}>{job.title}</Link>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: job.logoColor }}>{job.logo}</div>
                                <span style={{ color: 'var(--text-b)' }}>{job.company}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-m)' }}>{job.postedDate}</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${job.status === 'Applied' ? 'badge-orange' : job.status === 'Interview' ? 'badge-green' : job.status === 'Rejected' ? 'badge-red' : 'badge-slate'}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-xs" style={{ color: (job.matchScore ?? 0) >= 85 ? 'var(--primary)' : 'var(--accent-dk)' }}>
                                {job.matchScore ?? '—'}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-m)', maxWidth: 160 }}>
                              <span className="truncate block">{job.title} – Tailored</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── KANBAN ── */}
          {tab === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto pb-3">
              {COLS.map(col => {
                const colJobs = myJobs.filter(j => j.status === col.key)
                return (
                  <div key={col.key} className="kanban-col" style={{ minWidth: 268, flex: '0 0 268px' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-sm" style={{ color: col.color }}>{col.label}</span>
                      <span className="badge" style={{ background: col.bg, color: col.color }}>{colJobs.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {colJobs.map(j => {
                        const badge = appliedByBadge['Manual']
                        return (
                          <div key={j.id} className="card p-4 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: j.logoColor }}>{j.logo}</div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs truncate" style={{ color: 'var(--text-h)' }}>{j.title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-m)' }}>{j.company}</p>
                              </div>
                            </div>

                            {/* Applied By badge */}
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                                style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>

                            <div className="flex gap-1.5 flex-wrap">
                              <span className="badge badge-slate">{j.workType}</span>
                              <span className="font-bold text-xs" style={{ color: col.color }}>{j.prefMatchScore ?? j.matchScore}%</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap text-xs" style={{ color: 'var(--text-m)' }}>
                              <span>Applied {j.postedDate}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm flex-1 justify-center text-xs">Details</Link>
                              {col.key === 'Applied' && (
                                <button onClick={() => updateStatus(j.id, 'Interview')} className="btn btn-sm flex-1 text-xs justify-center"
                                  style={{ background: '#f5f3ff', color: '#7c3aed', border: 'none' }}>→ Interview</button>
                              )}
                              {col.key === 'Interview' && (
                                <button onClick={() => updateStatus(j.id, 'Offer')} className="btn btn-sm flex-1 text-xs justify-center"
                                  style={{ background: '#f0fdf4', color: '#16a34a', border: 'none' }}>→ Offer</button>
                              )}
                              {(col.key === 'Applied' || col.key === 'Interview') && (
                                <button onClick={() => updateStatus(j.id, 'Rejected')} className="btn btn-sm px-2 text-xs"
                                  style={{ background: '#fef2f2', color: '#dc2626', border: 'none' }}>✕</button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {colJobs.length === 0 && (
                        <div className="text-xs text-center py-6 rounded-xl" style={{ color: 'var(--text-f)', border: '1.5px dashed var(--border-md)' }}>
                          No entries yet
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── SAVED ── */}
          {tab === 'saved' && (
            saved.length === 0 ? (
              <div className="card p-12 text-center flex flex-col items-center gap-3">
                <span className="text-4xl">🔖</span>
                <p className="font-bold" style={{ color: 'var(--text-h)' }}>No saved jobs yet</p>
                <Link to="/jobs" className="btn btn-primary btn-md mt-2">Browse Jobs</Link>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                        {['Job', 'Company', 'Salary', 'Match', 'Deadline', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-m)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {saved.map((j, i) => (
                        <tr key={j.id} className="border-b" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.012)' }}>
                          <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-h)' }}>{j.title}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: j.logoColor }}>{j.logo}</div>
                              <span style={{ color: 'var(--text-b)' }}>{j.company}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium">{j.salary}</td>
                          <td className="px-5 py-3"><span className="font-bold text-xs" style={{ color: 'var(--primary)' }}>{j.prefMatchScore ?? j.matchScore}%</span></td>
                          <td className="px-5 py-3" style={{ color: 'var(--text-m)' }}>{j.deadline}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm">View</Link>
                              <a href={j.apply_link} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Apply</a>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleSave(j.id)}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── FOLLOW-UPS ── */}
          {tab === 'followups' && (
            applied.length === 0 ? (
              <div className="card p-12 text-center flex flex-col items-center gap-3">
                <span className="text-4xl">📧</span>
                <p className="font-bold" style={{ color: 'var(--text-h)' }}>No follow-ups needed yet</p>
                <Link to="/jobs" className="btn btn-primary btn-md mt-2">Browse Jobs</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {applied.map(j => {
                  const badge = appliedByBadge['Manual']
                  return (
                    <div key={j.id} className="card p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: j.logoColor }}>{j.logo}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{j.title} · {j.company}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs" style={{ color: 'var(--text-m)' }}>Applied {j.postedDate}</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                        </div>
                      </div>
                      {followUps[j.id]
                        ? <span className="badge badge-green flex-shrink-0">Follow-up Sent ✓</span>
                        : (
                          <>
                            <span className="badge badge-orange flex-shrink-0">Follow Up Due</span>
                            <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => sendFollowUp(j.id)}>Send 📧</button>
                          </>
                        )
                      }
                      <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm flex-shrink-0">Details</Link>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </main>
      </div>
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </div>
  )
}
