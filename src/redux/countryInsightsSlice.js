import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchClimateAverages,
  fetchCurrentConditions,
} from '../api/countryInsights.js'

export const INSIGHT_REQUEST_STATUS = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  succeeded: 'succeeded',
  failed: 'failed',
})

export const DEFAULT_COUNTRY_INSIGHTS_STATE = {
  conditions: {},
  conditionsStatus: {},
  conditionsErrors: {},
  climate: {},
  climateStatus: {},
  climateErrors: {},
}

const normalizeCode = (code) => String(code ?? '').trim().toUpperCase()

const getErrorMessage = (error) => {
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return 'Country insight data unavailable'
}

export const fetchCountryConditions = createAsyncThunk(
  'countryInsights/fetchCountryConditions',
  async (country, { signal, rejectWithValue }) => {
    try {
      return await fetchCurrentConditions(country, { signal })
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
  {
    condition: (country, { getState }) => {
      const code = normalizeCode(country?.code)
      if (!code) return false
      if (country?.force) return true

      const status = getState().countryInsights.conditionsStatus[code]
      return status !== INSIGHT_REQUEST_STATUS.loading
        && status !== INSIGHT_REQUEST_STATUS.succeeded
    },
  },
)

export const fetchCountryClimate = createAsyncThunk(
  'countryInsights/fetchCountryClimate',
  async ({ country, location }, { signal, rejectWithValue }) => {
    try {
      return await fetchClimateAverages(country, { signal, location })
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
  {
    condition: ({ country, force = false }, { getState }) => {
      const code = normalizeCode(country?.code)
      if (!code) return false
      if (force) return true

      const status = getState().countryInsights.climateStatus[code]
      return status !== INSIGHT_REQUEST_STATUS.loading
        && status !== INSIGHT_REQUEST_STATUS.succeeded
    },
  },
)

const countryInsightsSlice = createSlice({
  name: 'countryInsights',
  initialState: DEFAULT_COUNTRY_INSIGHTS_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountryConditions.pending, (state, action) => {
        const code = normalizeCode(action.meta.arg.code)
        state.conditionsStatus[code] = INSIGHT_REQUEST_STATUS.loading
        state.conditionsErrors[code] = null
      })
      .addCase(fetchCountryConditions.fulfilled, (state, action) => {
        const code = normalizeCode(action.meta.arg.code)
        state.conditions[code] = action.payload
        state.conditionsStatus[code] = INSIGHT_REQUEST_STATUS.succeeded
        state.conditionsErrors[code] = null
      })
      .addCase(fetchCountryConditions.rejected, (state, action) => {
        if (action.meta.condition) return
        const code = normalizeCode(action.meta.arg.code)
        state.conditionsStatus[code] = INSIGHT_REQUEST_STATUS.failed
        state.conditionsErrors[code] = action.payload || action.error.message || 'Country insight data unavailable'
      })
      .addCase(fetchCountryClimate.pending, (state, action) => {
        const code = normalizeCode(action.meta.arg.country.code)
        state.climateStatus[code] = INSIGHT_REQUEST_STATUS.loading
        state.climateErrors[code] = null
      })
      .addCase(fetchCountryClimate.fulfilled, (state, action) => {
        const code = normalizeCode(action.meta.arg.country.code)
        state.climate[code] = action.payload
        state.climateStatus[code] = INSIGHT_REQUEST_STATUS.succeeded
        state.climateErrors[code] = null
      })
      .addCase(fetchCountryClimate.rejected, (state, action) => {
        if (action.meta.condition) return
        const code = normalizeCode(action.meta.arg.country.code)
        state.climateStatus[code] = INSIGHT_REQUEST_STATUS.failed
        state.climateErrors[code] = action.payload || action.error.message || 'Climate data unavailable'
      })
  },
})

export const selectCountryConditions = (state, code) => (
  state.countryInsights.conditions[normalizeCode(code)] ?? null
)

export const selectCountryConditionsStatus = (state, code) => (
  state.countryInsights.conditionsStatus[normalizeCode(code)] ?? INSIGHT_REQUEST_STATUS.idle
)

export const selectCountryConditionsError = (state, code) => (
  state.countryInsights.conditionsErrors[normalizeCode(code)] ?? null
)

export const selectCountryClimate = (state, code) => (
  state.countryInsights.climate[normalizeCode(code)] ?? null
)

export const selectCountryClimateStatus = (state, code) => (
  state.countryInsights.climateStatus[normalizeCode(code)] ?? INSIGHT_REQUEST_STATUS.idle
)

export const selectCountryClimateError = (state, code) => (
  state.countryInsights.climateErrors[normalizeCode(code)] ?? null
)

export default countryInsightsSlice.reducer
