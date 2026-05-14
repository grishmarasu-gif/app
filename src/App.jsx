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

import Knowledge       from './pages/Knowledge'
import LinkedInGrowth  from './pages/LinkedInGrowth'

// Requires login — redirects to /login otherwise
function AuthRoute({ children }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

// Requires login AND preferences — redirects to /onboarding if prefs missing
function AppRoute({ children }) {
  const { isLoggedIn, prefsExist } = useAuth()
  if (!isLoggedIn)  return <Navigate to="/login" replace />
  if (!prefsExist)  return <Navigate to="/onboarding" replace />
  return children
}

// Redirect logged-in users away from login/register
function GuestRoute({ children }) {
  const { isLoggedIn, prefsExist } = useAuth()
  if (isLoggedIn && prefsExist)  return <Navigate to="/" replace />
  if (isLoggedIn && !prefsExist) return <Navigate to="/onboarding" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Auth — needs login but NOT necessarily prefs yet */}
      <Route path="/onboarding" element={<AuthRoute><OnboardingPage /></AuthRoute>} />

      {/* Protected — needs both login + prefs */}
      <Route path="/dashboard"       element={<AppRoute><Dashboard /></AppRoute>} />
      <Route path="/jobs"            element={<AppRoute><DailyJobs /></AppRoute>} />
      <Route path="/jobs/:id"        element={<AppRoute><JobDetail /></AppRoute>} />
      <Route path="/resume"          element={<AppRoute><ResumeBuilder /></AppRoute>} />
      <Route path="/applications"    element={<AppRoute><Applications /></AppRoute>} />
      <Route path="/knowledge"       element={<AppRoute><Knowledge /></AppRoute>} />
      <Route path="/linkedin-growth" element={<AppRoute><LinkedInGrowth /></AppRoute>} />

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