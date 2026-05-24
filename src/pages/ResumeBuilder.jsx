import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { simulateAIEnhancement } from '../utils/aiEnhancer'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Profile', 'Select Job', 'Generating', 'Preview']

export default function ResumeBuilder() {
  const { jobs, applyToJob, toast } = useApp()
  const { currentUser, storedPrefs } = useAuth()
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get('job')

  const user = currentUser || {}
  const preferences = storedPrefs || { roles: [], domains: [], skills: [], location: '', experienceLevel: '', salaryExpectation: '' }

  const [step, setStep]       = useState(preselectedId ? 1 : 0)
  const [selJob, setSelJob]   = useState(null)
  const [dbJobs, setDbJobs]   = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingResume, setLoadingResume] = useState(true)
  const [template, setTemplate] = useState('modern') // 'modern', 'professional', 'minimal'

  useEffect(() => {
    async function fetchResume() {
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoadingResume(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/resume/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.resume && data.resume.parsed) {
            const p = data.resume.parsed
            setForm(f => ({
              ...f,
              name: p.fullName || f.name,
              email: p.email || f.email,
              phone: p.phone || f.phone,
              linkedin: p.linkedin || f.linkedin,
              github: p.github || f.github,
              portfolio: p.portfolio || f.portfolio,
              leetcode: p.leetcode || f.leetcode,
              hackerrank: p.hackerrank || f.hackerrank,
              summary: p.summary || f.summary,
              tools: p.tools?.length > 0 ? p.tools.join(', ') : f.tools,
              certifications: p.certifications?.length > 0 ? p.certifications.join(', ') : f.certifications,
              achievements: p.achievements?.length > 0 ? p.achievements : f.achievements,
              skills: p.skills?.length > 0 ? [...new Set([...(p.skills || []), ...f.skills.split(',').map(s=>s.trim()).filter(Boolean)])].join(', ') : f.skills,
              experience: p.experience?.length > 0 ? p.experience : f.experience,
              projects: p.projects?.length > 0 ? p.projects : f.projects,
              education: p.education?.length > 0 ? p.education.map(e => ({ institution: e, degree: '', duration: '' })) : f.education,
            }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch resume', err)
      } finally {
        setLoadingResume(false)
      }
    }
    fetchResume()
  }, [])

  useEffect(() => {
    if (step === 1) {
      setLoadingJobs(true)
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';
      fetch(`${API_BASE}/jobs`)
        .then(res => res.json())
        .then(data => {
          const fetchedJobs = Array.isArray(data) ? data : (data.jobs || [])
          setDbJobs(fetchedJobs)
          setLoadingJobs(false)
        })
        .catch(err => {
          console.error('[ResumeBuilder] Failed to fetch jobs', err)
          setDbJobs([])
          setLoadingJobs(false)
        })
    }
  }, [step, jobs])

  const [coverLetter, setCoverLetter] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [form, setForm]       = useState({
    name:        user.name || '',
    email:       user.email || '',
    phone:       user.phone || '',
    location:    preferences.location || '',
    github:      '',
    linkedin:    '',
    portfolio:   '',
    leetcode:    '',
    hackerrank:  '',
    summary:     '',
    experience:  [{ company: '', title: '', duration: '', responsibilities: '' }],
    projects:    [{ title: '', techStack: '', description: '' }],
    education:   [{ institution: '', degree: '', duration: '' }],
    skills:      [...new Set([...(preferences.skills || [])])].join(', '),
    tools:       '',
    certifications: '',
    achievements: [],
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  
  function updateArrayItem(key, index, field, value) {
    setForm(f => {
      const arr = [...f[key]]
      arr[index] = { ...arr[index], [field]: value }
      return { ...f, [key]: arr }
    })
  }

  function addArrayItem(key, emptyObj) {
    setForm(f => ({ ...f, [key]: [...f[key], emptyObj] }))
  }

  // Sort fetched jobs: preference-matching first
  const sortedJobs = [...dbJobs].sort((a, b) => {
    const aMatch = preferences.roles.some(r => a.title?.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
    const bMatch = preferences.roles.some(r => b.title?.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return (b.prefMatchScore ?? b.matchScore ?? 0) - (a.prefMatchScore ?? a.matchScore ?? 0)
  })

  const skillsArr  = form.skills.split(',').map(s => s.trim()).filter(Boolean)

  async function generate(job) {
    setSelJob(job)
    setStep(2)
    await new Promise(r => setTimeout(r, 2000))
    const enhancedData = simulateAIEnhancement(form, job)
    setForm(enhancedData)
    setStep(3)
  }

  function handleDownload() { 
    toast('Generating PDF…')
    const element = document.getElementById('resume-pdf-container')
    if (element) {
      const opt = {
        margin:       0.4,
        filename:     `${form.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save().then(() => {
        toast('Downloaded ✓')
      })
    }
  }
  function handleCopy() {
    const text = `${form.name}\n${form.email} · ${form.location}\nLinkedIn: ${form.linkedin}\nGitHub: ${form.github}\n\nExperience:\n${form.experience.map(e => `${e.title} at ${e.company} (${e.duration})\n${e.responsibilities}`).join('\n\n')}\n\nProjects:\n${form.projects.map(p => `${p.title} (${p.techStack})\n${p.description}`).join('\n\n')}\n\nSkills: ${form.skills}`
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
            loadingResume ? (
              <div className="card p-16 flex items-center justify-center" style={{ minHeight: 400 }}>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-m)' }}>Loading parsed resume data...</p>
                </div>
              </div>
            ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Your Profile</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[['Full Name','name'],['Email','email'],['Phone','phone'],['Location','location'],['GitHub Link','github'],['LinkedIn','linkedin'],['LeetCode','leetcode'],['HackerRank','hackerrank']].map(([lbl, k]) => (
                    <div key={k}>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>{lbl}</label>
                      <input className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Professional Summary</label>
                  <textarea className="input" rows={3} placeholder="A brief summary of your background and goals..." value={form.summary} onChange={e => set('summary', e.target.value)} />
                </div>

                {/* Experience */}
                <div className="mt-2">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Experience</h3>
                  {form.experience.map((exp, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 mb-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Company Name</label>
                          <input className="input" value={exp.company} onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Role / Title</label>
                          <input className="input" value={exp.title} onChange={e => updateArrayItem('experience', idx, 'title', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Duration</label>
                          <input className="input" placeholder="e.g. 2021 - Present" value={exp.duration} onChange={e => updateArrayItem('experience', idx, 'duration', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Key Responsibilities</label>
                        <textarea className="input" rows={2} value={exp.responsibilities} onChange={e => updateArrayItem('experience', idx, 'responsibilities', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => addArrayItem('experience', { company: '', title: '', duration: '', responsibilities: '' })}>+ Add More Experience</button>
                </div>

                {/* Projects */}
                <div className="mt-2">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Projects</h3>
                  {form.projects.map((proj, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 mb-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Project Title</label>
                          <input className="input" value={proj.title} onChange={e => updateArrayItem('projects', idx, 'title', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Tech Stack</label>
                          <input className="input" placeholder="e.g. React, Node.js" value={proj.techStack} onChange={e => updateArrayItem('projects', idx, 'techStack', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Description</label>
                        <textarea className="input" rows={2} value={proj.description} onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => addArrayItem('projects', { title: '', techStack: '', description: '' })}>+ Add More Projects</button>
                </div>

                {/* Education */}
                <div className="mt-2">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Education</h3>
                  {form.education.map((edu, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 mb-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Institution</label>
                          <input className="input" value={edu.institution} onChange={e => updateArrayItem('education', idx, 'institution', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Degree</label>
                          <input className="input" placeholder="e.g. B.S. Computer Science" value={edu.degree} onChange={e => updateArrayItem('education', idx, 'degree', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Duration</label>
                          <input className="input" placeholder="e.g. 2018 - 2022" value={edu.duration} onChange={e => updateArrayItem('education', idx, 'duration', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => addArrayItem('education', { institution: '', degree: '', duration: '' })}>+ Add More Education</button>
                </div>

                <div className="mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Skills (comma-separated)</label>
                  <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillsArr.slice(0, 10).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                </div>

                <div className="mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Tools (comma-separated)</label>
                  <input className="input" placeholder="e.g. Git, Docker, Figma" value={form.tools} onChange={e => set('tools', e.target.value)} />
                </div>

                <div className="mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Certifications (comma-separated)</label>
                  <input className="input" placeholder="e.g. AWS Certified Developer" value={form.certifications} onChange={e => set('certifications', e.target.value)} />
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Achievements</h3>
                  {form.achievements.map((ach, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                       <input className="input" value={ach} onChange={e => {
                         const newAch = [...form.achievements];
                         newAch[idx] = e.target.value;
                         set('achievements', newAch);
                       }} />
                       <button className="btn btn-ghost btn-sm" onClick={() => {
                         const newAch = form.achievements.filter((_, i) => i !== idx);
                         set('achievements', newAch);
                       }}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => set('achievements', [...form.achievements, ''])}>+ Add Achievement</button>
                </div>

                <div className="mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>Portfolio URL</label>
                  <input className="input" placeholder="https://..." value={form.portfolio} onChange={e => set('portfolio', e.target.value)} />
                </div>


                <button className="btn btn-primary btn-md mt-1" onClick={() => setStep(1)}>Continue → Select Job</button>
              </div>

              <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--bg-subtle)', height: 'fit-content' }}>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Profile Preview</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: 'var(--primary)' }}>
                    {form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-h)' }}>{form.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-m)' }}>{form.email}</p>
                    {form.github && <p className="text-xs" style={{ color: 'var(--text-m)' }}>GitHub: {form.github}</p>}
                    {form.linkedin && <p className="text-xs" style={{ color: 'var(--text-m)' }}>LinkedIn: {form.linkedin}</p>}
                    {form.leetcode && <p className="text-xs" style={{ color: 'var(--text-m)' }}>LeetCode: {form.leetcode}</p>}
                    {form.hackerrank && <p className="text-xs" style={{ color: 'var(--text-m)' }}>HackerRank: {form.hackerrank}</p>}
                  </div>
                </div>
                
                {form.experience.length > 0 && form.experience[0].company && (
                  <div>
                    <p className="text-xs font-bold mb-1.5 mt-3" style={{ color: 'var(--text-m)' }}>EXPERIENCE</p>
                    {form.experience.map((exp, idx) => (
                      exp.company && <p key={idx} className="text-sm" style={{ color: 'var(--text-b)' }}>• {exp.title} at {exp.company}</p>
                    ))}
                  </div>
                )}
                
                {form.projects.length > 0 && form.projects[0].title && (
                  <div>
                    <p className="text-xs font-bold mb-1.5 mt-3" style={{ color: 'var(--text-m)' }}>PROJECTS</p>
                    {form.projects.map((proj, idx) => (
                      proj.title && <p key={idx} className="text-sm" style={{ color: 'var(--text-b)' }}>• {proj.title} ({proj.techStack})</p>
                    ))}
                  </div>
                )}

                {preferences.roles.length > 0 && (
                  <div className="pt-3 border-t mt-4" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-m)' }}>TARGETING ROLES</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferences.roles.map(r => <span key={r} className="badge badge-green">{r}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )
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
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loadingJobs ? (
                  <div className="col-span-full py-10 text-center" style={{ color: 'var(--text-m)' }}>Loading jobs from database...</div>
                ) : sortedJobs.map(j => {
                  const score = j.prefMatchScore ?? j.matchScore ?? 85
                  const isPrefMatch = preferences.roles.some(r => j.title?.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
                  const scoreCls = score >= 88 ? 'match-high' : score >= 75 ? 'match-medium' : 'match-low'
                  const fallbackLogo = j.company ? j.company.charAt(0) : 'J'
                  const workTypeCls = j.workType === 'Remote' ? 'badge-green' : j.workType === 'Hybrid' ? 'badge-orange' : 'badge-slate'

                  return (
                    <div key={j.id || j._id} className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200"
                      style={{ border: isPrefMatch ? '1.5px solid rgba(31,122,108,.3)' : '1px solid var(--border)' }}>
                      
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: j.logoColor || 'var(--primary)' }}>{j.logo || fallbackLogo}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm leading-snug truncate" style={{ color: 'var(--text-h)' }}>{j.title}</h3>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-m)' }}>{j.company} · {j.location}</p>
                        </div>
                        <div className={`match-ring ${scoreCls}`}>{score}%</div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`badge ${workTypeCls}`}>{j.workType || 'On-site'}</span>
                        <span className="badge badge-slate">{j.jobType || 'Full-time'}</span>
                        <span className="badge badge-sage">{j.experienceLevel || 'Entry-Level'}</span>
                        {isPrefMatch && <span className="badge badge-orange text-[10px]">Role Match</span>}
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs" style={{ color: 'var(--text-b)' }}>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="font-medium truncate">{j.salary || 'Not disclosed'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="truncate">Due {j.deadline || 'ASAP'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          <span className="truncate">{j.source || 'Apply4works'}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {(j.skills || []).slice(0, 4).map(s => (
                          <span key={s} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--bg-subtle)', color: 'var(--sec-mid)', border: '1px solid var(--border)' }}>{s}</span>
                        ))}
                        {(j.skills || []).length > 4 && <span className="text-xs px-2.5 py-0.5 font-medium" style={{ color: 'var(--text-m)' }}>+{(j.skills || []).length - 4}</span>}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
                        <button className="btn btn-primary btn-sm flex-1 justify-center" onClick={() => generate(j)}>Generate →</button>
                      </div>
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
              <div className="lg:col-span-3 card" style={{ minHeight: 500, padding: 0, overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setTemplate('modern')} className={`btn btn-sm ${template === 'modern' ? 'btn-primary' : 'btn-ghost'}`}>Modern</button>
                  <button onClick={() => setTemplate('professional')} className={`btn btn-sm ${template === 'professional' ? 'btn-primary' : 'btn-ghost'}`}>Professional</button>
                  <button onClick={() => setTemplate('minimal')} className={`btn btn-sm ${template === 'minimal' ? 'btn-primary' : 'btn-ghost'}`}>Minimal</button>
                </div>
                <div style={{ overflowX: 'auto', padding: '2rem', background: '#e2e8f0' }}>
                  <div id="resume-pdf-container" style={{
                    background: '#fff',
                    padding: '30px 40px',
                    width: '8.5in',
                    maxHeight: '11in',
                    overflow: 'hidden',
                    margin: '0 auto',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontFamily: template === 'professional' ? '"Times New Roman", Times, serif' : 'Inter, sans-serif',
                    color: '#000',
                    boxSizing: 'border-box'
                  }}>
                    {/* Header */}
                    <div style={{ textAlign: template === 'minimal' ? 'left' : 'center', marginBottom: '1rem', borderBottom: template === 'professional' ? '2px solid #000' : 'none', paddingBottom: template === 'professional' ? '0.5rem' : '0' }}>
                      <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: template === 'professional' ? 'uppercase' : 'none' }}>{form.name}</h1>
                      <p style={{ fontSize: '11px', margin: '0 0 2px 0' }}>{form.email} • {form.phone} • {form.location}</p>
                      <p style={{ fontSize: '11px', margin: 0 }}>
                        {form.linkedin && <span>LinkedIn: {form.linkedin} • </span>}
                        {form.github && <span>GitHub: {form.github} • </span>}
                        {form.leetcode && <span>LeetCode: {form.leetcode} • </span>}
                        {form.hackerrank && <span>HackerRank: {form.hackerrank} • </span>}
                        {form.portfolio && <span>Portfolio: {form.portfolio}</span>}
                      </p>
                    </div>

                    {/* Professional Summary */}
                    {form.summary && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '4px', paddingBottom: '2px' }}>Professional Summary</h2>
                        <p style={{ fontSize: '11px', lineHeight: '1.3', margin: 0 }}>{form.summary}</p>
                      </div>
                    )}

                    {/* Skills & Tools */}
                    {(form.skills || form.tools) && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '4px', paddingBottom: '2px' }}>Technical Skills</h2>
                        {template === 'professional' && form.groupedSkills ? (
                          <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                            {Object.entries(form.groupedSkills).map(([cat, skills]) => skills.length > 0 && (
                              <div key={cat}><strong style={{ width: '70px', display: 'inline-block' }}>{cat}:</strong> {skills.join(', ')}</div>
                            ))}
                            {form.tools && <div><strong style={{ width: '70px', display: 'inline-block' }}>Tools:</strong> {form.tools}</div>}
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                            {form.skills && <p style={{ margin: 0 }}><strong>Skills:</strong> {form.skills}</p>}
                            {form.tools && <p style={{ margin: '2px 0 0 0' }}><strong>Tools:</strong> {form.tools}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Experience */}
                    {form.experience.length > 0 && form.experience[0].company && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px' }}>Professional Experience</h2>
                        {form.experience.map((exp, idx) => exp.company && (
                          <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                              <strong style={{ fontSize: '12px' }}>{exp.title}</strong>
                              <span style={{ fontSize: '11px' }}>{exp.duration}</span>
                            </div>
                            <div style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '2px' }}>{exp.company}</div>
                            <div style={{ fontSize: '11px', lineHeight: '1.3', whiteSpace: 'pre-wrap' }}>
                              {exp.responsibilities}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {form.projects.length > 0 && form.projects[0].title && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px' }}>Projects</h2>
                        {form.projects.map((proj, idx) => proj.title && (
                          <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                              <strong style={{ fontSize: '12px' }}>{proj.title}</strong>
                              <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{proj.techStack}</span>
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: '1.3', whiteSpace: 'pre-wrap' }}>
                              {proj.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {form.education.length > 0 && form.education[0].institution && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px' }}>Education</h2>
                        {form.education.map((edu, idx) => edu.institution && (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                              <strong style={{ fontSize: '11px' }}>{edu.institution}</strong>
                              <span style={{ fontSize: '10px' }}>{edu.duration}</span>
                            </div>
                            <div style={{ fontSize: '11px', fontStyle: 'italic' }}>{edu.degree}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {form.certifications && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '4px', paddingBottom: '2px' }}>Certifications</h2>
                        <p style={{ fontSize: '11px', lineHeight: '1.3', margin: 0 }}>{form.certifications}</p>
                      </div>
                    )}

                    {/* Achievements */}
                    {form.achievements && form.achievements.length > 0 && (
                      <div style={{ marginBottom: '0' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '4px', paddingBottom: '2px' }}>Achievements</h2>
                        {form.achievements.map((ach, idx) => (
                           <p key={idx} style={{ fontSize: '11px', lineHeight: '1.3', margin: 0 }}>• {ach}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                    {(job.preferredSkills || []).map(s => <span key={s} className="badge badge-orange">{s}</span>)}
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
