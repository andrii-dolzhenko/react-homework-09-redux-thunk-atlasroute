import { createSlice } from '@reduxjs/toolkit'

export const normalizeCountryCode = (code) => (
  typeof code === 'string' ? code.trim().toUpperCase() : ''
)

export const normalizeSavedCountryCodes = (value) => {
  if (!Array.isArray(value)) return []

  return [...new Set(
    value
      .map(normalizeCountryCode)
      .filter(Boolean),
  )]
}

export const DEFAULT_SAVED_COUNTRIES_STATE = Object.freeze({
  savedCountryCodes: Object.freeze([]),
})

const savedCountriesSlice = createSlice({
  name: 'savedCountries',
  initialState: DEFAULT_SAVED_COUNTRIES_STATE,
  reducers: {
    toggleSavedCountry(state, action) {
      const code = normalizeCountryCode(action.payload)
      if (!code) return

      const existingIndex = state.savedCountryCodes.indexOf(code)

      if (existingIndex >= 0) {
        state.savedCountryCodes.splice(existingIndex, 1)
      } else {
        state.savedCountryCodes.push(code)
      }
    },
    clearSavedCountries(state) {
      state.savedCountryCodes = []
    },
  },
})

export const { toggleSavedCountry, clearSavedCountries } = savedCountriesSlice.actions

export const selectSavedCountryCodes = (state) => state.savedCountries.savedCountryCodes
export const selectSavedCount = (state) => state.savedCountries.savedCountryCodes.length
export const selectIsCountrySaved = (state, code) => {
  const normalizedCode = normalizeCountryCode(code)
  return normalizedCode
    ? state.savedCountries.savedCountryCodes.includes(normalizedCode)
    : false
}

export default savedCountriesSlice.reducer
