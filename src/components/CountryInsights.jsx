import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  INSIGHT_REQUEST_STATUS,
  fetchCountryClimate,
  fetchCountryConditions,
  selectCountryClimate,
  selectCountryClimateError,
  selectCountryClimateStatus,
  selectCountryConditions,
  selectCountryConditionsError,
  selectCountryConditionsStatus,
} from '../redux/countryInsightsSlice.js'

const WEATHER_CODES = [
  { codes: [0], label: 'Clear sky', glyph: '☀' },
  { codes: [1, 2], label: 'Partly cloudy', glyph: '◑' },
  { codes: [3], label: 'Overcast', glyph: '☁' },
  { codes: [45, 48], label: 'Fog', glyph: '≋' },
  { codes: [51, 53, 55, 56, 57], label: 'Drizzle', glyph: '⋰' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], label: 'Rain', glyph: '☂' },
  { codes: [71, 73, 75, 77, 85, 86], label: 'Snow', glyph: '❄' },
  { codes: [95, 96, 99], label: 'Thunderstorm', glyph: 'ϟ' },
]

const getWeatherMeta = (code) => (
  WEATHER_CODES.find((entry) => entry.codes.includes(Number(code)))
  ?? { label: 'Current conditions', glyph: '○' }
)

const roundMetric = (value, fallback = '—') => (
  Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback
)

const formatObservedTime = (value) => {
  const time = String(value ?? '').split('T')[1]
  return time ? time.slice(0, 5) : ''
}

const getTimeZoneOffsetMinutes = (date, timeZone) => {
  if (!timeZone) return null

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  const utcValue = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )

  return Math.round((utcValue - date.getTime()) / 60000)
}

const formatDifference = (date, localZone, destinationZone) => {
  const localOffset = getTimeZoneOffsetMinutes(date, localZone)
  const destinationOffset = getTimeZoneOffsetMinutes(date, destinationZone)
  if (!Number.isFinite(localOffset) || !Number.isFinite(destinationOffset)) return ''

  const difference = destinationOffset - localOffset
  if (difference === 0) return 'Same time as you'

  const absolute = Math.abs(difference)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60
  const amount = [hours ? `${hours}h` : '', minutes ? `${minutes}m` : ''].filter(Boolean).join(' ')

  return `${amount} ${difference > 0 ? 'ahead' : 'behind'}`
}

