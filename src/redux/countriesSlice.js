import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchCountries as requestCountries,
  fetchCountryByCode as requestCountryByCode,
} from '../api/countries.js'

export const COUNTRY_REQUEST_STATUS = {
  idle: 'idle',
  loading: 'loading',
  succeeded: 'succeeded',
  failed: 'failed',
}

export const DEFAULT_COUNTRIES_STATE = {
  items: [],
  status: COUNTRY_REQUEST_STATUS.idle,
  error: null,
  details: {},
  detailStatus: {},
  detailErrors: {},
}

const normalizeCode = (code) => String(code ?? '').trim().toUpperCase()

const getErrorMessage = (error) => {
  if (typeof error?.statusText === 'string' && error.statusText.trim()) return error.statusText
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return 'Country data unavailable'
}

export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (options = {}, { signal, rejectWithValue }) => {
    void options
    try {
      return await requestCountries({ signal })
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
  {
    condition: (options = {}, { getState }) => {
      if (options.force) return true

      const { status } = getState().countries
      return status !== COUNTRY_REQUEST_STATUS.loading
        && status !== COUNTRY_REQUEST_STATUS.succeeded
    },
  },
)

export const fetchCountryByCode = createAsyncThunk(
  'countries/fetchCountryByCode',
  async ({ code }, { signal, rejectWithValue }) => {
    const normalizedCode = normalizeCode(code)

    try {
      const country = await requestCountryByCode(normalizedCode, { signal })
      if (!country) return rejectWithValue('Country not found')
      return country
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
  {
    condition: ({ code, force = false }, { getState }) => {
      if (force) return true

      const normalizedCode = normalizeCode(code)
      const countriesState = getState().countries
      const listMatch = countriesState.items.some((country) => (
        country.code === normalizedCode || country.alpha2Code === normalizedCode
      ))

      if (listMatch) return false

      const detailStatus = countriesState.detailStatus[normalizedCode]
      return detailStatus !== COUNTRY_REQUEST_STATUS.loading
        && detailStatus !== COUNTRY_REQUEST_STATUS.succeeded
    },
  },
)

const countriesSlice = createSlice({
  name: 'countries',
  initialState: DEFAULT_COUNTRIES_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = COUNTRY_REQUEST_STATUS.loading
        state.error = null
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = COUNTRY_REQUEST_STATUS.succeeded
        state.error = null
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        if (action.meta.condition) return
        state.status = COUNTRY_REQUEST_STATUS.failed
        state.error = action.payload || action.error.message || 'Country data unavailable'
      })
      .addCase(fetchCountryByCode.pending, (state, action) => {
        const code = normalizeCode(action.meta.arg.code)
        state.detailStatus[code] = COUNTRY_REQUEST_STATUS.loading
        state.detailErrors[code] = null
      })
      .addCase(fetchCountryByCode.fulfilled, (state, action) => {
        const requestedCode = normalizeCode(action.meta.arg.code)
        const canonicalCode = normalizeCode(action.payload.code)

        state.details[requestedCode] = action.payload
        state.details[canonicalCode] = action.payload
        state.detailStatus[requestedCode] = COUNTRY_REQUEST_STATUS.succeeded
        state.detailStatus[canonicalCode] = COUNTRY_REQUEST_STATUS.succeeded
        state.detailErrors[requestedCode] = null
        state.detailErrors[canonicalCode] = null
      })
      .addCase(fetchCountryByCode.rejected, (state, action) => {
        if (action.meta.condition) return
        const code = normalizeCode(action.meta.arg.code)
        state.detailStatus[code] = COUNTRY_REQUEST_STATUS.failed
        state.detailErrors[code] = action.payload || action.error.message || 'Country data unavailable'
      })
  },
})

export const selectCountries = (state) => state.countries.items
export const selectCountriesStatus = (state) => state.countries.status
export const selectCountriesError = (state) => state.countries.error

export const selectCountryByCode = (state, code) => {
  const normalizedCode = normalizeCode(code)
  if (!normalizedCode) return null

  return state.countries.details[normalizedCode]
    || state.countries.items.find((country) => (
      country.code === normalizedCode || country.alpha2Code === normalizedCode
    ))
    || null
}

export const selectCountryDetailStatus = (state, code) => (
  state.countries.detailStatus[normalizeCode(code)] ?? COUNTRY_REQUEST_STATUS.idle
)

export const selectCountryDetailError = (state, code) => (
  state.countries.detailErrors[normalizeCode(code)] ?? null
)

export default countriesSlice.reducer
