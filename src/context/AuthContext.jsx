import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ── localStorage helpers ───────────────────────────────────────────
const LS = {
  get:    (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(k),
}

export function AuthProvider({ children }) {
  // Persist session across page refresh
  const [sessionEmail, setSessionEmail] = useState(() => LS.get('a4f_session', null))
  const [updateCounter, setUpdateCounter] = useState(0)

  const isLoggedIn = !!sessionEmail

  // ── Helpers to read / write per-user data ──────────────────────
  const userKey   = (e) => `a4f_user_${e}`
  const prefsKey  = (e) => `a4f_prefs_${e}`

  function getStoredUser(email) { return LS.get(userKey(email), null) }
  function getStoredPrefs(email){ return LS.get(prefsKey(email), null) }

  // By using updateCounter here, any time updateCounter changes, this component re-renders
  // and re-evaluates currentUser and storedPrefs.
  const currentUser  = sessionEmail ? getStoredUser(sessionEmail)  : null
  const storedPrefs  = sessionEmail ? getStoredPrefs(sessionEmail) : null
  const prefsExist   = storedPrefs && (storedPrefs.domains?.length > 0 || storedPrefs.roles?.length > 0)

  // ── Register ───────────────────────────────────────────────────
  function register({ name, email, password }) {
    const users = LS.get('a4f_users', {})
    if (users[email.toLowerCase()]) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const newUser = { name, email: email.toLowerCase(), password, createdAt: new Date().toISOString() }
    users[email.toLowerCase()] = newUser
    LS.set('a4f_users', users)
    LS.set(userKey(email.toLowerCase()), newUser)
    LS.set('a4f_session', email.toLowerCase())
    setSessionEmail(email.toLowerCase())
    return { ok: true }
  }

  // ── Login ──────────────────────────────────────────────────────
  function login({ email, password }) {
    const users = LS.get('a4f_users', {})
    const stored = users[email.toLowerCase()]
    if (!stored) return { ok: false, error: 'No account found with this email.' }
    if (stored.password !== password) return { ok: false, error: 'Incorrect password.' }
    LS.set('a4f_session', email.toLowerCase())
    setSessionEmail(email.toLowerCase())
    return { ok: true }
  }

  // ── Logout ─────────────────────────────────────────────────────
  function logout() {
    LS.remove('a4f_session')
    setSessionEmail(null)
  }

  // ── Save preferences ───────────────────────────────────────────
  function savePreferences(prefs) {
    if (!sessionEmail) return
    LS.set(prefsKey(sessionEmail), prefs)
    setUpdateCounter(c => c + 1) // force re-render
  }

  // ── Update user profile ────────────────────────────────────────
  function updateProfile(data) {
    if (!sessionEmail) return
    const updated = { ...currentUser, ...data }
    LS.set(userKey(sessionEmail), updated)
    setUpdateCounter(c => c + 1) // force re-render
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      sessionEmail,
      currentUser,
      storedPrefs,
      prefsExist,
      register,
      login,
      logout,
      savePreferences,
      updateProfile,
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
