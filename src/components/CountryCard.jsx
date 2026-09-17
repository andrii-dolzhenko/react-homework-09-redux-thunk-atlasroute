import { memo, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import SaveCountryButton from './SaveCountryButton'
import useCountryMedia from '../hooks/useCountryMedia'

function CountryCard({ country, imagePriority = false }) {
  const cardRef = useRef(null)
  const [mediaEnabled, setMediaEnabled] = useState(Boolean(country.heroImage))

  useEffect(() => {
    if (country.heroImage || !cardRef.current || mediaEnabled) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMediaEnabled(true)
          observer.disconnect()
        }
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [country.heroImage, mediaEnabled])

  const { images, loading } = useCountryMedia(country.name, {
    enabled: mediaEnabled && !country.heroImage,
    limit: 1,
  })

  const backgroundImage = country.heroImage || images[0]?.preview || images[0]?.src || null


  return (
    <article ref={cardRef} className="country-card">
      <Link
        className="country-card__link"
        to={`/countries/${country.code}`}
        aria-label={`Explore ${country.name}`}
      >
        <div className={`country-card__media country-card__media--photo ${backgroundImage ? 'country-card__media--ready' : ''}`}>
          {backgroundImage && (
            <img
              className="country-card__background"
              src={backgroundImage}
              alt=""
              loading={imagePriority ? 'eager' : 'lazy'}
              fetchPriority={imagePriority ? 'high' : 'low'}
              decoding="async"
            />
          )}

          {!backgroundImage && loading && (
            <div className="country-card__media-shimmer" aria-hidden="true" />
          )}

          <div className="flag-visual flag-visual--overlay">
            {country.flagUrl ? (
              <img src={country.flagUrl} alt={`${country.name} flag`} loading="lazy" />
            ) : (
              <span>{country.flagEmoji}</span>
            )}
          </div>

          <span className="country-code">{country.code}</span>
        </div>
        <div className="country-card__body">
          <div>
            <strong>{country.name}</strong>
            <span>{country.region} · {country.capital}</span>
          </div>
          <span className="card-arrow" aria-hidden="true">↗</span>
        </div>
      </Link>

      <SaveCountryButton
        code={country.code}
        countryName={country.name}
        variant="card"
      />
    </article>
  )
}

export default memo(CountryCard)
