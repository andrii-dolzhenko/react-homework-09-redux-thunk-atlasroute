import { featuredByCode } from '../data/featured.js'
import { normalizeBorders } from '../utils/countryBorders.js'

const API_BASE = 'https://countries.dev'
const LIST_FIELDS = [
  'name',
  'alpha2Code',
  'alpha3Code',
  'capital',
  'region',
  'subregion',
  'population',
  'area',
  'currencies',
  'languages',
  'timezones',
  'borders',
  'latlng',
  'flag',
  'flags',
].join(',')

const normalizeCountry = (country) => {
  const code = country.alpha3Code ?? country.alpha2Code
  const featured = featuredByCode[code]
  const flagIsUrl = typeof country.flag === 'string' && country.flag.startsWith('http')

  return {
    code,
    alpha2Code: country.alpha2Code,
    name: country.name,
    capital: country.capital || '—',
    region: country.region || 'Other',
    subregion: country.subregion || '—',
    population: country.population ?? 0,
    area: country.area ?? 0,
    currencies: country.currencies ?? [],
    languages: country.languages ?? [],
    timezones: country.timezones ?? [],
    borders: normalizeBorders(country),
    latlng: Array.isArray(country.latlng) ? country.latlng : [],
    flagEmoji: flagIsUrl ? '' : country.flag ?? '',
    flagUrl: country.flags?.svg || country.flags?.png || (flagIsUrl ? country.flag : ''),
    heroImage: featured?.image ?? null,
    tagline: featured?.tagline ?? `Discover ${country.name} through geography and essential facts.`,
  }
}

const request = async (path, { signal } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, { signal })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Response('Country data unavailable', {
      status: response.status,
      statusText: 'Country data unavailable',
    })
  }

  return response.json()
}

let countriesPromise

export const fetchCountries = async ({ signal } = {}) => {
  if (!countriesPromise || signal) {
    const promise = request(
      `/countries?fields=${LIST_FIELDS}&sort=name&order=asc`,
      { signal },
    ).then((items) => (items ?? []).map(normalizeCountry))

    if (!signal) countriesPromise = promise
    return promise
  }

  return countriesPromise
}

export const fetchCountryByCode = async (code, { signal } = {}) => {
  const country = await request(
    `/alpha/${encodeURIComponent(code)}?fields=${LIST_FIELDS}`,
    { signal },
  )

  return country ? normalizeCountry(country) : null
}

export const searchCountries = async (query, { signal } = {}) => {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const countries = await request(
    `/name/${encodeURIComponent(normalizedQuery)}?fields=${LIST_FIELDS}`,
    { signal },
  )

  return (countries ?? []).map(normalizeCountry).slice(0, 6)
}