const formatUtcOffset = (date, timeZone) => {
  const offset = getTimeZoneOffsetMinutes(date, timeZone)
  if (!Number.isFinite(offset)) return 'UTC'

  const sign = offset >= 0 ? '+' : '−'
  const absolute = Math.abs(offset)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60

  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

const formatTime = (date, timeZone) => new Intl.DateTimeFormat(undefined, {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
}).format(date)

const formatDate = (date, timeZone) => new Intl.DateTimeFormat(undefined, {
  timeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
}).format(date)

const TIME_ZONE_DISPLAY_ALIASES = {
  'Europe/Kiev': 'Europe/Kyiv',
}

const formatTimeZoneLabel = (timeZone) => TIME_ZONE_DISPLAY_ALIASES[timeZone] || timeZone

const formatClimateTemperature = (value) => {
  if (!Number.isFinite(Number(value))) return '—'
  const rounded = Math.round(Number(value) * 10) / 10
  return `${rounded}°C`
}

function InsightCardSkeleton({ chart = false }) {
  return (
    <div className={`insight-card__skeleton ${chart ? 'insight-card__skeleton--chart' : ''}`} aria-hidden="true">
      <span className="insight-skeleton insight-skeleton--short" />
      <span className="insight-skeleton insight-skeleton--value" />
      <span className="insight-skeleton insight-skeleton--medium" />
      {chart ? <span className="insight-skeleton insight-skeleton--chart" /> : (
        <div className="insight-skeleton-row">
          <span className="insight-skeleton" />
          <span className="insight-skeleton" />
          <span className="insight-skeleton" />
        </div>
      )}
    </div>
  )
}

function InsightError({ title, message, onRetry }) {
  return (
    <div className="insight-card__error" role="alert">
      <span className="insight-card__error-icon" aria-hidden="true">!</span>
      <strong>{title}</strong>
      <p>{message}</p>
      <button type="button" className="insight-card__retry" onClick={onRetry}>↻ Try again</button>
    </div>
  )
}

function WeatherCard({ data, status, error, onRetry }) {
  const weather = data?.weather
  const location = data?.location
  const meta = getWeatherMeta(weather?.weatherCode)
  const isLoading = status === INSIGHT_REQUEST_STATUS.idle || status === INSIGHT_REQUEST_STATUS.loading
  const isFailed = status === INSIGHT_REQUEST_STATUS.failed

  return (
    <article className="insight-card insight-card--weather" aria-busy={isLoading}>
      <header className="insight-card__header">
        <span className="insight-card__icon" aria-hidden="true">☁</span>
        <div>
          <h3>Weather now</h3>
          <p>{location ? `${location.name}, ${location.country}` : 'Capital conditions'}</p>
        </div>
      </header>

      {isLoading && <InsightCardSkeleton />}
      {isFailed && (
        <InsightError
          title="Weather unavailable"
          message={error || 'Live conditions could not be loaded.'}
          onRetry={onRetry}
        />
      )}
      {status === INSIGHT_REQUEST_STATUS.succeeded && weather && (
        <div className="insight-weather">
          <div className="insight-weather__current">
            <span className="insight-weather__glyph" aria-hidden="true">{meta.glyph}</span>
            <strong>{roundMetric(weather.temperature)}{weather.units.temperature}</strong>
          </div>
          <p className="insight-weather__condition">{meta.label}</p>
          <dl className="insight-metrics">
            <div><dt>Feels like</dt><dd>{roundMetric(weather.apparentTemperature)}{weather.units.apparentTemperature}</dd></div>
            <div><dt>Wind</dt><dd>{roundMetric(weather.windSpeed)} {weather.units.windSpeed}</dd></div>
            <div><dt>Humidity</dt><dd>{roundMetric(weather.humidity)}{weather.units.humidity}</dd></div>
          </dl>
          {formatObservedTime(weather.observedAt) && (
            <p className="insight-card__note">Observed {formatObservedTime(weather.observedAt)} local time</p>
          )}
        </div>
      )}
    </article>
  )
}

function LocalTimeCard({ data, status, error, onRetry }) {
  const location = data?.location
  const [now, setNow] = useState(() => new Date())
  const isLoading = status === INSIGHT_REQUEST_STATUS.idle || status === INSIGHT_REQUEST_STATUS.loading
  const isFailed = status === INSIGHT_REQUEST_STATUS.failed

  useEffect(() => {
    if (status !== INSIGHT_REQUEST_STATUS.succeeded) return undefined

    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [status])

  const userTimeZone = useMemo(() => (
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  ), [])
  const destinationTimeZone = location?.timezone
  const difference = destinationTimeZone
    ? formatDifference(now, userTimeZone, destinationTimeZone)
    : ''
  const comparison = difference && difference !== 'Same time as you'
    ? `${location?.name || 'Destination'} is ${difference}`
    : difference

  return (
    <article className="insight-card insight-card--time" aria-busy={isLoading}>
      <header className="insight-card__header">
        <span className="insight-card__icon insight-card__icon--clock" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="7.5" />
            <path d="M12 7.5v4.8l3.2 1.9" />
          </svg>
        </span>
        <div>
          <h3>Local time</h3>
          <p>{location ? `${location.name}, ${location.country}` : 'Time-zone comparison'}</p>
        </div>
      </header>

      {isLoading && <InsightCardSkeleton />}
      {isFailed && (
        <InsightError
          title="Local time unavailable"
          message={error || 'The destination time zone could not be resolved.'}
          onRetry={onRetry}
        />
      )}
      {status === INSIGHT_REQUEST_STATUS.succeeded && destinationTimeZone && (
        <div className="insight-time">
          <div className="insight-time__comparison">
            <div className="insight-time__zone-card">
              <span className="insight-time__label">Your time</span>
              <strong>{formatTime(now, userTimeZone)}</strong>
              <small>{formatDate(now, userTimeZone)}</small>
              <span className="insight-time__zone">{formatTimeZoneLabel(userTimeZone)}</span>
              <span className="insight-time__offset">{formatUtcOffset(now, userTimeZone)}</span>
            </div>

            <span className="insight-time__arrow" aria-hidden="true">→</span>

            <div className="insight-time__zone-card insight-time__zone-card--destination">
              <span className="insight-time__label">{location.name}</span>
              <strong>{formatTime(now, destinationTimeZone)}</strong>
              <small>{formatDate(now, destinationTimeZone)}</small>
              <span className="insight-time__zone">{formatTimeZoneLabel(destinationTimeZone)}</span>
              <span className="insight-time__offset">{formatUtcOffset(now, destinationTimeZone)}</span>
            </div>
          </div>
          {comparison && <span className="insight-time__difference">{comparison}</span>}
        </div>
      )}
    </article>
  )
}

const buildChart = (months) => {
  const width = 420
  const height = 190
  const padding = { top: 18, right: 12, bottom: 34, left: 34 }
  const values = months.flatMap((month) => [month.high, month.low]).filter(Number.isFinite)
  const minValue = Math.floor((Math.min(...values) - 2) / 5) * 5
  const maxValue = Math.ceil((Math.max(...values) + 2) / 5) * 5
  const span = Math.max(maxValue - minValue, 5)
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const x = (index) => padding.left + (plotWidth * index) / Math.max(months.length - 1, 1)
  const y = (value) => padding.top + ((maxValue - value) / span) * plotHeight
  const toPoints = (key) => months
    .map((month, index) => Number.isFinite(month[key]) ? `${x(index)},${y(month[key])}` : null)
    .filter(Boolean)
    .join(' ')
  const ticks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3
    const value = maxValue - span * ratio
    return { value, y: padding.top + plotHeight * ratio }
  })

  return {
    width,
    height,
    padding,
    x,
    y,
    plotHeight,
    highPoints: toPoints('high'),
    lowPoints: toPoints('low'),
    ticks,
  }
}

