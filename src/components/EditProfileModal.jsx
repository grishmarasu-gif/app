import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function EditProfileModal({ onClose }) {
  const { currentUser, updateProfile } = useAuth()
  const user = currentUser || {}

  const [form, setForm] = useState({
    name:          user.name || '',
    email:         user.email || '',
    phone:         user.phone || '',
    location:      user.location || '',
    title:         user.title || '',
    experience:    user.experience || '',
    targetSalary:  user.targetSalary || '',
    linkedin:      user.linkedin || '',
    summary:       user.summary || '',
    workPreference:user.workPreference || 'Remote',
    skills:        Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
  })

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function save() {
    updateProfile({
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
    })
    onClose()
  }

  const fields = [
    { label: 'Full Name',     key: 'name',         type: 'text' },
    { label: 'Email',         key: 'email',        type: 'email' },
    { label: 'Phone',         key: 'phone',        type: 'text' },
    { label: 'Location',      key: 'location',     type: 'text' },
    { label: 'Current Title', key: 'title',        type: 'text' },
    { label: 'Experience',    key: 'experience',   type: 'text' },
    { label: 'Target Salary', key: 'targetSalary', type: 'text' },
    { label: 'LinkedIn',      key: 'linkedin',     type: 'text' },
  ]

  const initials = (form.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg"
        style={{ background: '#fff', border: '1px solid var(--border)' }}>

        <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>Edit Profile</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>Your name and details appear across the app</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-m)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-7 flex flex-col gap-5">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0"
              style={{ background: 'var(--primary)' }}>{initials}</div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-h)' }}>{form.name || 'Your Name'}</p>
              <p className="text-sm" style={{ color: 'var(--text-m)' }}>{form.title || 'Your Title'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{form.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>{f.label}</label>
                <input className="input" type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Professional Summary</label>
            <textarea className="input" rows={3} value={form.summary || ''} onChange={e => set('summary', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Skills (comma-separated)</label>
            <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js…" />
            {form.skills && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="badge badge-green">{s}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Work Preference</label>
            <select className="input" value={form.workPreference} onChange={e => set('workPreference', e.target.value)}>
              {['Remote', 'Hybrid', 'On-site', 'Flexible', 'Any'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-7 py-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button className="btn btn-primary btn-md flex-1 justify-center" onClick={save}>Save Changes</button>
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
