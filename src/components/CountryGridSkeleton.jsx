export default function CountryGridSkeleton({ count = 15, className = '' }) {
  const items = Array.from({ length: Math.max(1, count) }, (_, index) => index)

  return (
    <div className={`country-grid country-grid--skeleton ${className}`.trim()} aria-hidden="true">
      {items.map((item) => (
        <div key={item} className="country-card-skeleton">
          <div className="country-card-skeleton__media">
            <span className="country-card-skeleton__flag" />
          </div>
          <div className="country-card-skeleton__body">
            <span className="country-card-skeleton__line country-card-skeleton__line--title" />
            <span className="country-card-skeleton__line" />
          </div>
        </div>
      ))}
    </div>
  )
}