function ClimateChart({ climate }) {
  const chart = buildChart(climate.months)
  const [activeIndex, setActiveIndex] = useState(null)
  const activeMonth = Number.isInteger(activeIndex) ? climate.months[activeIndex] : null
  const tooltipWidth = 140
  const tooltipHeight = 58
  const activeX = activeMonth ? chart.x(activeIndex) : 0
  const activeHighY = activeMonth && Number.isFinite(activeMonth.high) ? chart.y(activeMonth.high) : chart.padding.top
  const activeLowY = activeMonth && Number.isFinite(activeMonth.low) ? chart.y(activeMonth.low) : activeHighY
  const tooltipX = Math.min(
    Math.max(activeX - tooltipWidth / 2, chart.padding.left),
    chart.width - chart.padding.right - tooltipWidth,
  )
  const tooltipY = Math.max(Math.min(activeHighY, activeLowY) - tooltipHeight - 10, 4)
  const hitWidth = (chart.width - chart.padding.left - chart.padding.right) / climate.months.length

  return (
    <div className="climate-chart">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Monthly average high and low temperatures">
        {chart.ticks.map((tick) => (
          <g key={tick.y}>
            <line className="climate-chart__grid" x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={tick.y} y2={tick.y} />
            <text className="climate-chart__tick" x={chart.padding.left - 8} y={tick.y + 4} textAnchor="end">{Math.round(tick.value)}°</text>
          </g>
        ))}
        <polyline className="climate-chart__line climate-chart__line--high" points={chart.highPoints} />
        <polyline className="climate-chart__line climate-chart__line--low" points={chart.lowPoints} />

        {activeMonth && (
          <g className="climate-chart__active" aria-hidden="true">
            <line
              className="climate-chart__guide"
              x1={activeX}
              x2={activeX}
              y1={chart.padding.top}
              y2={chart.padding.top + chart.plotHeight}
            />
            {Number.isFinite(activeMonth.high) && (
              <circle className="climate-chart__point climate-chart__point--high" cx={activeX} cy={chart.y(activeMonth.high)} r="4.5" />
            )}
            {Number.isFinite(activeMonth.low) && (
              <circle className="climate-chart__point climate-chart__point--low" cx={activeX} cy={chart.y(activeMonth.low)} r="4.5" />
            )}
            <g className="climate-chart__tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
              <rect width={tooltipWidth} height={tooltipHeight} rx="10" />
              <text className="climate-chart__tooltip-title" x="10" y="16">{activeMonth.month}</text>
              <text className="climate-chart__tooltip-copy" x="10" y="33">
                Avg daytime high: {formatClimateTemperature(activeMonth.high)}
              </text>
              <text className="climate-chart__tooltip-copy" x="10" y="48">
                Avg overnight low: {formatClimateTemperature(activeMonth.low)}
              </text>
            </g>
          </g>
        )}

        {climate.months.map((month, index) => {
          const x = chart.x(index)
          const left = Math.max(chart.padding.left, x - hitWidth / 2)
          const right = Math.min(chart.width - chart.padding.right, x + hitWidth / 2)
          const ariaLabel = `${month.month}: average daytime high ${formatClimateTemperature(month.high)}, average overnight low ${formatClimateTemperature(month.low)}`

          return (
            <g key={month.month}>
              <rect
                className="climate-chart__hit"
                x={left}
                y={chart.padding.top}
                width={right - left}
                height={chart.plotHeight}
                tabIndex={0}
                aria-label={ariaLabel}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => setActiveIndex((current) => current === index ? null : index)}
              />
              <text className="climate-chart__month" x={x} y={chart.height - 10} textAnchor="middle">{month.month}</text>
            </g>
          )
        })}
      </svg>
      <div className="climate-chart__legend" aria-hidden="true">
        <span><i className="climate-chart__dot climate-chart__dot--high" />Average high</span>
        <span><i className="climate-chart__dot climate-chart__dot--low" />Average low</span>
      </div>
    </div>
  )
}

