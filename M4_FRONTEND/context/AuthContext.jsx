import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authStorage from '../utils/authStorage'
import { authApi } from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'breeddex:access_token'
const USER_ID_KEY = 'breeddex:user_id'

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => localStorage.getItem(TOKEN_KEY) ? authStorage.getSessionEmail() : null)
  const [userId, setUserId] = useState(() => Number(localStorage.getItem(USER_ID_KEY)) || null)
  const [profile, setProfile] = useState(null)
  const [activeMode, setActiveMode] = useState(null)
  const [ready, setReady] = useState(() => !localStorage.getItem(TOKEN_KEY))

  const applyUser = useCallback((user) => {
    setEmail(user.email); setUserId(user.id); setProfile(user.profile ?? null); setActiveMode(user.active_mode ?? user.profile?.user_type ?? 'buyer')
    authStorage.setSession(user.email)
    localStorage.setItem(USER_ID_KEY, String(user.id))
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    authApi.me().then((data) => applyUser(data)).catch(() => {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_ID_KEY); authStorage.clearSession()
      setEmail(null); setUserId(null); setProfile(null); setActiveMode(null)
    }).finally(() => setReady(true))
  }, [applyUser])

  const register = useCallback(async ({ email, password }) => {
    const data = await authApi.register({ email, password, active_mode: 'buyer' })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    applyUser({ id: data.id, email: data.email, active_mode: data.active_mode, profile: null })
    return { id: data.id, email: data.email, profile: null, activeMode: data.active_mode }
  }, [applyUser])

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    applyUser(data.user)
    return { id: data.user.id, email: data.user.email, profile: data.user.profile ?? null, activeMode: data.user.active_mode }
  }, [applyUser])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_ID_KEY); authStorage.clearSession()
    setEmail(null); setUserId(null); setProfile(null); setActiveMode(null)
  }, [])

  const saveProfile = useCallback(async (profileData) => {
    const saved = await authApi.saveProfile(profileData)
    setProfile(saved); setActiveMode(saved.user_type)
    return saved
  }, [])

  const switchMode = useCallback(async (mode) => {
    if (!['buyer','seller'].includes(mode)) return
    const data = await authApi.switchMode(mode)
    setActiveMode(data.active_mode)
  }, [])

  const value = useMemo(() => ({
    email, userId, profile, ready,
    isAuthenticated: Boolean(email && localStorage.getItem(TOKEN_KEY)),
    isProfileComplete: Boolean(profile?.full_name?.trim() && profile?.phone_number?.trim() && profile?.location?.trim() && ['buyer','seller'].includes(profile?.user_type)),
    activeMode, switchMode, login, register, logout, saveProfile,
  }), [email,userId,profile,ready,activeMode,switchMode,login,register,logout,saveProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
