import { useState, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

const initTasks = [
  { id: 1, label: 'Review 5 new job matches', done: true,  category: 'Research' },
  { id: 2, label: 'Update resume with new project', done: true,  category: 'Resume' },
  { id: 3, label: 'Send 2 LinkedIn connection requests', done: false, category: 'Network' },
  { id: 4, label: 'Apply to 3 shortlisted roles', done: false, category: 'Apply' },
  { id: 5, label: 'Follow up on Vercel application', done: false, category: 'Follow-up' },
  { id: 6, label: 'Complete JavaScript skill assessment', done: false, category: 'Skills' },
]

const weeklyGoals = [
  { label: 'Applications Sent', current: 3, target: 10, color: 'var(--primary)' },
  { label: 'Companies Researched', current: 7, target: 15, color: 'var(--accent-dk)' },
  { label: 'Networking Contacts', current: 4, target: 8, color: 'var(--sage-dk)' },
  { label: 'Resumes Generated', current: 5, target: 10, color: 'var(--sec-mid)' },
]

const categoryColors = {
  Research: { bg: 'var(--primary-lt)', color: 'var(--primary)' },
  Resume: { bg: 'var(--accent-lt)', color: 'var(--accent-dk)' },
  Network: { bg: 'var(--sage-lt)', color: 'var(--sage-dk)' },
  Apply: { bg: '#f5f3ff', color: '#7c3aed' },
  'Follow-up': { bg: '#fef3c7', color: '#d97706' },
  Skills: { bg: '#f0fdf4', color: '#16a34a' },
}

export default function Workflow() {
  const [tasks, setTasks]     = useState(initTasks)
  const [newTask, setNewTask] = useState('')
  const [plan, setPlan]       = useState('Research target companies in fintech and developer tools. Apply to 10 roles this week. Network with 8 professionals on LinkedIn.')
  const taskCounter = useRef(100)

  const done  = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct   = Math.round((done / total) * 100)

  function toggle(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function addTask() {
    if (!newTask.trim()) return
    taskCounter.current += 1
    setTasks(ts => [...ts, { id: taskCounter.current, label: newTask.trim(), done: false, category: 'Research' }])
    setNewTask('')
  }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 240 }}>
        <TopBar title="Workflow" subtitle="Build and track your daily job search plan" />
        <main className="p-7 flex flex-col gap-6">

          {/* Overall progress */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>Today's Progress</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>Monday, April 28, 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>{pct}%</span>
                <span className="text-sm" style={{ color: 'var(--text-m)' }}>complete</span>
              </div>
            </div>
            <div className="progress-track mb-2" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-m)' }}>{done} of {total} tasks completed</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Task list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>Daily Checklist</h2>
                  <span className="badge badge-green">{done}/{total} done</span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  {tasks.map(t => {
                    const cat = categoryColors[t.category] || { bg: 'var(--bg-subtle)', color: 'var(--text-m)' }
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200"
                        style={{ background: t.done ? 'var(--bg-subtle)' : '#fff', border: '1px solid var(--border)' }}
                        onClick={() => toggle(t.id)}
                      >
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{ background: t.done ? 'var(--primary)' : 'transparent', border: t.done ? 'none' : '1.5px solid var(--border-md)' }}>
                          {t.done && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1 text-sm" style={{ color: t.done ? 'var(--text-m)' : 'var(--text-b)', textDecoration: t.done ? 'line-through' : 'none' }}>
                          {t.label}
                        </span>
                        <span className="badge text-xs flex-shrink-0" style={{ background: cat.bg, color: cat.color }}>{t.category}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Add task */}
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="Add a task…" value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()} />
                  <button className="btn btn-primary btn-md" onClick={addTask}>Add</button>
                </div>
              </div>

              {/* Weekly goals */}
              <div className="card p-5">
                <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>Weekly Goals</h2>
                <div className="flex flex-col gap-4">
                  {weeklyGoals.map(g => (
                    <div key={g.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold" style={{ color: 'var(--text-b)' }}>{g.label}</span>
                        <span className="font-bold" style={{ color: g.color }}>{g.current} / {g.target}</span>
                      </div>
                      <div className="progress-track" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${(g.current / g.target) * 100}%`, background: g.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-4">
              {/* Daily plan */}
              <div className="card p-5">
                <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-h)' }}>Weekly Plan</h2>
                <textarea className="input" rows={5} style={{ resize: 'vertical', fontSize: '.8rem' }}
                  value={plan} onChange={e => setPlan(e.target.value)} />
                <button className="btn btn-primary btn-sm mt-3 w-full justify-center">Save Plan</button>
              </div>

              {/* Category breakdown */}
              <div className="card p-5">
                <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text-h)' }}>By Category</h2>
                <div className="flex flex-col gap-2">
                  {Object.entries(categoryColors).map(([cat, style]) => {
                    const catTasks = tasks.filter(t => t.category === cat)
                    const catDone  = catTasks.filter(t => t.done).length
                    if (catTasks.length === 0) return null
                    return (
                      <div key={cat} className="flex items-center gap-3 p-2.5 rounded-lg"
                        style={{ background: style.bg }}>
                        <span className="text-xs font-bold flex-1" style={{ color: style.color }}>{cat}</span>
                        <span className="text-xs font-medium" style={{ color: style.color }}>{catDone}/{catTasks.length}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Streak */}
              <div className="card p-5 text-center" style={{ background: 'var(--primary-lt)', borderColor: 'rgba(31,122,108,.2)' }}>
                <div className="text-3xl mb-2">🔥</div>
                <p className="font-extrabold text-xl" style={{ color: 'var(--primary)' }}>12-Day Streak</p>
                <p className="text-xs mt-1" style={{ color: 'var(--sec-mid)' }}>You've been consistent. Keep it going!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
