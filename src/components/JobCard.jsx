import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ApplyModal from './ApplyModal'

function MatchRing({ score }) {
  const cls = score >= 88 ? 'match-high' : score >= 75 ? 'match-medium' : 'match-low'
  return <div className={`match-ring ${cls}`}>{score}%</div>
}

const workTypeBadge = { Remote: 'badge-green', Hybrid: 'badge-orange', 'On-site': 'badge-slate' }
const statusBadge   = { New: 'badge-blue', Saved: 'badge-sage', Applied: 'badge-orange', Interview: 'badge-green', Rejected: 'badge-red' }

export default function JobCard({ job }) {
  const { saveJob, jobStatuses } = useApp()
  const [showApply, setShowApply] = useState(false)
  const status = jobStatuses[job.id] ?? job.status

  return (
    <>
      <div className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: job.logoColor }}>{job.logo}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-snug truncate" style={{ color: 'var(--text-h)' }}>{job.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{job.company} · {job.location}</p>
          </div>
          <MatchRing score={job.matchScore} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${workTypeBadge[job.workType] || 'badge-slate'}`}>{job.workType}</span>
          <span className="badge badge-slate">{job.jobType}</span>
          <span className="badge badge-sage">{job.experienceLevel}</span>
          <span className={`badge ${statusBadge[status] || 'badge-slate'}`}>{status}</span>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs" style={{ color: 'var(--text-b)' }}>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-medium truncate">{job.salary}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="truncate">Due {job.deadline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="truncate">{job.sponsorship}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <span className="truncate">{job.source}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map(s => (
            <span key={s} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--bg-subtle)', color: 'var(--sec-mid)', border: '1px solid var(--border)' }}>{s}</span>
          ))}
          {job.skills.length > 4 && <span className="text-xs px-2.5 py-0.5 font-medium" style={{ color: 'var(--text-m)' }}>+{job.skills.length - 4}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">View</Link>
          <Link to={`/resume?job=${job.id}`} className="btn btn-ghost btn-sm flex-1 justify-center">Resume</Link>

          {/* Save toggle */}
          <button
            onClick={() => saveJob(job.id)}
            className="btn btn-sm flex-1 justify-center"
            style={{
              background: status === 'Saved' ? 'var(--sage-lt)' : 'transparent',
              color: status === 'Saved' ? 'var(--sage-dk)' : 'var(--text-b)',
              border: '1.5px solid var(--border-md)',
            }}
          >
            {status === 'Saved' ? '🔖 Saved' : '+ Save'}
          </button>

          {/* Apply */}
          {status === 'Applied' || status === 'Interview' ? (
            <span className="btn btn-sm flex-1 justify-center" style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none' }}>✓ Applied</span>
          ) : (
            <button onClick={() => setShowApply(true)} className="btn btn-primary btn-sm flex-1 justify-center">Apply</button>
          )}
        </div>
      </div>

      {showApply && <ApplyModal job={{ ...job, status }} onClose={() => setShowApply(false)} />}
    </>
  )
}
