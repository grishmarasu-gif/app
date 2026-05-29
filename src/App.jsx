import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Landing         from './pages/Landing'
import Login           from './pages/Login'
import Register        from './pages/Register'
import OnboardingPage  from './pages/OnboardingPage'
import Dashboard       from './pages/Dashboard'
import DailyJobs       from './pages/DailyJobs'
import JobDetail       from './pages/JobDetail'
import ResumeBuilder   from './pages/ResumeBuilder'
import Applications    from './pages/Applications'

import Pricing         from './pages/Pricing'
import Knowledge       from './pages/Knowledge'
import LinkedInGrowth  from './pages/LinkedInGrowth'
import UserVoice       from './pages/UserVoice'

// Requires login only (used for Pricing page)
function PricingRoute({ children }) {
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  if (isLoading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  
  if (currentUser?.pricingCompleted !== false) {
    if (currentUser?.onboardingCompleted === false) return <Navigate to="/onboarding" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// Requires login AND pricingCompleted (used for Onboarding)
function OnboardingRoute({ children }) {
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  if (isLoading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  
  // TEMP PAYMENT BYPASS FOR DEVELOPMENT
  // if (currentUser?.pricingCompleted === false) return <Navigate to="/pricing" replace />
  
  if (currentUser?.onboardingCompleted !== false) return <Navigate to="/dashboard" replace />
  return children
}

// Requires login AND pricingCompleted AND onboardingCompleted
function AppRoute({ children }) {
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  if (isLoading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  
  // TEMP PAYMENT BYPASS FOR DEVELOPMENT
  // if (currentUser?.pricingCompleted === false) return <Navigate to="/pricing" replace />
  
  if (currentUser?.onboardingCompleted === false) return <Navigate to="/onboarding" replace />
  return children
}

// Redirect logged-in users away from login/register
function GuestRoute({ children }) {
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  if (isLoading) return null
  if (isLoggedIn) {
    if (currentUser?.pricingCompleted === false) return <Navigate to="/pricing" replace />
    if (currentUser?.onboardingCompleted === false) return <Navigate to="/onboarding" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Pricing — needs login but no plan yet */}
      <Route path="/pricing"  element={<PricingRoute><Pricing /></PricingRoute>} />
      <Route path="/payment"  element={<AppRoute><Pricing /></AppRoute>} />

      {/* Auth — needs login & plan, but NOT necessarily prefs yet */}
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

      {/* Protected — needs login + plan + prefs */}
      <Route path="/dashboard"       element={<AppRoute><Dashboard /></AppRoute>} />
      <Route path="/jobs"            element={<AppRoute><DailyJobs /></AppRoute>} />
      <Route path="/jobs/:id"        element={<AppRoute><JobDetail /></AppRoute>} />
      <Route path="/resume"          element={<AppRoute><ResumeBuilder /></AppRoute>} />
      <Route path="/applications"    element={<AppRoute><Applications /></AppRoute>} />
      <Route path="/knowledge"       element={<AppRoute><Knowledge /></AppRoute>} />
      <Route path="/linkedin-growth" element={<AppRoute><LinkedInGrowth /></AppRoute>} />
      <Route path="/user-voice"      element={<AppRoute><UserVoice /></AppRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}