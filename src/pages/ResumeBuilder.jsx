import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Profile', 'Select Job', 'Generating', 'Preview']

export default function ResumeBuilder() {
  const { jobs, applyToJob, toast } = useApp()
  const { currentUser, storedPrefs } = useAuth()
  const [searchParams] = useSearchParams()
  const preselectedId = Number(searchParams.get('job'))

  const user = currentUser || {}
  const preferences = storedPrefs || { roles: [], domains: [], skills: [], location: '', experienceLevel: '', salaryExpectation: '' }

  const [step, setStep]       = useState(preselectedId ? 1 : 0)
  const [selJob, setSelJob]   = useState(jobs.find(j => j.id === preselectedId) || null)
  const [coverLetter, setCoverLetter] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [form, setForm]       = useState({
    name:        user.name || '',
    email:       user.email || '',
    phone:       user.phone || '',
    location:    preferences.location || '',
    title:       preferences.roles?.[0] || '',
    experience:  preferences.experienceLevel || '',
    targetSalary:preferences.salaryExpectation || '',
    summary:     user.summary || `Experienced ${preferences.roles?.[0] || 'professional'} with expertise in ${(preferences.skills || []).slice(0,3).join(', ')}.`,
    skills:      [...new Set([...(preferences.skills || [])])].join(', '),
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  // Sort jobs: preference-matching first
  const sortedJobs = [...jobs].sort((a, b) => (b.prefMatchScore ?? b.matchScore) - (a.prefMatchScore ?? a.matchScore))
  const skillsArr  = form.skills.split(',').map(s => s.trim()).filter(Boolean)

  function generate(job) {
    setSelJob(job)
    setStep(2)
    setTimeout(() => setStep(3), 2000)
  }

  function handleDownload() { toast('Downloading resume PDF… ✓') }
  function handleCopy() {
    const text = `${form.name}\n${form.email} · ${form.location}\n\n${form.summary}\n\nSkills: ${form.skills}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); toast('Resume copied ✓')
      setTimeout(() => setCopied(false), 2500)
    })
  }
  function handleImprove() { setStep(2); setTimeout(() => setStep(3), 2000); toast('Improving…') }
  function handleApply()   { if (selJob) applyToJob(selJob.id) }

  const job = selJob || jobs[0]

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 240 }}>
        <TopBar title="Resume Builder" subtitle={
          preferences.roles.length > 0
            ? `Tailoring resumes for: ${preferences.roles.slice(0, 2).join(', ')}`
            : 'Generate a tailored resume for any role'
        } />
        <main className="p-7 flex flex-col gap-6">

          {/* Preference hint */}
          {preferences.domains.length > 0 && (
            <div className="rounded-xl px-5 py-3 flex items-center gap-3"
              style={{ background: 'var(--primary-lt)', border: '1px solid rgba(31,122,108,.2)' }}>
              <span>🎯</span>
              <p className="text-sm" style={{ color: 'var(--primary)' }}>
                <strong>Preference Active:</strong> Jobs are sorted by your interest in{' '}
                <strong>{preferences.domains.slice(0, 2).join(' & ')}</strong> —{' '}
                targeting <strong>{preferences.roles.slice(0, 2).join(', ')}</strong>
              </p>
            </div>
          )}

          {/* Stepper */}
          <div className="card p-4 flex items-center gap-2 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: i <= step ? 'var(--primary)' : 'var(--bg-subtle)', color: i <= step ? '#fff' : 'var(--text-m)', border: i > step ? '1.5px solid var(--border-md)' : 'none' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block"
                    style={{ color: i === step ? 'var(--primary)' : i < step ? 'var(--text-b)' : 'var(--text-m)' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className="h-px w-6" style={{ background: i < step ? 'var(--primary)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          {/* STEP 0 — Profile */}
          {step === 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Your Profile</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[['Full Name','name'],['Email','email'],['Phone','phone'],['Location','location'],['Target Role','title'],['Experience','experience'],['Target Salary','targetSalary']].map(([lbl, k]) => (
                    <div key={k}>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>{lbl}</label>
                      <input className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Summary</label>
                  <textarea className="input" rows={3} value={form.summary} onChange={e => set('summary', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Skills (comma-separated)</label>
                  <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillsArr.slice(0, 10).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                </div>
                <button className="btn btn-primary btn-md mt-1" onClick={() => setStep(1)}>Continue → Select Job</button>
              </div>

              <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--bg-subtle)' }}>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Profile Preview</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: 'var(--primary)' }}>
                    {form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-h)' }}>{form.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-m)' }}>{form.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-m)' }}>{form.email}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{form.summary}</p>
                {preferences.roles.length > 0 && (
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-m)' }}>TARGETING ROLES</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferences.roles.map(r => <span key={r} className="badge badge-green">{r}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1 — Select Job */}
          {step === 1 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Select a Target Job</h2>
                  {preferences.roles.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>Sorted by your role preferences</p>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← Back</button>
              </div>
              <div className="flex flex-col gap-3">
                {sortedJobs.map(j => {
                  const score = j.prefMatchScore ?? j.matchScore
                  const isPrefMatch = preferences.roles.some(r => j.title.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
                  return (
                    <div key={j.id} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                      style={{ background: isPrefMatch ? 'var(--primary-lt)' : 'var(--bg-subtle)', border: `1.5px solid ${isPrefMatch ? 'rgba(31,122,108,.3)' : 'var(--border)'}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: j.logoColor }}>{j.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>{j.title}</p>
                          {isPrefMatch && <span className="badge badge-green text-xs">Role Match</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-m)' }}>{j.company} · {j.workType} · {j.salary}</p>
                      </div>
                      <div className="match-ring match-high" style={{ width: 40, height: 40, fontSize: '.7rem' }}>{score}%</div>
                      <button className="btn btn-primary btn-sm" onClick={() => generate(j)}>Generate →</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Generating */}
          {step === 2 && (
            <div className="card p-16 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-lt)' }}>
                <svg className="w-8 h-8 spinner" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-h)' }}>Generating Tailored Resume</h2>
              <p style={{ color: 'var(--text-m)' }}>Matching {form.name}'s profile with {job.title} at {job.company}…</p>
              <div className="w-full max-w-xs progress-track" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: '80%', transition: 'width 2s ease' }} />
              </div>
              {['✓ Analyzing job requirements', '✓ Matching skills & preferences', '⟳ Writing resume sections…'].map((t, i) => (
                <p key={i} className="text-sm" style={{ color: 'var(--text-b)' }}>{t}</p>
              ))}
            </div>
          )}

          {/* STEP 3 — Preview */}
          {step === 3 && (
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 card p-8" style={{ minHeight: 500 }}>
                <div className="pb-5 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)', fontFamily: 'Georgia,serif' }}>{form.name}</h1>
                  <p className="text-base mt-1 font-semibold" style={{ color: 'var(--primary)' }}>{job.title}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-m)' }}>{form.email} · {form.phone} · {form.location}</p>
                </div>
                {[
                  { title: 'Summary', body: <p className="text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{form.summary} Specializing in {job.skills.slice(0, 3).join(', ')}.</p> },
                  { title: 'Core Skills', body: <p className="text-sm" style={{ color: 'var(--text-b)' }}>{[...new Set([...skillsArr, ...job.skills])].join(' · ')}</p> },
                  { title: 'Experience', body: (
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Senior {form.title} · TechCorp Inc. (2023 – Present)</p>
                      {job.responsibilities.slice(0, 3).map((r, i) => <p key={i} className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-b)' }}>• {r}</p>)}
                    </div>
                  )},
                  { title: 'Matched Keywords', body: (
                    <div className="flex flex-wrap gap-2">
                      {job.suggestedKeywords.map(k => <span key={k} className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>{k}</span>)}
                    </div>
                  )},
                ].map(sec => (
                  <div key={sec.title} className="mb-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>{sec.title}</h2>
                    {sec.body}
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="card p-5 flex flex-col gap-3">
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Actions</h3>
                  <button onClick={handleDownload} className="btn btn-primary btn-md w-full justify-center">⬇ Download PDF</button>
                  <button onClick={handleCopy} className="btn btn-ghost btn-md w-full justify-center">{copied ? '✓ Copied!' : 'Copy Resume'}</button>
                  <button onClick={handleImprove} className="btn btn-ghost btn-md w-full justify-center">Improve ↻</button>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-b)' }}>
                    <input type="checkbox" checked={coverLetter} onChange={e => setCoverLetter(e.target.checked)} />
                    Generate cover letter too
                  </label>
                </div>
                <div className="card p-5">
                  <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Skill Match</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="match-ring match-high" style={{ width: 52, height: 52, fontSize: '.9rem', fontWeight: 800 }}>{job.prefMatchScore ?? job.matchScore}%</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Strong match</p>
                      <p className="text-xs" style={{ color: 'var(--text-m)' }}>Based on your preferences</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-m)' }}>MISSING / PREFERRED</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map(s => <span key={s} className="badge badge-orange">{s}</span>)}
                  </div>
                </div>
                <div className="card p-5 flex flex-col gap-3" style={{ background: 'var(--primary-lt)', borderColor: 'rgba(31,122,108,.2)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Ready to apply?</p>
                  <p className="text-xs" style={{ color: 'var(--sec-mid)' }}>{job.title} at {job.company}</p>
                  <button onClick={handleApply} className="btn btn-primary btn-md justify-center">Submit Application 🚀</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
