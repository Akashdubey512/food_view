import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

function BrandMark() {
  return (
    <div className="auth-brand">
      <span className="auth-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M7 3v7" />
          <path d="M12 3v6" />
          <path d="M17 3v8" />
          <path d="M4 11h16" />
          <path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" />
        </svg>
      </span>
      <div>
        <p className="auth-brand__name">Food View</p>
        <p className="auth-brand__meta">Fresh everyday</p>
      </div>
    </div>
  )
}

function AuthHeroPanel({ title, subtitle, metrics = [] }) {
  return (
    <div className="auth-hero">
      <div className="auth-hero__glow" aria-hidden="true" />
      <BrandMark />

      <div className="auth-hero__content">
        <span className="auth-hero__eyebrow">Premium food discovery</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="auth-hero__metrics" aria-label="Highlights">
        {metrics.map((metric) => (
          <div className="auth-hero__metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  )
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a18.8 18.8 0 0 1-4.4 5.1" />
      <path d="M6.4 6.4A18.7 18.7 0 0 0 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.6-.5" />
    </svg>
  )
}

function AuthField({ label, error, fieldId, icon: Icon, ...props }) {
  const inputId = useId()
  const errorId = `${inputId}-error`

  return (
    <label className="auth-field" htmlFor={inputId}>
      <span className="auth-field__label">{label}</span>
      <div className="auth-input-wrap">
        <Icon aria-hidden="true" className="auth-input-icon" />
        <input
          {...props}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={`auth-input ${error ? 'auth-input--error' : ''}`}
          id={inputId}
          name={fieldId}
        />
      </div>
      {error ? (
        <p className="auth-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </label>
  )
}

function PasswordField({ label, error, fieldId, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = useId()
  const errorId = `${inputId}-error`

  return (
    <label className="auth-field" htmlFor={inputId}>
      <span className="auth-field__label">{label}</span>
      <div className="auth-input-wrap">
        <LockIcon aria-hidden="true" className="auth-input-icon" />
        <input
          {...props}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={`auth-input auth-input--password ${error ? 'auth-input--error' : ''}`}
          id={inputId}
          name={fieldId}
          type={isVisible ? 'text' : 'password'}
        />
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="auth-eye-toggle"
          onClick={() => setIsVisible((value) => !value)}
          type="button"
        >
          {isVisible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p className="auth-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </label>
  )
}

function SubmitButton({ children, isLoading = false, isSuccess = false }) {
  return (
    <button className="auth-button" disabled={isLoading || isSuccess} type="submit">
      {isLoading ? 'Working...' : isSuccess ? 'Success' : children}
    </button>
  )
}

function AuthSwitch({ label, text, to }) {
  return (
    <p className="auth-switch">
      {text}{' '}
      <Link to={to}>{label}</Link>
    </p>
  )
}

function AuthFormCard({ title, subtitle, actionLabel, children, switchLabel, switchText, switchTo, onSubmit }) {
  return (
    <div className="auth-form-card">
      <div className="auth-heading">
        <p className="auth-heading__eyebrow">Quick access</p>
        <h1 id="auth-title">{title}</h1>
        <span>{subtitle}</span>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {children}
        <SubmitButton>{actionLabel}</SubmitButton>
      </form>

      <AuthSwitch label={switchLabel} text={switchText} to={switchTo} />
    </div>
  )
}

export { AuthField, AuthFormCard, AuthHeroPanel, BrandMark, LockIcon, MailIcon, PasswordField, SubmitButton, AuthSwitch, UserIcon }
