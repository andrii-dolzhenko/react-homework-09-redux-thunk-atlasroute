import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router'
import CountryGallery from '../components/CountryGallery'
import RouteMap from '../components/RouteMap'
import AreaValue from '../components/AreaValue'
import SaveCountryButton from '../components/SaveCountryButton'
import CountryDataError from '../components/CountryDataError'
import CountryDataLoader from '../components/CountryDataLoader'
import CountryInsights from '../components/CountryInsights'
import useCountryMedia from '../hooks/useCountryMedia'
import { formatNumber, formatPopulation } from '../data/featured'
import { addRecentlyViewed } from '../redux/recentlyViewedSlice'
import {
  COUNTRY_REQUEST_STATUS,
  fetchCountryByCode,
  selectCountryByCode,
  selectCountryDetailError,
  selectCountryDetailStatus,
} from '../redux/countriesSlice.js'

export default function CountryDetailsPage() {
  const dispatch = useDispatch()
  const { code } = useParams()
  const country = useSelector((state) => selectCountryByCode(state, code))
  const status = useSelector((state) => selectCountryDetailStatus(state, code))
  const error = useSelector((state) => selectCountryDetailError(state, code))
  const { images: mediaImages, loading: mediaLoading, error: mediaError } = useCountryMedia(country?.name)

  useEffect(() => {
    if (!country && status === COUNTRY_REQUEST_STATUS.idle) {
      dispatch(fetchCountryByCode({ code }))
    }
  }, [code, country, dispatch, status])

  const dynamicHero = country?.heroImage || mediaImages[0]?.src || null
  const recentCardImage = country?.heroImage || mediaImages[0]?.preview || mediaImages[0]?.src || ''

  useEffect(() => {
    if (!country) return

    dispatch(addRecentlyViewed({
      code: country.code,
      name: country.name,
      region: country.region,
      flagUrl: country.flagUrl,
      flagEmoji: country.flagEmoji,
      image: recentCardImage,
    }))
  }, [
    dispatch,
    country,
    recentCardImage,
  ])

  if (!country && (status === COUNTRY_REQUEST_STATUS.idle || status === COUNTRY_REQUEST_STATUS.loading)) {
    return (
      <div className="shell country-detail-state">
        <CountryDataLoader
          compact
          title="Opening this route…"
          label="Loading country details"
        />
      </div>
    )
  }

  if (!country && status === COUNTRY_REQUEST_STATUS.failed) {
    const notFound = error === 'Country not found'

    return (
      <div className="shell country-detail-state">
        <CountryDataError
          compact
          title={notFound ? 'We couldn’t find this destination.' : 'This route couldn’t be loaded.'}
          message={notFound
            ? 'The country code in this URL does not match an available destination.'
            : 'We couldn’t retrieve the country data. Your route is still here — try the request again.'}
          onRetry={() => dispatch(fetchCountryByCode({ code, force: true }))}
        />
      </div>
    )
  }

  if (!country) return null

  const currency = country.currencies
    .map(({ name, code: currencyCode }) => `${name}${currencyCode ? ` (${currencyCode})` : ''}`)
    .join(', ') || '—'
  const languages = country.languages.map(({ name }) => name).join(', ') || '—'
  const timezone = country.timezones.join(', ') || '—'

  const facts = [
    ['Capital', country.capital],
    ['Region', country.region],
    ['Subregion', country.subregion],
    ['Population', formatNumber(country.population)],
    ['Area', <AreaValue areaKm2={country.area} />],
    ['Currency', currency],
    ['Languages', languages],
    ['Timezone', timezone],
  ]

  return (
    <article className="details-page">
      <section className={`details-hero shell ${dynamicHero ? '' : 'details-hero--flag'}`}>
        {dynamicHero ? (
          <img
            src={dynamicHero}
            alt=""
            className="details-hero__image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div className="details-hero__flag-visual">
            {country.flagUrl ? <img src={country.flagUrl} alt="" /> : <span>{country.flagEmoji}</span>}
          </div>
        )}
        <div className="details-hero__overlay" />

        <Link className="back-button" to="/countries">← Back to countries</Link>

        <SaveCountryButton
          code={country.code}
          countryName={country.name}
          variant="hero"
        />

        <div className="details-hero__copy">
          <p className="eyebrow">{country.region} / {country.subregion}</p>
          <h1>{country.name}</h1>
          <p>{country.tagline}</p>
        </div>

        <div className="details-kpis">
          <div><span>Capital</span><strong>{country.capital}</strong></div>
          <div><span>Population</span><strong>{formatPopulation(country.population)}</strong></div>
          <div><span>Area</span><strong><AreaValue areaKm2={country.area} /></strong></div>
          <div><span>Code</span><strong>{code?.toUpperCase()}</strong></div>
        </div>
      </section>

      <section className="shell details-content">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>About {country.name}</h2>
          <p className="lead">
            Country facts are loaded through Redux Toolkit async state and reused from the session cache when this route is opened again.
          </p>

          <dl className="facts-list">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <RouteMap country={country} />
      </section>

      <CountryInsights country={country} />

      <CountryGallery
        country={country}
        images={mediaImages}
        loading={mediaLoading}
        error={mediaError}
      />

      <section className="shell border-section">
        <p className="eyebrow">Border countries</p>
        <h2>Continue exploring by route</h2>
        {country.borders.length ? (
          <div className="border-links">
            {country.borders.map((borderCode) => (
              <Link key={borderCode} to={`/countries/${borderCode}`}>{borderCode} →</Link>
            ))}
          </div>
        ) : (
          <p className="muted">{country.name} has no land borders.</p>
        )}
      </section>
    </article>
  )
}
