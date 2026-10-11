import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import { useAuth } from '../context/AuthContext'

const USER_TYPES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
]

const PHONE_PATTERN = /^[0-9+\-\s]{7,15}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CompleteProfile() {
  const { email, profile, isProfileComplete, saveProfile, activeMode, switchMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/marketplace'

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    email: profile?.email ?? email ?? '',
    phone_number: profile?.phone_number ?? '',
    location: profile?.location ?? '',
    user_type: profile?.user_type ?? 'buyer',
    profile_image: profile?.profile_image ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = isProfileComplete

  // Account Details is editing an *existing* account, so its User Type
  // control must read from the same single source of truth as the navbar
  // (`activeMode`) instead of a separate local selection — otherwise the
  // two can show different values at the same time.
  useEffect(() => {
    if (isEditing && activeMode) {
      setForm((current) => (current.user_type === activeMode ? current : { ...current, user_type: activeMode }))
    }
  }, [isEditing, activeMode])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function selectUserType(type) {
    if (isEditing) {
      // This control IS the mode switch here — update the shared
      // activeMode immediately so the navbar and dashboards stay in sync.
      switchMode(type.value)
    }
    update('user_type', type.value)
  }

  function handleImageSelected(file) {
    const reader = new FileReader()
    reader.onload = () => update('profile_image', reader.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const nextErrors = {}
    if (!form.full_name.trim()) nextErrors.full_name = 'Full name is required.'
    if (!form.email.trim()) nextErrors.email = 'Email address is required.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!form.phone_number.trim()) nextErrors.phone_number = 'Phone number is required.'
    else if (!PHONE_PATTERN.test(form.phone_number.trim())) {
      nextErrors.phone_number = 'Enter a valid phone number.'
    }
    if (!form.location.trim()) nextErrors.location = 'Location is required.'
    if (form.user_type !== 'buyer' && form.user_type !== 'seller') {
      nextErrors.user_type = 'Select a user type.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setSaving(true)
    try {
      await saveProfile(form)
      if (isEditing) setSaved(true)
      else navigate(from, { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="account-page">
      <div className="account-inner">
        <span className="eyebrow">{isEditing ? 'Account' : 'TradeHub Access'}</span>
        <h1 className="breed-explorer-title">{isEditing ? 'Account Details' : 'Complete Your Profile'}</h1>
        <p className="breed-explorer-subtitle">
          {isEditing
            ? 'Update your account details. Buyers and sellers use this to know who they\u2019re dealing with.'
            : 'A few details before you enter TradeHub, so buyers and sellers know who they\u2019re dealing with.'}
        </p>

        <form className="create-listing-form account-form" onSubmit={handleSubmit} noValidate>
          <div className="create-listing-field profile-avatar-field">
            <label>Profile Picture (optional)</label>
            <ImageUploader
              onFileSelected={handleImageSelected}
              previewUrl={form.profile_image || null}
              onClear={() => update('profile_image', '')}
            />
          </div>

          <div className="create-listing-field">
            <label htmlFor="profile-full-name">Full Name</label>
            <input
              id="profile-full-name"
              type="text"
              value={form.full_name}
              onChange={(event) => update('full_name', event.target.value)}
              placeholder="e.g. Anita Sharma"
            />
            {errors.full_name && <span className="create-listing-error">{errors.full_name}</span>}
          </div>

          <div className="create-listing-row">
            <div className="create-listing-field">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <span className="create-listing-error">{errors.email}</span>}
            </div>

            <div className="create-listing-field">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={form.phone_number}
                onChange={(event) => update('phone_number', event.target.value)}
                placeholder="e.g. 98765 43210"
              />
              {errors.phone_number && <span className="create-listing-error">{errors.phone_number}</span>}
            </div>
          </div>

          <div className="create-listing-field">
            <label htmlFor="profile-location">Location</label>
            <input
              id="profile-location"
              type="text"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="e.g. Junagadh, Gujarat"
            />
            {errors.location && <span className="create-listing-error">{errors.location}</span>}
          </div>

          <div className="create-listing-field">
            <label>User Type</label>
            <div className="filter-pill-row user-type-toggle">
              {USER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`filter-pill${form.user_type === type.value ? ' is-active' : ''}`}
                  onClick={() => selectUserType(type)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {errors.user_type && <span className="create-listing-error">{errors.user_type}</span>}
          </div>

          {submitError && <p className="auth-form-error" role="alert">{submitError}</p>}
          {saved && <p className="auth-switch-note">Account details saved.</p>}

          <button type="submit" className="btn btn-primary create-listing-submit" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save and Continue to TradeHub'}
          </button>
        </form>
      </div>
    </section>
  )
}
