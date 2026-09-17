const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive'

const MONTH_NAMES = Object.freeze([
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
])

const isFiniteCoordinate = (value) => Number.isFinite(Number(value))

const requestJson = async (url, { signal } = {}) => {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Country insights unavailable (${response.status})`)
  }

  const payload = await response.json()
  if (payload?.error) {
    throw new Error(payload.reason || 'Country insights unavailable')
  }

  return payload
}

const fallbackLocation = ({ name, latlng }) => {
  const [latitude, longitude] = Array.isArray(latlng) ? latlng : []

  if (!isFiniteCoordinate(latitude) || !isFiniteCoordinate(longitude)) {
    throw new Error('Location coordinates unavailable')
  }

  return {
    name,
    country: name,
    latitude: Number(latitude),
    longitude: Number(longitude),
    timezone: null,
    source: 'country-centroid',
  }
}

export const resolveCountryLocation = async (country, { signal } = {}) => {
  const { alpha2Code, capital, name } = country

  if (!capital || capital === '—') {
    return fallbackLocation(country)
  }

  const params = new URLSearchParams({
    name: capital,
    count: '1',
    language: 'en',
    format: 'json',
  })

  if (alpha2Code) params.set('countryCode', alpha2Code)

  try {
    const payload = await requestJson(`${GEOCODING_API}?${params}`, { signal })
    const match = payload?.results?.[0]

    if (!match || !isFiniteCoordinate(match.latitude) || !isFiniteCoordinate(match.longitude)) {
      return fallbackLocation(country)
    }

    return {
      name: match.name || capital,
      country: match.country || name,
      latitude: Number(match.latitude),
      longitude: Number(match.longitude),
      timezone: match.timezone || null,
      source: 'capital',
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return fallbackLocation(country)
  }
}

export const fetchCurrentConditions = async (country, { signal } = {}) => {
  const location = await resolveCountryLocation(country, { signal })
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'is_day',
    ].join(','),
    timezone: 'auto',
    forecast_days: '1',
  })

  const payload = await requestJson(`${FORECAST_API}?${params}`, { signal })

  if (!payload?.current) {
    throw new Error('Current weather unavailable')
  }

  return {
    location: {
      ...location,
      timezone: payload.timezone || location.timezone,
      timezoneAbbreviation: payload.timezone_abbreviation || '',
    },
    weather: {
      temperature: payload.current.temperature_2m,
      apparentTemperature: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      weatherCode: payload.current.weather_code,
      windSpeed: payload.current.wind_speed_10m,
      isDay: payload.current.is_day,
      observedAt: payload.current.time || '',
      units: {
        temperature: payload.current_units?.temperature_2m || '°C',
        apparentTemperature: payload.current_units?.apparent_temperature || '°C',
        humidity: payload.current_units?.relative_humidity_2m || '%',
        windSpeed: payload.current_units?.wind_speed_10m || 'km/h',
      },
    },
  }
}

const getFiveFullYears = (referenceDate = new Date()) => {
  const endYear = referenceDate.getUTCFullYear() - 1
  const startYear = endYear - 4

  return {
    startYear,
    endYear,
    startDate: `${startYear}-01-01`,
    endDate: `${endYear}-12-31`,
  }
}

const average = (values) => {
  const finiteValues = values.filter(Number.isFinite)
  if (!finiteValues.length) return null
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
}

export const aggregateMonthlyClimate = (daily = {}) => {
  const times = Array.isArray(daily.time) ? daily.time : []
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : []
  const lows = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : []
  const buckets = MONTH_NAMES.map(() => ({ highs: [], lows: [] }))

  times.forEach((date, index) => {
    const monthIndex = Number(String(date).slice(5, 7)) - 1
    if (monthIndex < 0 || monthIndex > 11) return

    const high = Number(highs[index])
    const low = Number(lows[index])
    if (Number.isFinite(high)) buckets[monthIndex].highs.push(high)
    if (Number.isFinite(low)) buckets[monthIndex].lows.push(low)
  })

  return buckets.map((bucket, index) => ({
    month: MONTH_NAMES[index],
    high: average(bucket.highs),
    low: average(bucket.lows),
  }))
}

export const fetchClimateAverages = async (country, { signal, location: knownLocation } = {}) => {
  const location = knownLocation || await resolveCountryLocation(country, { signal })
  const period = getFiveFullYears()
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    start_date: period.startDate,
    end_date: period.endDate,
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  })

  const payload = await requestJson(`${ARCHIVE_API}?${params}`, { signal })
  const months = aggregateMonthlyClimate(payload?.daily)

  if (!months.some((month) => Number.isFinite(month.high) || Number.isFinite(month.low))) {
    throw new Error('Climate history unavailable')
  }

  return {
    location: {
      ...location,
      timezone: payload.timezone || location.timezone,
      timezoneAbbreviation: payload.timezone_abbreviation || '',
    },
    period: {
      startYear: period.startYear,
      endYear: period.endYear,
    },
    months,
  }
}
