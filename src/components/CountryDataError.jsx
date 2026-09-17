export default function CountryDataError({
  title = 'We couldn’t load the countries.',
  message = 'Check your connection and try the route again.',
  actionLabel = 'Try again',
  onRetry,
  compact = false,
}) {
  return (
    <section className={compact ? 'country-data-error country-data-error--compact' : 'country-data-error'} role="alert">
      <div className="country-data-error__visual" aria-hidden="true">
        <svg viewBox="0 0 96 96" focusable="false">
          <circle cx="48" cy="48" r="30" />
          <path d="M18 48h60M48 18c8 8 12 18 12 30S56 70 48 78M48 18c-8 8-12 18-12 30s4 22 12 30" />
          <path className="country-data-error__alert" d="M69 59 82 82H56l13-23Zm0 8v7m0 4h.01" />
        </svg>
      </div>
      <div className="country-data-error__copy">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button className="primary-button country-data-error__retry" type="button" onClick={onRetry}>
        ↻ {actionLabel}
      </button>
    </section>
  )
}
