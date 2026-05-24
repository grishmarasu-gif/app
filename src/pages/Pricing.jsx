import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const { completePricing, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCompletePricing = async () => {
    setLoading(true);
    const { ok, error } = await completePricing();
    setLoading(false);
    if (ok) {
      navigate('/onboarding');
    } else {
      alert(error || 'Failed to complete pricing');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Navbar matching Landing.jsx */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
        style={{ background: 'rgba(245,243,239,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-bold text-base" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Log Out</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-36">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: '1px solid rgba(31,122,108,.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />
            Upgrade Your Journey
          </div>
          <h1 className="font-extrabold leading-tight mb-5"
            style={{ fontSize: 'clamp(2.4rem,4.5vw,3.5rem)', color: 'var(--text-h)' }}>
            Choose Your Career <span style={{ color: 'var(--primary)' }}>Growth Plan</span>
          </h1>
          <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-b)' }}>
            Unlock AI-powered job search tools and resume optimization.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="card p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 relative"
            style={{ background: '#fff', border: '1px solid var(--primary)', boxShadow: '0 10px 40px -10px rgba(31,122,108,0.15)' }}>
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md"
                style={{ background: 'var(--primary)' }}>
                Most Popular
              </span>
            </div>
            
            <div className="mb-8 text-center mt-2">
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-h)' }}>Basic</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold" style={{ color: 'var(--text-h)' }}>$9.99</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'AI Resume Generator',
                'Resume ATS Score Checker',
                'Smart Job Recommendations',
                'Save Unlimited Jobs',
                'One-click Resume Download',
                'Basic Job Tracking Dashboard',
                'Email Support',
                'Profile Skill Analysis'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-b)' }}>
                  <div className="rounded-full p-1 flex-shrink-0" style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCompletePricing}
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center shadow-lg"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card p-8 flex flex-col transition-all duration-200"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', opacity: 0.8 }}>
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full border"
                style={{ background: 'var(--bg)', color: 'var(--text-m)', borderColor: 'var(--border)' }}>
                Coming Soon
              </span>
            </div>

            <div className="mb-8 text-center mt-2">
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-h)' }}>Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold" style={{ color: 'var(--text-m)' }}>$24.99</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1 opacity-70">
              {[
                'Everything in Basic',
                'AI Auto Apply',
                'Advanced Resume Optimization',
                'Interview Question Generator',
                'Recruiter Insights',
                'Priority Support',
                'Multi Resume Versions',
                'Job Application Analytics'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-b)' }}>
                  <div className="rounded-full p-1 flex-shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-m)', border: '1px solid var(--border)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="btn btn-lg w-full justify-center cursor-not-allowed opacity-50"
              style={{ background: 'var(--border)', color: 'var(--text-m)', border: 'none' }}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Skip for Now */}
        <div className="mt-12 text-center">
          <button
            onClick={handleCompletePricing}
            disabled={loading}
            className="text-sm font-bold transition-colors hover:underline"
            style={{ color: 'var(--text-m)', textUnderlineOffset: '4px' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-m)'}
          >
            Skip For Now
          </button>
        </div>
      </main>
    </div>
  );
}