function ClimateCard({ climate, status, error, onRetry, cardRef }) {
  const isLoading = status === INSIGHT_REQUEST_STATUS.idle || status === INSIGHT_REQUEST_STATUS.loading
  const isFailed = status === INSIGHT_REQUEST_STATUS.failed

  return (
    <article ref={cardRef} className="insight-card insight-card--climate" aria-busy={isLoading}>
      <header className="insight-card__header">
        <span className="insight-card__icon" aria-hidden="true">▥</span>
        <div>
          <h3>Climate through the year</h3>
          <p>{climate ? `5-year monthly averages · ${climate.location.name}` : 'Average monthly temperatures'}</p>
        </div>
      </header>

      {isLoading && <InsightCardSkeleton chart />}
      {isFailed && (
        <InsightError
          title="Climate history unavailable"
          message={error || 'Historical temperature data could not be loaded.'}
          onRetry={onRetry}
        />
      )}
      {status === INSIGHT_REQUEST_STATUS.succeeded && climate && (
        <>
          <ClimateChart climate={climate} />
          <p className="insight-card__note">Daily high/low averages · {climate.period.startYear}–{climate.period.endYear}</p>
        </>
      )}
    </article>
  )
}

export default function CountryInsights({ country }) {
  const dispatch = useDispatch()
  const climateCardRef = useRef(null)
  const code = country.code
  const conditions = useSelector((state) => selectCountryConditions(state, code))
  const conditionsStatus = useSelector((state) => selectCountryConditionsStatus(state, code))
  const conditionsError = useSelector((state) => selectCountryConditionsError(state, code))
  const climate = useSelector((state) => selectCountryClimate(state, code))
  const climateStatus = useSelector((state) => selectCountryClimateStatus(state, code))
  const climateError = useSelector((state) => selectCountryClimateError(state, code))

  useEffect(() => {
    dispatch(fetchCountryConditions(country))
  }, [country, dispatch])

  useEffect(() => {
    const element = climateCardRef.current
    if (!element) return undefined

    const requestClimate = () => {
      dispatch(fetchCountryClimate({
        country,
        location: conditions?.location || null,
      }))
    }

    if (typeof IntersectionObserver === 'undefined') {
      requestClimate()
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      requestClimate()
      observer.disconnect()
    }, { rootMargin: '320px 0px' })

    observer.observe(element)
    return () => observer.disconnect()
  }, [conditions?.location, country, dispatch])

  const retryConditions = () => dispatch(fetchCountryConditions({ ...country, force: true }))
  const retryClimate = () => dispatch(fetchCountryClimate({
    country,
    location: conditions?.location || climate?.location || null,
    force: true,
  }))

  return (
    <section className="shell country-insights" aria-labelledby="country-insights-title">
      <div className="country-insights__heading">
        <div>
          <p className="eyebrow">Country insights</p>
          <h2 id="country-insights-title">Know before you go</h2>
          <p className="lead">Live weather, local time and seasonal climate for {country.capital !== '—' ? country.capital : country.name}.</p>
        </div>
        <a className="country-insights__source" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo ↗</a>
      </div>

      <div className="country-insights__grid">
        <WeatherCard
          data={conditions}
          status={conditionsStatus}
          error={conditionsError}
          onRetry={retryConditions}
        />
        <LocalTimeCard
          data={conditions}
          status={conditionsStatus}
          error={conditionsError}
          onRetry={retryConditions}
        />
        <ClimateCard
          cardRef={climateCardRef}
          climate={climate}
          status={climateStatus}
          error={climateError}
          onRetry={retryClimate}
        />
      </div>
    </section>
  )
}
