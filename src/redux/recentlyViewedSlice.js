import { createSlice } from '@reduxjs/toolkit'

export const MAX_RECENTLY_VIEWED = 5

const cleanString = (value) => (
  typeof value === 'string' ? value.trim() : ''
)

export const normalizeRecentCountry = (country) => {
  if (!country || typeof country !== 'object') return null

  const code = cleanString(country.code).toUpperCase()
  const name = cleanString(country.name)

  if (!code || !name) return null

  return {
    code,
    name,
    region: cleanString(country.region) || 'Other',
    flagUrl: cleanString(country.flagUrl),
    flagEmoji: cleanString(country.flagEmoji),
    image: cleanString(country.image),
  }
}

export const normalizeRecentlyViewedCountries = (value) => {
  if (!Array.isArray(value)) return []

  const normalized = []
  const seen = new Set()

  value.forEach((country) => {
    const item = normalizeRecentCountry(country)
    if (!item || seen.has(item.code) || normalized.length >= MAX_RECENTLY_VIEWED) return

    seen.add(item.code)
    normalized.push(item)
  })

  return normalized
}

export const DEFAULT_RECENTLY_VIEWED_STATE = Object.freeze({
  countries: Object.freeze([]),
})

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: DEFAULT_RECENTLY_VIEWED_STATE,
  reducers: {
    addRecentlyViewed(state, action) {
      const country = normalizeRecentCountry(action.payload)
      if (!country) return

      state.countries = [
        country,
        ...state.countries.filter((item) => item.code !== country.code),
      ].slice(0, MAX_RECENTLY_VIEWED)
    },
    clearRecentlyViewed(state) {
      state.countries = []
    },
  },
})

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions
export const selectRecentlyViewedCountries = (state) => state.recentlyViewed.countries
export const selectRecentlyViewedCount = (state) => state.recentlyViewed.countries.length

export default recentlyViewedSlice.reducer
