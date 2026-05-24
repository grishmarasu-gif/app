import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';

async function safeJson(res) {
  const text = await res.text()
  try { return JSON.parse(text) } 
  catch { return { message: 'Server returned an invalid response (HTML)' } }
}

// ── localStorage helpers ───────────────────────────────────────────
const LS = {
  get:    (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(k),
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [currentUser, setCurrentUser] = useState(null)
  const [storedPrefs, setStoredPrefs] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const isLoggedIn = !!token
  const pricingCompleted = currentUser?.pricingCompleted === true
  const onboardingCompleted = currentUser?.onboardingCompleted === true
  const prefsExist = storedPrefs && (storedPrefs.domains?.length > 0 || storedPrefs.roles?.length > 0)

  // Fetch user profile if token exists
  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      setStoredPrefs(null)
      setIsLoading(false)
      return
    }

    async function fetchMe() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await safeJson(res)
          setCurrentUser(data.user)
          setStoredPrefs(data.user.preferences || null)
        } else {
          // Token might be invalid
          logout()
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMe()
  }, [token])

  // ── Register ───────────────────────────────────────────────────
  async function register({ name, email, password }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await safeJson(res)
      if (!res.ok) return { ok: false, error: data.message || 'Registration failed.' }
      
      // Auth Flow Fix: Do not auto-login on signup
      return { ok: true }
    } catch (error) {
      console.error("Register error:", error);
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server. Ensure backend is running and CORS is configured.' : `Network error: ${error.message}` }
    }
  }

  // ── Login ──────────────────────────────────────────────────────
  async function login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await safeJson(res)
      if (!res.ok) return { ok: false, error: data.message || 'Invalid credentials.' }
      
      localStorage.setItem('authToken', data.token)
      setToken(data.token)
      setCurrentUser(data.user)
      setStoredPrefs(data.user.preferences || null)
      return { ok: true }
    } catch (error) {
      console.error("Login error:", error);
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server. Ensure backend is running and CORS is configured.' : `Network error: ${error.message}` }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────
  async function logout() {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {}); // ignore errors on logout
      }
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setToken(null);
      setCurrentUser(null);
      setStoredPrefs(null);
    }
  }

  // ── Save preferences ───────────────────────────────────────────
  async function savePreferences(prefs) {
    if (!token) return { ok: false, error: 'Not authenticated' }
    try {
      const res = await fetch(`${API_BASE}/users/preferences`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prefs)
      })
      const data = await safeJson(res)
      if (!res.ok) return { ok: false, error: data.message || 'Failed to save preferences' }
      
      setStoredPrefs(data.preferences || prefs)
      if (data.user) {
        setCurrentUser({ ...data.user, onboardingCompleted: true })
      } else {
        setCurrentUser(prev => prev ? { ...prev, onboardingCompleted: true } : prev)
      }
      return { ok: true }
    } catch (error) {
      console.error("Save preferences error:", error);
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server. Ensure backend is running and CORS is configured.' : `Network error: ${error.message}` }
    }
  }

  // ── Upload & parse resume ──────────────────────────────────────────────
  async function uploadResume(file) {
    if (!token) return { ok: false, error: 'Not authenticated' }
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch(`${API_BASE}/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await safeJson(res)
      if (!res.ok) return { ok: false, error: data.message || 'Upload failed.' }
      return { ok: true, parsed: data.resume?.parsed || {} }
    } catch (error) {
      console.error('Upload resume error:', error)
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server.' : `Network error: ${error.message}` }
    }
  }

  // ── Update user profile ────────────────────────────────────────
  async function updateProfile(data) {
    if (!token) return { ok: false, error: 'Not authenticated' }
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      const resData = await safeJson(res)
      if (!res.ok) return { ok: false, error: resData.message || 'Failed to update profile' }
      
      setCurrentUser(resData.user)
      return { ok: true }
    } catch (error) {
      console.error("Update profile error:", error);
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server. Ensure backend is running and CORS is configured.' : `Network error: ${error.message}` }
    }
  }

  // ── Complete Pricing ───────────────────────────────────────────
  async function completePricing() {
    if (!token) return { ok: false, error: 'Not authenticated' }
    try {
      const res = await fetch(`${API_BASE}/users/complete-pricing`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) {
        const text = await res.text()
        console.error("API Error Text:", text)
        try {
          const data = JSON.parse(text)
          return { ok: false, error: data.message || 'Failed to complete pricing' }
        } catch {
          return { ok: false, error: 'Server returned an invalid response (HTML)' }
        }
      }
      
      const data = await safeJson(res)
      setCurrentUser(data.user)
      return { ok: true }
    } catch (error) {
      console.error("Complete pricing error:", error);
      return { ok: false, error: error.message === 'Failed to fetch' ? 'Cannot connect to server.' : `Network error: ${error.message}` }
    }
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      token,
      currentUser,
      pricingCompleted,
      onboardingCompleted,
      storedPrefs,
      prefsExist,
      isLoading,
      register,
      login,
      logout,
      savePreferences,
      uploadResume,
      updateProfile,
      completePricing,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
