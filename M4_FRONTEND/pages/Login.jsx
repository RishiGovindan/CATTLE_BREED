import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isProfileComplete } from '../utils/authStorage'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setErrors({})
    setFormError('')
  }

  function validate() {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim(),
      )
    ) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Use at least 6 characters.'
    }

    if (
      mode === 'register' &&
      form.password !== form.confirmPassword
    ) {
      nextErrors.confirmPassword =
        'Passwords do not match.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setFormError('')

    if (!validate()) return

    try {
      setLoading(true)

      const action =
        mode === 'login'
          ? login
          : register

      const account = await action({
        email: form.email.trim(),
        password: form.password,
      })

      if (isProfileComplete(account.profile)) {
        navigate(
          from?.pathname ?? '/marketplace',
          { replace: true },
        )
      } else {
        navigate('/complete-profile', {
          replace: true,
          state: { from },
        })
      }
    } catch (error) {
      setFormError(
        error.message ||
          'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-inner">
        <span className="eyebrow">
          TradeHub Access
        </span>

        <h1 className="breed-explorer-title">
          {mode === 'login'
            ? 'Log In'
            : 'Create Your Account'}
        </h1>

        <p className="breed-explorer-subtitle">
          {mode === 'login'
            ? 'Log in to browse and list livestock on the BreedDex TradeHub.'
            : 'Register with an email and password to start buying or selling livestock.'}
        </p>

        <div
          className="auth-tabs"
          role="tablist"
          aria-label="Login or register"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${
              mode === 'login'
                ? ' is-active'
                : ''
            }`}
            onClick={() => switchMode('login')}
          >
            Log In
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={
              mode === 'register'
            }
            className={`auth-tab${
              mode === 'register'
                ? ' is-active'
                : ''
            }`}
            onClick={() =>
              switchMode('register')
            }
          >
            Register
          </button>
        </div>

        <form
          className="create-listing-form auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError && (
            <p className="auth-form-error">
              {formError}
            </p>
          )}

          <div className="create-listing-field">
            <label htmlFor="auth-email">
              Email Address
            </label>

            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                update(
                  'email',
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              disabled={loading}
            />

            {errors.email && (
              <span className="create-listing-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="create-listing-field">
            <label htmlFor="auth-password">
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
              value={form.password}
              onChange={(event) =>
                update(
                  'password',
                  event.target.value,
                )
              }
              placeholder="At least 6 characters"
              disabled={loading}
            />

            {errors.password && (
              <span className="create-listing-error">
                {errors.password}
              </span>
            )}
          </div>

          {mode === 'register' && (
            <div className="create-listing-field">
              <label htmlFor="auth-confirm-password">
                Confirm Password
              </label>

              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) =>
                  update(
                    'confirmPassword',
                    event.target.value,
                  )
                }
                placeholder="Re-enter your password"
                disabled={loading}
              />

              {errors.confirmPassword && (
                <span className="create-listing-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary create-listing-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch-note">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() =>
                  switchMode('register')
                }
                disabled={loading}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
                disabled={loading}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  )
}