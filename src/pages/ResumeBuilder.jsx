import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { simulateAIEnhancement } from '../utils/aiEnhancer'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Profile', 'Select Job', 'Generating', 'Preview']
const TEMPLATES = ['modern', 'professional', 'minimal', 'developer', 'elegant']

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
  const [template, setTemplate] = useState('modern')
  const [zoom, setZoom]       = useState(0.9)
  const [viewMode, setViewMode] = useState('resume') // 'resume' | 'coverLetter'
  const [fullScreen, setFullScreen] = useState(false)

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
    projects:    [{ title: '', techStack: '', duration: '', description: '' }],
    education:   [{ institution: '', degree: '', duration: '', cgpa: '' }],
    skills:      [...new Set([...(preferences.skills || [])])].join(', '),
    tools:       '',
    certifications: '',
    achievements: [],
    languages: [],
    publications: []
  })

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
              name: f.name || p.fullName || '',
              email: f.email || p.email || '',
              phone: f.phone || p.phone || '',
              linkedin: p.linkedin || f.linkedin,
              github: p.github || f.github,
              portfolio: p.portfolio || f.portfolio,
              leetcode: p.leetcode || f.leetcode,
              hackerrank: p.hackerrank || f.hackerrank,
              summary: f.summary || p.summary || '',
              tools: p.tools?.length > 0 ? p.tools.join(', ') : f.tools,
              certifications: p.certifications?.length > 0 ? p.certifications.join('\n') : f.certifications,
              achievements: p.achievements?.length > 0 ? p.achievements : f.achievements,
              languages: p.languages?.length > 0 ? p.languages : f.languages,
              publications: p.publications?.length > 0 ? p.publications : f.publications,
              skills: p.skills?.length > 0 ? [...new Set([...(p.skills || []), ...f.skills.split(',').map(s=>s.trim()).filter(Boolean)])].join(', ') : f.skills,
              experience: p.experience?.length > 0 ? p.experience : f.experience,
              projects: p.projects?.length > 0 ? p.projects : f.projects,
              education: p.education?.length > 0 ? p.education.map(e => typeof e === 'string' ? { institution: e, degree: '', duration: '', cgpa: '' } : e) : f.education,
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
  }, [step])

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

  // STRICT JOB FILTERING: Only show jobs matching onboarding preferences
  const sortedJobs = [...dbJobs].filter(j => {
    if (preferences.roles.length === 0) return true; // show all if no prefs
    return preferences.roles.some(r => j.title?.toLowerCase().includes(r.toLowerCase().split(' ')[0]));
  }).sort((a, b) => (b.prefMatchScore ?? b.matchScore ?? 0) - (a.prefMatchScore ?? a.matchScore ?? 0))

  const skillsArr  = form.skills.split(',').map(s => s.trim()).filter(Boolean)

  async function generate(job) {
    try {
      setSelJob(job)
      setStep(2)
      await new Promise(r => setTimeout(r, 1500)) // slightly faster animation
      const enhancedData = simulateAIEnhancement(form, job)
      setForm(enhancedData)
      setStep(3)
    } catch (err) {
      console.error('[ResumeBuilder] AI Tailoring failed:', err)
      toast('Tailoring encountered an error. Generating standard resume...')
      setStep(3) // Fallback: just show the parsed resume without enhancements
    }
  }

  function handleDownload() { 
    toast('Generating A4 PDF…')
    const element = document.getElementById(viewMode === 'resume' ? 'resume-pdf-container' : 'coverletter-pdf-container')
    if (element) {
      const originalTransform = element.style.transform;
      element.style.transform = 'scale(1)';
      
      const opt = {
        margin:       0,
        filename:     `${form.name.replace(/\s+/g, '_')}_${viewMode === 'resume' ? 'Resume' : 'CoverLetter'}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 3, useCORS: true, logging: false }, // high quality
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      }
      
      html2pdf().set(opt).from(element).save().then(() => {
        element.style.transform = originalTransform;
        toast('Downloaded ✓')
      })
    }
  }

  function handleImprove() { setStep(2); setTimeout(() => setStep(3), 1500); toast('Improving…') }

  const job = selJob || dbJobs[0] || {}

  const getFontFamily = () => {
    switch(template) {
      case 'professional': return '"Times New Roman", Times, serif';
      case 'developer': return '"Fira Code", "Courier New", monospace';
      case 'elegant': return '"Georgia", serif';
      case 'minimal': return '"Helvetica Neue", Helvetica, Arial, sans-serif';
      default: return 'Inter, sans-serif';
    }
  }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {!fullScreen && <Sidebar />}
      <div className="flex-1" style={{ marginLeft: fullScreen ? 0 : 240, transition: 'margin 0.3s' }}>
        {!fullScreen && (
          <TopBar title="AI Resume Builder" subtitle="Create tailored ATS-friendly resumes" />
        )}
        <main className={`${fullScreen ? 'p-0 h-screen' : 'p-7'} flex flex-col gap-6`} style={{ height: fullScreen ? '100vh' : 'auto' }}>
          
          {!fullScreen && (
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
          )}

          {step === 0 && (
            loadingResume ? (
              <div className="card p-16 flex items-center justify-center" style={{ minHeight: 400 }}>
                <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)' }} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                <div className="card p-8 flex flex-col gap-4 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Your Profile Details</h2>
                  <p className="text-xs text-gray-500 mb-2">Review your parsed profile before generating a customized resume.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[['Full Name','name'],['Email','email'],['Phone','phone'],['Location','location'],['GitHub Link','github'],['LinkedIn','linkedin'],['LeetCode','leetcode'],['HackerRank','hackerrank']].map(([lbl, k]) => (
                      <div key={k}>
                        <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-m)' }}>{lbl}</label>
                        <input className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                      </div>
                    ))}
                  </div>


                  {/* Experience */}
                  <div className="mt-2">
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Experience</h3>
                    {form.experience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 mb-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Company</label>
                            <input className="input" value={exp.company} onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Role</label>
                            <input className="input" value={exp.title} onChange={e => updateArrayItem('experience', idx, 'title', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Duration</label>
                            <input className="input" value={exp.duration} onChange={e => updateArrayItem('experience', idx, 'duration', e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Responsibilities</label>
                          <textarea className="input" rows={2} value={exp.responsibilities} onChange={e => updateArrayItem('experience', idx, 'responsibilities', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={() => addArrayItem('experience', { company: '', title: '', duration: '', responsibilities: '' })}>+ Add Experience</button>
                  </div>

                  {/* Projects */}
                  <div className="mt-2">
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Projects</h3>
                    {form.projects.map((proj, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 mb-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Title</label>
                            <input className="input" value={proj.title} onChange={e => updateArrayItem('projects', idx, 'title', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Tech Stack</label>
                            <input className="input" value={proj.techStack} onChange={e => updateArrayItem('projects', idx, 'techStack', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Duration</label>
                            <input className="input" value={proj.duration || ''} onChange={e => updateArrayItem('projects', idx, 'duration', e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Description</label>
                          <textarea className="input" rows={2} value={proj.description} onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={() => addArrayItem('projects', { title: '', techStack: '', duration: '', description: '' })}>+ Add Project</button>
                  </div>

                  {/* Skills */}
                  <div className="mt-2">
                    <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Skills</label>
                    <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} />
                  </div>

                  {/* Certifications */}
                  <div className="mt-2">
                    <label className="text-xs font-bold uppercase block mb-1" style={{ color: 'var(--text-m)' }}>Certifications</label>
                    <textarea className="input" rows={3} value={form.certifications} onChange={e => set('certifications', e.target.value)} />
                  </div>

                  <button className="btn btn-primary btn-md mt-4" onClick={() => setStep(1)}>Continue → Target Job</button>
                </div>
              </div>
            )
          )}

          {step === 1 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Select Target Job for Tailoring</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← Back</button>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loadingJobs ? (
                  <div className="col-span-full py-10 text-center">Loading jobs...</div>
                ) : sortedJobs.map(j => (
                  <div key={j.id} className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform border border-green-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm">{j.title}</h3>
                      <span className="badge badge-green">Match</span>
                    </div>
                    <p className="text-xs text-gray-500">{j.company}</p>
                    <button className="btn btn-primary btn-sm mt-auto" onClick={() => generate(j)}>Tailor Resume →</button>
                  </div>
                ))}
                {sortedJobs.length === 0 && !loadingJobs && (
                  <div className="col-span-full py-10 text-center text-sm text-gray-500">
                    No relevant jobs found matching your onboarding preferences.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card p-16 flex flex-col items-center gap-5 text-center">
              <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)' }} />
              <h2 className="font-bold text-lg">AI Tailoring in Progress...</h2>
              <p>Re-ordering skills, generating ATS metrics, and enhancing action verbs for {job.title}.</p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col lg:flex-row gap-6 h-full w-full">
              
              {/* LEFT SIDEBAR - AI INSIGHTS & CONTROLS */}
              {!fullScreen && (
                <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                  
                  {/* Actions */}
                  <div className="card p-5 flex flex-col gap-4 border border-gray-200">
                    <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-h)' }}>Document Actions</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setViewMode('resume')} className={`btn btn-sm flex-1 ${viewMode === 'resume' ? 'btn-primary' : 'btn-ghost'}`}>Resume</button>
                      <button onClick={() => setViewMode('coverLetter')} className={`btn btn-sm flex-1 ${viewMode === 'coverLetter' ? 'btn-primary' : 'btn-ghost'}`}>Cover Letter</button>
                    </div>
                    <button onClick={handleDownload} className="btn btn-primary btn-md w-full justify-center">⬇ Export PDF</button>
                    <button onClick={handleImprove} className="btn btn-ghost btn-sm w-full border border-gray-200">Regenerate ↻</button>
                    <button onClick={() => setFullScreen(true)} className="btn btn-ghost btn-sm w-full border border-gray-200">⛶ Full Screen Mode</button>
                  </div>

                  {/* Templates UI redesign */}
                  <div className="card p-5 border border-gray-200">
                    <h3 className="font-bold text-sm mb-3 text-gray-700">Premium Templates</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map(t => (
                        <button 
                          key={t}
                          onClick={() => setTemplate(t)}
                          className="flex items-center justify-center p-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                          style={{ 
                            background: template === t ? 'var(--primary-lt)' : 'transparent',
                            color: template === t ? 'var(--primary)' : 'var(--text-m)',
                            border: `1.5px solid ${template === t ? 'var(--primary)' : 'var(--border)'}`
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  {form.aiInsights && (
                    <div className="card p-5 flex flex-col gap-4" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <span style={{ color: 'var(--primary)' }}>✦</span> AI ATS Insights
                      </h3>
                      
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full" style={{ background: form.aiInsights.atsScore > 80 ? '#dcfce7' : '#fef9c3', border: `2px solid ${form.aiInsights.atsScore > 80 ? '#22c55e' : '#eab308'}` }}>
                          <span className="font-bold text-lg" style={{ color: form.aiInsights.atsScore > 80 ? '#166534' : '#854d0e' }}>{form.aiInsights.atsScore}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">ATS Score</p>
                          <p className="text-xs text-gray-500">{form.aiInsights.matchPercentage}% Job Match</p>
                        </div>
                      </div>

                      {form.aiInsights.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-red-600 uppercase mb-2">Missing Keywords</p>
                          <div className="flex flex-wrap gap-1">
                            {form.aiInsights.missingSkills.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700">{s}</span>)}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase mb-2">Suggestions</p>
                        <ul className="text-xs space-y-2 text-gray-600 list-disc pl-4">
                          {form.aiInsights.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RIGHT / MAIN CONTENT - A4 PREVIEW */}
              <div className="flex-1 card flex flex-col relative bg-gray-50" style={{ padding: 0, overflow: 'hidden', borderRadius: fullScreen ? 0 : '16px' }}>
                
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10 shadow-sm relative">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-700">Document Preview</span>
                    <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded">ATS Optimized (1-Page)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</button>
                    <span className="text-xs font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
                    {fullScreen && <button onClick={() => setFullScreen(false)} className="btn btn-ghost btn-sm ml-4">✕ Exit Full Screen</button>}
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto flex justify-center p-6 custom-scrollbar">
                  <div 
                    style={{ 
                      transform: `scale(${zoom})`, 
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    {/* --- THE A4 PAPER --- */}
                    <div 
                      id={viewMode === 'resume' ? 'resume-pdf-container' : 'coverletter-pdf-container'}
                      style={{
                        width: '8.27in',       // Strict A4 Width
                        minHeight: '11.69in',  // Strict A4 Height
                        padding: '0.4in 0.5in', // Compact standard margins for 1-page ATS
                        background: '#ffffff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', // Subtle modern shadow, no massive gap
                        fontFamily: getFontFamily(),
                        color: template === 'modern' ? '#1f2937' : '#000000',
                        boxSizing: 'border-box',
                        position: 'relative',
                        lineHeight: '1.35' // Tighter spacing for one page
                      }}
                    >
                      {viewMode === 'coverLetter' ? (
                        /* COVER LETTER VIEW */
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '11pt', lineHeight: 1.6 }}>
                           <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '15px', marginBottom: '30px' }}>
                             <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{form.name}</h1>
                             <p style={{ margin: '5px 0 0', fontSize: '10pt', color: '#666' }}>{form.email} | {form.phone} | {form.location}</p>
                           </div>
                           {form.coverLetterText}
                        </div>
                      ) : (
                        /* RESUME VIEW - STRICT SECTION ORDER */
                        <>
                          {/* 1. Header */}
                          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 4px 0', color: template === 'modern' ? 'var(--primary)' : 'inherit' }}>
                              {form.name}
                            </h1>
                            <div style={{ fontSize: '10pt', color: '#333', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              {[form.phone, form.email, form.location, form.linkedin?.replace('https://', '').replace('www.', ''), form.github?.replace('https://', '').replace('www.', ''), form.portfolio?.replace('https://', '').replace('www.', '')].filter(Boolean).map((item, i, arr) => (
                                <span key={i}>{item}{i < arr.length - 1 ? ' | ' : ''}</span>
                              ))}
                            </div>
                          </div>

                          {/* 3. Education */}
                          {form.education.length > 0 && form.education[0].institution && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Education</h2>
                              {form.education.map((edu, idx) => edu.institution && (
                                <div key={idx} style={{ marginBottom: '6px', fontSize: '10pt', lineHeight: '1.4' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <strong style={{ fontSize: '10pt' }}>{edu.institution}</strong>
                                    <span style={{ fontSize: '10pt', fontWeight: '500' }}>{edu.duration}</span>
                                  </div>
                                  {edu.degree && (
                                    <div style={{ marginTop: '1px' }}>{edu.degree}</div>
                                  )}
                                  {edu.cgpa && (
                                    <div style={{ marginTop: '1px' }}>CGPA: {edu.cgpa}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 4. Technical Skills */}
                          {(form.skills || form.tools) && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Technical Skills</h2>
                              {template === 'professional' || template === 'developer' || template === 'modern' ? (
                                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                                  {Object.entries(form.groupedSkills || {}).map(([cat, skills]) => skills.length > 0 && (
                                    <div key={cat} style={{ marginBottom: '4px' }}>
                                      <strong style={{ fontWeight: 'bold' }}>{cat}:</strong> <span>{skills.join(', ')}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ fontSize: '10pt', margin: 0 }}>{form.skills}</p>
                              )}
                            </div>
                          )}

                          {/* 5. Experience */}
                          {form.experience.length > 0 && form.experience[0].company && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Professional Experience</h2>
                              {form.experience.map((exp, idx) => exp.company && (
                                <div key={idx} style={{ marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                    <strong style={{ fontSize: '10.5pt' }}>{exp.company}</strong>
                                    <span style={{ fontSize: '10pt', fontWeight: '500' }}>{exp.duration}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10pt', fontStyle: 'italic' }}>{exp.title}</span>
                                  </div>
                                  <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap', paddingLeft: '12px', lineHeight: '1.4' }}>
                                    {exp.responsibilities}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 6. Projects */}
                          {form.projects.length > 0 && form.projects[0].title && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Projects</h2>
                              {form.projects.map((proj, idx) => proj.title && (
                                <div key={idx} style={{ marginBottom: '8px', fontSize: '10pt', lineHeight: '1.4' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                    <strong style={{ fontSize: '10.5pt' }}>{proj.title}</strong>
                                    <span style={{ fontSize: '10pt', fontWeight: '500' }}>{proj.duration}</span>
                                  </div>
                                  {proj.techStack && (
                                    <div style={{ marginBottom: '4px' }}>
                                      <strong>Tools:</strong> {proj.techStack}
                                    </div>
                                  )}
                                  <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '12px' }}>
                                    {proj.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 7. Certifications */}
                          {form.certifications && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Certifications</h2>
                              <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap', paddingLeft: '12px', lineHeight: '1.4' }}>
                                {form.certifications.split('\n').map((cert, i) => {
                                  const text = cert.replace(/^[-•*]\s*/, '').trim();
                                  return text ? <div key={i}>• {text}</div> : null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 8. Additional Information (Achievements/Languages) */}
                          {(form.achievements?.length > 0 || form.languages?.length > 0) && (
                            <div style={{ marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', marginBottom: '6px', paddingBottom: '2px', color: template === 'developer' ? 'var(--primary)' : 'inherit', textAlign: 'left' }}>Additional Information</h2>
                              {form.languages?.length > 0 && (
                                <div style={{ fontSize: '10pt', marginBottom: '4px' }}><strong>Languages:</strong> {form.languages.join(', ')}</div>
                              )}
                              {form.achievements?.length > 0 && (
                                <div style={{ fontSize: '10pt' }}><strong>Achievements:</strong> {form.achievements.join(', ')}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
