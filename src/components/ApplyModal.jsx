import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function ApplyModal({ job, onClose }) {
  const { applyToJob, appHistory } = useApp()
  const { currentUser, storedPrefs } = useAuth()

  const alreadyApplied = appHistory.some(a => a.jobId === job.id)
  const [step, setStep]       = useState(0)
  const [autoMode, setAutoMode] = useState(false)
  const [form, setForm]       = useState({
    name:       currentUser?.name  || '',
    email:      currentUser?.email || '',
    phone:      currentUser?.phone || '',
    location:   storedPrefs?.location || '',
    experience: storedPrefs?.experienceLevel || '',
    role:       storedPrefs?.roles?.[0] || job.title,
    linkedin:   currentUser?.linkedin || '',
  })

  const userSkills  = (storedPrefs?.skills || [])
  const score       = job.prefMatchScore ?? job.matchScore
  const matchedSkills = userSkills.filter(s => job.skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase()))
  const missingSkills = job.skills.filter(s => !userSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase()))

  const coverLetter = `Dear Hiring Team,

I am excited to apply for the ${job.title} position at ${job.company}. With experience in ${storedPrefs?.domains?.slice(0,2).join(' and ') || 'the industry'}, I am confident in my ability to contribute effectively.

My skills in ${userSkills.slice(0,3).join(', ') || job.skills.slice(0,2).join(', ')} align well with your requirements for ${job.skills.slice(0,2).join(' and ')}.

I look forward to the opportunity to discuss how I can add value to your team.

Best regards,
${form.name}`

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function submit() {
    applyToJob(job.id, 'Manual')
    setStep(2)
  }

  if (alreadyApplied && step !== 2) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(4px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="w-full max-w-sm card p-8 flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">✅</span>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-h)' }}>Already Applied</h3>
          <p className="text-sm" style={{ color: 'var(--text-m)' }}>You've already submitted an application for <strong>{job.title}</strong> at <strong>{job.company}</strong>.</p>
          <button className="btn btn-primary btn-md" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && step !== 2 && onClose()}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-xl"
        style={{ background: '#fff', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: job.logoColor }}>{job.logo}</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>{job.title}</h2>
            <p className="text-xs" style={{ color: 'var(--text-m)' }}>{job.company} · {job.workType} · {job.salary}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-m)', border: '1px solid var(--border)' }}>
              {score}% Match
            </span>
            {step !== 2 && (
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg)', color: 'var(--text-m)', border: '1px solid var(--border)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Auto mode banner */}
        <div className="px-6 py-2.5 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-m)' }}>Auto-filled from your profile</span>
          <span className="badge badge-green text-xs">✓ Pre-filled</span>
        </div>

        {/* STEP 0 — Form */}
        {step === 0 && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-m)' }}>Application Details</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {[['Full Name','name'],['Email','email'],['Phone','phone'],['Location','location'],['Target Role','role'],['Experience','experience'],['LinkedIn','linkedin']].map(([lbl, k]) => (
                <div key={k}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-m)' }}>{lbl}</label>
                  <input className="input" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={`Enter ${lbl.toLowerCase()}`} />
                </div>
              ))}
            </div>

            {/* Skills match */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold" style={{ color: 'var(--text-m)' }}>SKILL MATCH ANALYSIS</p>
                <span className="font-bold text-sm" style={{ color: score >= 85 ? 'var(--primary)' : 'var(--accent-dk)' }}>{score}%</span>
              </div>
              <div className="progress-track mb-3" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${score}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--primary)' }}>MATCHED</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.length > 0 ? matchedSkills.map(s => <span key={s} className="badge badge-green">{s} ✓</span>) : <span className="text-xs" style={{ color: 'var(--text-m)' }}>—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--accent-dk)' }}>MISSING / ADD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.length > 0 ? missingSkills.map(s => <span key={s} className="badge badge-orange">{s}</span>) : <span className="text-xs" style={{ color: 'var(--text-m)' }}>All covered ✓</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-primary btn-md flex-1 justify-center" onClick={() => setStep(1)}>Preview Application →</button>
              <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {/* STEP 1 — Preview */}
        {step === 1 && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-m)' }}>Review Before Submitting</p>

            <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              {[['Name',form.name],['Email',form.email],['Phone',form.phone],['Location',form.location],['Experience',form.experience],['Role',form.role]].map(([k,v]) => (
                <div key={k} className="flex gap-2 mb-1.5 last:mb-0">
                  <span className="font-semibold w-24 flex-shrink-0" style={{ color: 'var(--text-m)' }}>{k}</span>
                  <span style={{ color: 'var(--text-b)' }}>{v || '—'}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-m)' }}>GENERATED COVER LETTER</p>
              <div className="rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line"
                style={{ background: 'var(--primary-lt)', color: 'var(--sec-mid)', border: '1px solid rgba(31,122,108,.15)' }}>
                {coverLetter}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)' }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-m)' }}>Applying to:</p>
              <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{job.title} at {job.company}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{job.location} · {job.workType} · {job.salary}</p>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-primary btn-md flex-1 justify-center" onClick={submit}>Submit Application 🚀</button>
              <button className="btn btn-ghost btn-md" onClick={() => setStep(0)}>← Edit</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Success */}
        {step === 2 && (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: 'var(--primary-lt)' }}>🎉</div>
            <h3 className="font-extrabold text-xl" style={{ color: 'var(--text-h)' }}>Application Submitted!</h3>
            <p style={{ color: 'var(--text-b)' }}>
              <strong>{job.title}</strong> at <strong>{job.company}</strong> — marked as Applied.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="badge badge-green">Applied ✓</span>
              <span className="badge badge-slate">{score}% Match</span>
              <span className="badge badge-orange">👤 Manual</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-m)' }}>Track this in your Applications dashboard.</p>
            <button className="btn btn-primary btn-md" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
