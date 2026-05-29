import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';

const FEEDBACK_TYPES = [
  'Feature Request',
  'Bug Report',
  'UI Improvement',
  'Job Matching Feedback',
  'Auto Apply Suggestions',
  'Resume Builder Feedback',
  'General Review',
  'Other'
];

const POPULAR_FEATURES = [
  { title: 'AI Resume Optimization', desc: 'Scan and automatically rewrite bullets for specific jobs.', votes: 245 },
  { title: 'Auto Apply Pro', desc: 'Automatically submit applications for 100% matched jobs.', votes: 189 },
  { title: 'Interview Preparation', desc: 'Mock interviews tailored to the job description.', votes: 156 },
  { title: 'Smart Cover Letters', desc: 'Generate customized cover letters in 1 click.', votes: 134 },
  { title: 'LinkedIn AI Assistant', desc: 'Auto-commenting and networking suggestions.', votes: 98 }
];

export default function UserVoice() {
  const { token, currentUser } = useAuth();
  const { toast } = useApp();

  const [form, setForm] = useState({
    feedbackType: 'Feature Request',
    subject: '',
    message: '',
    rating: 0,
    screenshotUrl: '',
    recommendPlatform: true,
    priority: 'Low',
    isAnonymous: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast('Please fill in the subject and message', 'error');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token && !form.isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        toast('Thank you for helping improve Apply4works 🚀', 'success');
        setForm({
          feedbackType: 'Feature Request',
          subject: '',
          message: '',
          rating: 0,
          screenshotUrl: '',
          recommendPlatform: true,
          priority: 'Low',
          isAnonymous: false
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        toast(data.message || 'Failed to submit feedback', 'error');
      }
    } catch (err) {
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 overflow-x-hidden" style={{ marginLeft: 240 }}>
        <TopBar title="User Voice" />
        <main className="p-7 flex flex-col gap-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          
          {/* Header */}
          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dk) 100%)', color: '#fff' }}>
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-2xl font-extrabold mb-2">Help Improve Apply4works</h1>
              <p className="text-sm opacity-90 leading-relaxed">
                Share feedback, suggest features, and help us build a better platform for job seekers. 
                We read every single submission.
              </p>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full opacity-10 bg-white blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full opacity-10 bg-white blur-2xl mix-blend-overlay"></div>
            
            {/* SVG Illustration */}
            <svg className="absolute right-10 bottom-4 w-32 h-32 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            
            {/* Form Section */}
            <div className="lg:col-span-2 card p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-h)' }}>Feedback Submitted!</h3>
                  <p className="text-sm" style={{ color: 'var(--text-m)' }}>Thank you for helping us make Apply4works better. Our team will review your submission shortly.</p>
                  <button className="btn btn-ghost mt-6" onClick={() => setSuccess(false)}>Submit Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Feedback Type</label>
                      <select className="input" value={form.feedbackType} onChange={e => set('feedbackType', e.target.value)}>
                        {FEEDBACK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Priority</label>
                      <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                        <option value="Low">Low (Nice to have)</option>
                        <option value="Medium">Medium (Important)</option>
                        <option value="High">High (Critical)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Subject</label>
                    <input className="input" type="text" placeholder="e.g. Add dark mode support" 
                      value={form.subject} onChange={e => set('subject', e.target.value)} maxLength={100} required />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-m)' }}>Detailed Feedback</label>
                      <span className="text-xs" style={{ color: form.message.length > 900 ? 'var(--red)' : 'var(--text-m)' }}>{form.message.length}/1000</span>
                    </div>
                    <textarea className="input" rows={5} placeholder="Describe your request, issue, or feedback in detail..." 
                      value={form.message} onChange={e => set('message', e.target.value)} maxLength={1000} required></textarea>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Rate Your Experience</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" 
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => set('rating', star)}>
                            <svg className="w-7 h-7 transition-colors" 
                              fill={(hoveredStar >= star || form.rating >= star) ? '#f59e0b' : 'none'}
                              stroke={(hoveredStar >= star || form.rating >= star) ? '#f59e0b' : 'var(--border-dark)'} 
                              viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-m)' }}>Optional Screenshot URL</label>
                      <input className="input" type="url" placeholder="https://imgur.com/..." value={form.screenshotUrl} onChange={e => set('screenshotUrl', e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-2 p-4 rounded-xl items-center justify-between" style={{ background: 'var(--bg-subtle)' }}>
                    <div className="flex items-center gap-3 w-full">
                      <label className="flex items-center cursor-pointer relative">
                        <input type="checkbox" className="sr-only" checked={form.recommendPlatform} onChange={e => set('recommendPlatform', e.target.checked)} />
                        <div className={`w-10 h-5 rounded-full transition-colors ${form.recommendPlatform ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${form.recommendPlatform ? 'translate-x-5' : ''}`}></div>
                      </label>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-h)' }}>I would recommend Apply4works</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:justify-end">
                      <input type="checkbox" id="anon" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                        checked={form.isAnonymous} onChange={e => set('isAnonymous', e.target.checked)} />
                      <label htmlFor="anon" className="text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-m)' }}>Submit Anonymously</label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full flex justify-center items-center gap-2 shadow-lg"
                      style={{ boxShadow: '0 4px 14px 0 rgba(31,122,108,0.25)' }}>
                      {loading ? (
                         <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* Sidebar / Popular requests */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-h)' }}>
                  <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Popular Requested Features
                </h3>
                <div className="flex flex-col gap-3">
                  {POPULAR_FEATURES.map((feat, idx) => (
                    <div key={idx} className="p-3 rounded-xl flex items-start gap-3 transition-colors hover:bg-gray-50 border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex flex-col items-center justify-center py-1 px-2 rounded-lg bg-gray-100 text-gray-500 min-w-[40px]">
                        <svg className="w-3 h-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                        <span className="text-xs font-bold">{feat.votes}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs" style={{ color: 'var(--text-h)' }}>{feat.title}</p>
                        <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--text-m)' }}>{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 text-center flex flex-col items-center" style={{ background: 'var(--primary-lt)', border: '1px solid rgba(31,122,108,.2)' }}>
                <span className="text-3xl mb-2">💡</span>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--primary)' }}>Have an idea?</p>
                <p className="text-xs px-2" style={{ color: 'var(--primary)', opacity: 0.8 }}>We build features directly based on user feedback. Let us know what you want to see next!</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
