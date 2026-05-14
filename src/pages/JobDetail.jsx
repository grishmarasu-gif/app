import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ApplyModal from '../components/ApplyModal'
import { useApp } from '../context/AppContext'

export default function JobDetail() {
  const { id } = useParams()
  const { toast, saveJob } = useApp() // We still use context for toast/saveJob logic if desired, though saveJob might need backend update
  const [showApply, setShowApply] = useState(false)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://backend2-production-6818.up.railway.app/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        setJob(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch job details', err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 240 }}>
          <p>Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job || job.message === 'Job not found' || job.message === 'Server Error') {
    return (
      <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4" style={{ marginLeft: 240 }}>
          <p>Job not found</p>
          <Link to="/jobs" className="btn btn-primary btn-sm">Return to Jobs</Link>
        </div>
      </div>
    )
  }

  const enriched = job
  const status = job.status
  const score      = job.matchScore
  const scoreColor = score >= 88 ? 'var(--primary)' : score >= 75 ? 'var(--accent-dk)' : 'var(--sage-dk)'
  const scoreBg    = score >= 88 ? 'var(--primary-lt)' : score >= 75 ? 'var(--accent-lt)' : 'var(--sage-lt)'

  const isApplied = status === 'Applied' || status === 'Interview'
  const isSaved   = status === 'Saved'

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 240 }}>
        <TopBar title="Job Details" subtitle={`${job.title} · ${job.company}`}
          actions={<Link to="/jobs" className="btn btn-ghost btn-sm">← Back to Jobs</Link>} />

        <main className="p-7">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Header card */}
              <div className="card p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: job.logoColor }}>{job.logo}</div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-extrabold text-xl leading-tight" style={{ color: 'var(--text-h)' }}>{job.title}</h1>
                    <p className="font-semibold mt-1" style={{ color: 'var(--text-b)' }}>{job.company}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[job.workType, job.jobType, job.experienceLevel].map(t => (
                        <span key={t} className="badge badge-slate">{t}</span>
                      ))}
                      <span className={`badge ${isApplied ? 'badge-green' : isSaved ? 'badge-sage' : 'badge-blue'}`}>{status}</span>
                    </div>
                  </div>
                  <div className="match-ring" style={{ width: 56, height: 56, background: scoreBg, color: scoreColor, fontSize: '.9rem', fontWeight: 800 }}>{score}%</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {[['Salary', job.salary],['Location', job.location],['Deadline', job.deadline],['Source', job.source]].map(([l,v]) => (
                    <div key={l}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-m)' }}>{l}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-h)' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Job Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)', whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Responsibilities</h2>
                  <ul className="flex flex-col gap-2.5">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-b)' }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tools */}
              {job.tools && job.tools.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Tools & Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tools.map(t => (
                      <span key={t} className="text-sm px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--sec-mid)', border: '1px solid var(--border)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company */}
              <div className="card p-6">
                <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Company Overview</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{job.companyOverview}</p>
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div className="flex flex-col gap-5">

              {/* Apply CTA */}
              <div className="card p-6 flex flex-col gap-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Apply for this Role</h3>

                {isApplied ? (
                  <div className="rounded-xl p-4 text-center" style={{ background: 'var(--primary-lt)' }}>
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Application Submitted!</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--sec-mid)' }}>Status: {status}</p>
                  </div>
                ) : (
                  <>
                    <Link to={`/resume?job=${job.id}`} className="btn btn-ghost btn-md justify-center w-full">
                      Generate Tailored Resume
                    </Link>
                    <a href={job.apply_link} target="_blank" rel="noopener" className="btn btn-primary btn-md justify-center w-full flex items-center gap-2">
                      Apply Externally <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('https://backend2-production-6818.up.railway.app/api/apply-job', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobId: job.id })
                          });
                          if (res.ok) {
                            setJob(prev => ({ ...prev, status: 'Applied' }));
                            toast('Job marked as applied! 🎉');
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="btn btn-ghost btn-md justify-center w-full"
                      style={{ border: '1px solid var(--border)' }}>
                      ✓ Mark as Applied
                    </button>

                    <button
                      onClick={() => saveJob(job.id)}
                      className="btn btn-md justify-center w-full"
                      style={{
                        background: isSaved ? 'var(--sage-lt)' : 'transparent',
                        color: isSaved ? 'var(--sage-dk)' : 'var(--text-b)',
                        border: '1.5px solid var(--border-md)',
                      }}>
                      {isSaved ? '🔖 Saved' : '+ Save Job'}
                    </button>
                  </>
                )}
                <p className="text-xs text-center" style={{ color: 'var(--text-m)' }}>Deadline: {job.deadline}</p>
              </div>

              {/* Match breakdown */}
              <div className="card p-5">
                <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Match Analysis</h3>
                {[['Skills Match',90],['Experience Level',85],['Work Type Fit',100],['Salary Alignment',80]].map(([l,p]) => (
                  <div key={l} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium" style={{ color: 'var(--text-b)' }}>{l}</span>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>{p}%</span>
                    </div>
                    <div className="progress-track" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Required skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Required Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                  
                  {job.preferredSkills && job.preferredSkills.length > 0 && (
                    <>
                      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Preferred Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.preferredSkills.map(s => <span key={s} className="badge badge-sage">{s}</span>)}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Resume keywords */}
              {job.suggestedKeywords && job.suggestedKeywords.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Suggested Resume Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.suggestedKeywords.map(k => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'var(--accent-lt)', color: 'var(--accent-dk)', border: '1px solid rgba(244,162,97,.2)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showApply && <ApplyModal job={enriched} onClose={() => setShowApply(false)} />}
    </div>
  )
}
