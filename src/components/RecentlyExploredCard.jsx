import { memo, useState } from 'react'
import { Link } from 'react-router'
import useCountryMedia from '../hooks/useCountryMedia'

function RecentlyExploredCard({ country }) {
  const [imageFailed, setImageFailed] = useState(false)
  const [flagFailed, setFlagFailed] = useState(false)
  const { images: refreshedImages } = useCountryMedia(country.name, {
    enabled: imageFailed,
    forceRefresh: true,
    limit: 1,
  })
  const refreshedImage = refreshedImages[0]?.preview || refreshedImages[0]?.src || ''
  const imageSource = imageFailed ? refreshedImage : country.image
  const hasImage = Boolean(imageSource)
  const hasFlagUrl = Boolean(country.flagUrl) && !flagFailed
  const hasFlag = hasFlagUrl || Boolean(country.flagEmoji)

  return (
    <Link
      className="recently-explored-card"
      to={`/countries/${country.code}`}
      aria-label={`Open ${country.name}`}
    >
      <span className={`recently-explored-card__media${hasImage ? ' recently-explored-card__media--photo' : ''}`}>
        {hasImage ? (
          <img
            src={imageSource}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : hasFlag ? (
          <span className="recently-explored-card__flag" aria-hidden="true">
            {hasFlagUrl ? (
              <img
                src={country.flagUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setFlagFailed(true)}
              />
            ) : (
              <span>{country.flagEmoji}</span>
            )}
          </span>
        ) : (
          <span className="recently-explored-card__fallback" aria-hidden="true">
            {country.code.slice(0, 2)}
          </span>
        )}
      </span>

      <span className="recently-explored-card__body">
        <span className="recently-explored-card__meta">{country.region}</span>
        <strong>{country.name}</strong>
        <span className="recently-explored-card__route" aria-hidden="true">Open route →</span>
      </span>
    </Link>
  )
}

export default memo(RecentlyExploredCard)
