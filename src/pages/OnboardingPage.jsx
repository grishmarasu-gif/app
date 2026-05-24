import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OnboardingModal from '../components/OnboardingModal'

// Standalone onboarding page — shown after register/login when prefs missing
export default function OnboardingPage() {
  const { savePreferences } = useAuth()
  const navigate = useNavigate()

  async function handleComplete(prefs) {
    const res = await savePreferences(prefs)
    if (res && !res.ok) {
      alert(res.error) // simple error handling for page
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}>
      {/* Render modal inline (not as overlay) */}
      <OnboardingModal onClose={() => {}} onComplete={handleComplete} inline />
    </div>
  )
}
