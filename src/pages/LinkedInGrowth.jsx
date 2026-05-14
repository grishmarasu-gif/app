import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function LinkedInGrowth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    // Simulate network request to verify credentials
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      
      // Redirect after showing success state
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    }, 1500)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F2EF]"> {/* LinkedIn background color */}
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <TopBar title="LinkedIn Growth" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          
          <div className="w-full max-w-sm bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden">
            {success ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Successfully Connected!</h3>
                <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                {/* LinkedIn styled header */}
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="#0a66c2" className="w-10 h-10 mb-2">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                  </svg>
                  <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight mb-1">Sign in</h1>
                  <p className="text-sm text-gray-600">Stay updated on your professional world</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Email or Phone"
                      className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] transition-colors"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold py-3.5 px-4 rounded-full transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <button className="text-[#0a66c2] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
                    Forgot password?
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
