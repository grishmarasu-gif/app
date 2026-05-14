import { useState } from 'react'
import { DOMAINS, DOMAIN_ROLES } from '../data/jobs'
import { useAuth } from '../context/AuthContext'

const WORK_PREFS  = ['Remote', 'Hybrid', 'On-site', 'Flexible']
const EXP_LEVELS  = ['Entry-Level (0–2 yrs)', 'Mid-Level (2–5 yrs)', 'Senior (5+ yrs)', 'Lead / Manager']
const SPONSOR_OPT = ['Yes', 'No', 'Not sure']

export default function OnboardingModal({ onClose, onComplete, inline = false }) {
  const { savePreferences } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    domains: [], roles: [], location: '', workPreference: 'Remote',
    experienceLevel: 'Mid-Level (2–5 yrs)', salaryExpectation: '',
    sponsorshipRequired: 'No', skills: '',
  })

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

  function finish() {
    const prefs = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
    if (onComplete) {
      onComplete(prefs)
    } else {
      savePreferences(prefs)
      onClose()
    }
  }

  const STEPS = [
    { label: 'Domain', emoji: '🏢' },
    { label: 'Role',   emoji: '👔' },
    { label: 'Prefs',  emoji: '⚙️' },
  ]

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
              Next: Preferences →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Preferences */}
      {step === 2 && (
        <div className="p-7 flex flex-col gap-5">
          <h3 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>Additional Preferences</h3>
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
          {/* Summary */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-m)' }}>Your Profile Summary</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Domains: </span><span style={{ color: 'var(--text-b)' }}>{form.domains.join(', ')}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Roles: </span><span style={{ color: 'var(--text-b)' }}>{form.roles.join(', ')}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Work: </span><span style={{ color: 'var(--text-b)' }}>{form.workPreference}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-m)' }}>Experience: </span><span style={{ color: 'var(--text-b)' }}>{form.experienceLevel}</span></div>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button className="btn btn-ghost btn-md" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={finish}>💾 Save &amp; Continue →</button>
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
