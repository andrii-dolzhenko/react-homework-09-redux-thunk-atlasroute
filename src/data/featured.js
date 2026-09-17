import { publicAsset } from '../utils/publicAsset.js'

export const featuredSlides = [
  {
    code: 'ISL',
    alpha2Code: 'IS',
    name: 'Iceland',
    region: 'Europe',
    capital: 'Reykjavík',
    population: 393600,
    tagline: 'Where fire, ice and ocean meet.',
    image: publicAsset('assets/hero/hero-japan.png'),
  },
  {
    code: 'CHE',
    alpha2Code: 'CH',
    name: 'Switzerland',
    region: 'Europe',
    capital: 'Bern',
    population: 8963000,
    tagline: 'Alpine calm, clear lakes and precise design.',
    image: publicAsset('assets/hero/hero-new-zealand.png'),
  },
  {
    code: 'JPN',
    alpha2Code: 'JP',
    name: 'Japan',
    region: 'Asia',
    capital: 'Tokyo',
    population: 123800000,
    tagline: 'Tradition meets tomorrow.',
    image: publicAsset('assets/hero/hero-switzerland.png'),
  },
  {
    code: 'MAR',
    alpha2Code: 'MA',
    name: 'Morocco',
    region: 'Africa',
    capital: 'Rabat',
    population: 38000000,
    tagline: 'Ancient walls, desert light and Atlas horizons.',
    image: publicAsset('assets/hero/hero-morocco.png'),
  },
  {
    code: 'NZL',
    alpha2Code: 'NZ',
    name: 'New Zealand',
    region: 'Oceania',
    capital: 'Wellington',
    population: 5340000,
    tagline: 'Wild coastlines and landscapes made for discovery.',
    image: publicAsset('assets/hero/hero-iceland.png'),
  },
]

export const featuredByCode = Object.fromEntries(
  featuredSlides.map((country) => [country.code, country]),
)

export const formatPopulation = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0)

export const formatNumber = (value) =>
  new Intl.NumberFormat('en').format(value ?? 0)
