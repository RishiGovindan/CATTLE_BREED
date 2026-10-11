/**
 * Frontend-only mock of an accounts/profile backend, backed by
 * localStorage (same pattern as storage.js / marketplaceStorage.js).
 *
 * The profile shape below matches the payload the real backend is
 * expected to accept/return, so swapping this out for actual API
 * calls (via services/api.js) later shouldn't require UI changes:
 *
 * {
 *   full_name: "",
 *   email: "",
 *   phone_number: "",
 *   location: "",
 *   user_type: "buyer",
 *   profile_image: "",
 * }
 */

const ACCOUNTS_KEY = 'breeddex:accounts'
const SESSION_KEY = 'breeddex:session'

function safeParseObject(raw) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function getAccounts() {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(ACCOUNTS_KEY)
  return raw ? safeParseObject(raw) : {}
}

function saveAccounts(accounts) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function getAccountByEmail(email) {
  if (!email) return null
  const accounts = getAccounts()
  return accounts[normalizeEmail(email)] ?? null
}

export function registerAccount({ email, password }) {
  const key = normalizeEmail(email)
  const accounts = getAccounts()

  if (accounts[key]) {
    throw new Error('An account with this email already exists. Try logging in instead.')
  }

  const account = { email: key, password, profile: null }
  accounts[key] = account
  saveAccounts(accounts)
  setSession(key)
  return account
}

export function authenticate({ email, password }) {
  const account = getAccountByEmail(email)

  if (!account || account.password !== password) {
    throw new Error('Incorrect email or password.')
  }

  setSession(account.email)
  return account
}

export function setSession(email) {
  window.localStorage.setItem(SESSION_KEY, email)
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export function getSessionEmail() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(SESSION_KEY)
}

export function saveProfile(email, profileData) {
  const key = normalizeEmail(email)
  const accounts = getAccounts()
  if (!accounts[key]) return null

  accounts[key] = { ...accounts[key], profile: profileData }
  saveAccounts(accounts)
  return accounts[key]
}

/**
 * Phase 8 — unified Buyer/Seller mode.
 *
 * `activeMode` is stored on the account itself (same pattern as `profile`),
 * so it survives refreshes and is scoped to whichever account is currently
 * logged in — switching accounts loads that account's own activeMode
 * instead of a single global value.
 */
export function getActiveMode(email) {
  return getAccountByEmail(email)?.activeMode ?? null
}

export function setActiveMode(email, mode) {
  const key = normalizeEmail(email)
  const accounts = getAccounts()
  if (!accounts[key]) return null

  accounts[key] = { ...accounts[key], activeMode: mode }
  saveAccounts(accounts)
  return accounts[key]
}

export function isProfileComplete(profile) {
  if (!profile) return false
  return Boolean(
    profile.full_name?.trim() &&
      profile.email?.trim() &&
      profile.phone_number?.trim() &&
      profile.location?.trim() &&
      (profile.user_type === 'buyer' || profile.user_type === 'seller'),
  )
}
