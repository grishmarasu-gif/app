import { useState, useRef } from 'react'
import { DOMAINS, DOMAIN_ROLES } from '../data/jobs'
import { useAuth } from '../context/AuthContext'

const WORK_PREFS  = ['Remote', 'Hybrid', 'On-site', 'Flexible']
const EXP_LEVELS  = ['Entry-Level (0–2 yrs)', 'Mid-Level (2–5 yrs)', 'Senior (5+ yrs)', 'Lead / Manager']
const SPONSOR_OPT = ['Yes', 'No', 'Not sure']
const STEPS = [
  { label: 'Domain', emoji: '🏢' },
  { label: 'Role',   emoji: '👔' },
  { label: 'Resume', emoji: '📄' },
  { label: 'Prefs',  emoji: '⚙️' },
]

export default function OnboardingModal({ onClose, onComplete, inline = false }) {
  const { savePreferences, uploadResume, storedPrefs } = useAuth()
  const [step, setStep]         = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({
    domains: storedPrefs?.domains || [], 
    roles: storedPrefs?.roles || [], 
    location: storedPrefs?.location || '', 
    workPreference: storedPrefs?.workPreference || 'Remote',
    experienceLevel: storedPrefs?.experienceLevel || 'Mid-Level (2–5 yrs)', 
    salaryExpectation: storedPrefs?.salaryExpectation || '',
    sponsorshipRequired: storedPrefs?.sponsorshipRequired || 'No', 
    skills: storedPrefs?.skills?.join(', ') || '',
  })

  // Resume step state
  const [resumeFile, setResumeFile]       = useState(null)
  const [resumeError, setResumeError]     = useState('')
  const [uploadState, setUploadState]     = useState('idle') // idle | uploading | done | error
  const [parsedData, setParsedData]       = useState(null)
  const [isDragging, setIsDragging]       = useState(false)
  const fileInputRef = useRef(null)

  function toggleDomain(d) {
    setForm(f => {
      const domains = f.domains.includes(d) ? f.domains.filter(x => x !== d) : [...f.domains, d]
      const validRoles = [...new Set(domains.flatMap(dom => DOMAIN_ROLES[dom] || []))]
      return { ...f, domains, roles: f.roles.filter(r => validRoles.includes(r)) }
    })
  }
  function toggleRole(r) {
    setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }))
  }
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleFile(file) {
    setResumeError('')
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setResumeError('Only PDF, DOC or DOCX files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File too large. Maximum size is 5 MB.')
      return
    }
    setResumeFile(file)
    setUploadState('idle')
    setParsedData(null)
  }

  async function handleUpload() {
    if (!resumeFile) return
    setUploadState('uploading')
    setResumeError('')
    const res = await uploadResume(resumeFile)
    if (!res.ok) {
      setUploadState('error')
      setResumeError('Unable to parse resume. Please try another file.')
      return
    }
    setUploadState('done')
    const p = res.parsed || {}
    setParsedData(p)
    // Auto-fill prefs from parsed data
    setForm(f => ({
      ...f,
      skills: p.skills?.join(', ') || f.skills,
      experienceLevel: p.experienceLevel || f.experienceLevel,
      roles: p.preferredRoles?.length > 0
        ? [...new Set([...f.roles, ...p.preferredRoles.filter(r => {
            const allRoles = f.domains.flatMap(d => DOMAIN_ROLES[d] || [])
            return allRoles.includes(r)
          })])]
        : f.roles,
    }))
  }

  async function finish() {
    setIsLoading(true)
    setError('')
    const prefs = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
    try {
      if (onComplete) {
        await onComplete(prefs)
      } else {
        const res = await savePreferences(prefs)
        if (res && !res.ok) setError(res.error)
        else if (onClose) onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inner = (
    <div className="w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl"
      style={{ background: '#fff', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="px-7 py-6 border-b sticky top-0 z-10"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-extrabold text-lg" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>
        <h2 className="font-extrabold text-xl" style={{ color: 'var(--text-h)' }}>Set Your Career Preferences</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-m)' }}>
          Help us personalize your job feed, resume generation, and smart applications.
        </p>
        {/* Stepper */}
        <div className="flex items-center gap-3 mt-5">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: i <= step ? 'var(--primary)' : '#fff', color: i <= step ? '#fff' : 'var(--text-m)', border: i > step ? '1.5px solid var(--border-md)' : 'none' }}>
                {i < step ? '✓' : s.emoji}
              </div>
              <span className="text-xs font-bold hidden sm:block"
                style={{ color: i === step ? 'var(--primary)' : i < step ? 'var(--text-b)' : 'var(--text-m)' }}>{s.label}</span>
              {i < STEPS.length - 1 && <div className="h-px w-8" style={{ background: i < step ? 'var(--primary)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 0 — Domain */}
      {step === 0 && (
        <div className="p-7 flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-h)' }}>Select Your Industry Domain</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-m)' }}>Choose the industries you want to work in.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DOMAINS.map(d => {
                const sel = form.domains.includes(d)
                return (
                  <button key={d} onClick={() => toggleDomain(d)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all"
                    style={{ background: sel ? 'var(--primary-lt)' : 'var(--bg-subtle)', border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, color: sel ? 'var(--primary)' : 'var(--text-b)' }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? 'var(--primary)' : 'transparent', border: sel ? 'none' : '1.5px solid var(--border-md)' }}>
                      {sel && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {d}
                  </button>
                )
              })}
            </div>
            {form.domains.length > 0 && (
              <div className="mt-4 p-3 rounded-xl flex flex-wrap gap-1.5" style={{ background: 'var(--primary-lt)' }}>
                {form.domains.map(d => <span key={d} className="badge badge-green">{d}</span>)}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setStep(1)} disabled={form.domains.length === 0}
              className="btn btn-primary btn-lg"
              style={{ opacity: form.domains.length === 0 ? 0.4 : 1, cursor: form.domains.length === 0 ? 'not-allowed' : 'pointer' }}>
              Next: Select Role →
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 — Role */}
      {step === 1 && (
        <div className="p-7 flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-h)' }}>Select Your Target Roles</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-m)' }}>Choose the job roles you are targeting.</p>
            {form.domains.map(domain => (
              <div key={domain} className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wide mb-2.5 inline-block px-3 py-1 rounded-full"
                  style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>{domain}</p>
                <div className="flex flex-wrap gap-2">
                  {(DOMAIN_ROLES[domain] || []).map(r => {
                    const sel = form.roles.includes(r)
                    return (
                      <button key={r} onClick={() => toggleRole(r)}
                        className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        style={{ background: sel ? 'var(--primary)' : 'var(--bg-subtle)', color: sel ? '#fff' : 'var(--text-b)', border: sel ? 'none' : '1.5px solid var(--border)' }}>
                        {sel ? '✓ ' : ''}{r}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {form.roles.length > 0 && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--primary-lt)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--primary)' }}>SELECTED ({form.roles.length})</p>
                <div className="flex flex-wrap gap-1.5">{form.roles.map(r => <span key={r} className="badge badge-green">{r}</span>)}</div>
              </div>
            )}
          </div>
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button className="btn btn-ghost btn-md" onClick={() => setStep(0)}>← Back</button>
            <button onClick={() => setStep(2)} disabled={form.roles.length === 0}
              className="btn btn-primary btn-lg"
              style={{ opacity: form.roles.length === 0 ? 0.4 : 1, cursor: form.roles.length === 0 ? 'not-allowed' : 'pointer' }}>
              Next: Upload Resume →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Resume Upload */}
      {step === 2 && (
        <div className="p-7 flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-h)' }}>Upload Your Resume</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-m)' }}>
              We'll auto-fill your preferences and suggest best-fit roles from your resume.
            </p>

            {/* Drop Zone */}
            {!resumeFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-md)'}`,
                  background: isDragging ? 'var(--primary-lt)' : 'var(--bg-subtle)',
                  padding: '3rem 2rem',
                  minHeight: '180px',
                }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--primary-lt)' }}>
                  <svg className="w-7 h-7" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>
                    {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>or click to browse — PDF, DOC, DOCX · Max 5 MB</p>
                </div>
                <button className="btn btn-primary btn-md" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  Browse File
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ border: '1.5px solid var(--border)', background: 'var(--bg-subtle)' }}>
                {/* File card */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--primary-lt)' }}>
                    <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-h)' }}>{resumeFile.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-m)' }}>{(resumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {uploadState !== 'uploading' && (
                    <button onClick={() => { setResumeFile(null); setUploadState('idle'); setParsedData(null) }}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                      style={{ color: '#dc2626' }}>✕</button>
                  )}
                </div>

                {/* Upload button / status */}
                {uploadState === 'idle' && (
                  <button onClick={handleUpload} className="btn btn-primary btn-md w-full">
                    🔍 Parse My Resume
                  </button>
                )}
                {uploadState === 'uploading' && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Parsing resume…</span>
                  </div>
                )}
                {uploadState === 'done' && parsedData && (
                  <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#16a34a' }}>✅ Resume Parsed — Preferences Auto-Filled</p>
                    {parsedData.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedData.skills.slice(0, 10).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {parsedData.preferredRoles?.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>
                        Suggested roles: <strong>{parsedData.preferredRoles.slice(0, 3).join(', ')}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {resumeError && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold mt-2"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {resumeError}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button className="btn btn-ghost btn-md" onClick={() => setStep(1)}>← Back</button>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-md" onClick={() => setStep(3)}
                style={{ color: 'var(--text-m)' }}>
                Skip for now
              </button>
              <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}
                disabled={uploadState === 'uploading'}>
                {uploadState === 'done' ? '✅ Next: Preferences →' : 'Next: Preferences →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — Preferences */}
      {step === 3 && (
        <div className="p-7 flex flex-col gap-5">
          <h3 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>
            Additional Preferences
            {uploadState === 'done' && <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>✅ Auto-filled from resume</span>}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Preferred Location</label>
              <input className="input" placeholder="e.g. San Francisco, CA or Any" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Salary Expectation</label>
              <input className="input" placeholder="e.g. $90K – $120K" value={form.salaryExpectation} onChange={e => set('salaryExpectation', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-m)' }}>Work Type</label>
            <div className="flex gap-2 flex-wrap">
              {WORK_PREFS.map(w => (
                <button key={w} onClick={() => set('workPreference', w)} className="btn btn-sm"
                  style={{ background: form.workPreference === w ? 'var(--primary)' : 'var(--bg-subtle)', color: form.workPreference === w ? '#fff' : 'var(--text-b)', border: form.workPreference === w ? 'none' : '1px solid var(--border)' }}>{w}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {EXP_LEVELS.map(l => (
                <button key={l} onClick={() => set('experienceLevel', l)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all"
                  style={{ background: form.experienceLevel === l ? 'var(--primary-lt)' : 'var(--bg-subtle)', border: `1.5px solid ${form.experienceLevel === l ? 'var(--primary)' : 'var(--border)'}`, color: form.experienceLevel === l ? 'var(--primary)' : 'var(--text-b)' }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-m)' }}>Sponsorship Required?</label>
            <div className="flex gap-3">
              {SPONSOR_OPT.map(o => (
                <button key={o} onClick={() => set('sponsorshipRequired', o)} className="btn btn-sm"
                  style={{ background: form.sponsorshipRequired === o ? 'var(--primary)' : 'var(--bg-subtle)', color: form.sponsorshipRequired === o ? '#fff' : 'var(--text-b)', border: form.sponsorshipRequired === o ? 'none' : '1px solid var(--border)' }}>{o}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Key Skills (comma-separated)</label>
            <input className="input" placeholder="e.g. Python, SQL, React, Tableau" value={form.skills} onChange={e => set('skills', e.target.value)} />
            {form.skills && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => <span key={s} className="badge badge-green">{s}</span>)}
              </div>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-m)' }}>Your Profile Summary</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Domains: </span><span style={{ color: 'var(--text-b)' }}>{form.domains.join(', ')}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Roles: </span><span style={{ color: 'var(--text-b)' }}>{form.roles.join(', ')}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Work: </span><span style={{ color: 'var(--text-b)' }}>{form.workPreference}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Experience: </span><span style={{ color: 'var(--text-b)' }}>{form.experienceLevel}</span></div>
            </div>
          </div>
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold mt-2"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
            <button className="btn btn-ghost btn-md" onClick={() => setStep(2)} disabled={isLoading}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={finish} disabled={isLoading}>
              {isLoading ? 'Saving…' : '💾 Save & Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (inline) return inner
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
      {inner}
    </div>
  )
}
