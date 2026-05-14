import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function Knowledge() {
  const [handicapped, setHandicapped] = useState('')
  const [criminalRecord, setCriminalRecord] = useState('')
  const [authorized, setAuthorized] = useState('')
  const [sponsorship, setSponsorship] = useState('')
  const [fired, setFired] = useState('')
  
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  // Reusable Question Component to keep code clean
  const RadioQuestion = ({ label, name, value, onChange }) => (
    <div>
      <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-h)' }}>
        {label} *
      </label>
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input 
            type="radio" 
            name={name} 
            value="Yes" 
            required
            checked={value === 'Yes'}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
          />
          <span className="text-sm font-medium">Yes</span>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input 
            type="radio" 
            name={name} 
            value="No" 
            checked={value === 'No'}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
          />
          <span className="text-sm font-medium">No</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-slate-50/50">
        <TopBar title="Security & Background" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto w-full py-4">
            
            {submitted ? (
              <div className="bg-white rounded-2xl border p-12 text-center shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-h)' }}>Details Submitted</h2>
                <p className="text-lg" style={{ color: 'var(--text-m)' }}>
                  Thank you. Your security and background details have been recorded for your job applications. Redirecting...
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border p-8 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-8 border-b pb-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Security & Background Questionnaire</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-m)' }}>
                    Please answer the following standard security and HR background questions to complete your profile for job applications.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  <div className="space-y-6">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--primary)' }}>General Background</h3>
                    <RadioQuestion 
                      label="Are you physically handicapped?" 
                      name="handicapped" 
                      value={handicapped} 
                      onChange={setHandicapped} 
                    />
                    <RadioQuestion 
                      label="Do you have any pending criminal cases against you?" 
                      name="criminalRecord" 
                      value={criminalRecord} 
                      onChange={setCriminalRecord} 
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--primary)' }}>Employment Eligibility</h3>
                    <RadioQuestion 
                      label="Are you legally authorized to work in the country you are applying in?" 
                      name="authorized" 
                      value={authorized} 
                      onChange={setAuthorized} 
                    />
                    <RadioQuestion 
                      label="Will you now or in the future require sponsorship for employment visa status?" 
                      name="sponsorship" 
                      value={sponsorship} 
                      onChange={setSponsorship} 
                    />
                    <RadioQuestion 
                      label="Have you ever been fired, dismissed, or asked to resign from a job?" 
                      name="fired" 
                      value={fired} 
                      onChange={setFired} 
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <button 
                      type="submit" 
                      className="w-full py-4 px-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
                      style={{ background: 'var(--primary)' }}
                    >
                      Save & Continue
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
