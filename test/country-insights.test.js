import test from 'node:test'
import assert from 'node:assert/strict'
import { configureStore } from '@reduxjs/toolkit'
import countryInsightsReducer, {
  INSIGHT_REQUEST_STATUS,
  fetchCountryClimate,
  fetchCountryConditions,
  selectCountryClimate,
  selectCountryConditions,
} from '../src/redux/countryInsightsSlice.js'
import { aggregateMonthlyClimate } from '../src/api/countryInsights.js'

const originalFetch = globalThis.fetch

const country = {
  code: 'AUS',
  alpha2Code: 'AU',
  name: 'Australia',
  capital: 'Canberra',
  latlng: [-27, 133],
}

const jsonResponse = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json' },
})

const createStore = () => configureStore({
  reducer: { countryInsights: countryInsightsReducer },
})

test('country conditions thunk resolves the capital and caches current weather', async () => {
  const store = createStore()
  let requestCount = 0

  globalThis.fetch = async (url) => {
    requestCount += 1

    if (String(url).includes('geocoding-api')) {
      return jsonResponse({
        results: [{
          name: 'Canberra',
          country: 'Australia',
          country_code: 'AU',
          latitude: -35.28,
          longitude: 149.13,
          timezone: 'Australia/Sydney',
        }],
      })
    }

    return jsonResponse({
      timezone: 'Australia/Sydney',
      timezone_abbreviation: 'AEST',
      current_units: {
        temperature_2m: '°C',
        apparent_temperature: '°C',
        relative_humidity_2m: '%',
        wind_speed_10m: 'km/h',
      },
      current: {
        time: '2026-09-15T18:00',
        temperature_2m: 17.8,
        apparent_temperature: 16.9,
        relative_humidity_2m: 52,
        weather_code: 2,
        wind_speed_10m: 14,
        is_day: 1,
      },
    })
  }

  await store.dispatch(fetchCountryConditions(country))
  const cached = await store.dispatch(fetchCountryConditions(country))
  const state = store.getState()
  const conditions = selectCountryConditions(state, 'AUS')

  assert.equal(state.countryInsights.conditionsStatus.AUS, INSIGHT_REQUEST_STATUS.succeeded)
  assert.equal(conditions.location.name, 'Canberra')
  assert.equal(conditions.location.timezone, 'Australia/Sydney')
  assert.equal(conditions.weather.temperature, 17.8)
  assert.equal(cached.meta.condition, true)
  assert.equal(requestCount, 2)

  globalThis.fetch = originalFetch
})

test('failed conditions expose retryable state and force bypasses the session cache guard', async () => {
  const store = createStore()
  globalThis.fetch = async () => {
    throw new Error('Weather network unavailable')
  }

  await store.dispatch(fetchCountryConditions(country))
  assert.equal(store.getState().countryInsights.conditionsStatus.AUS, INSIGHT_REQUEST_STATUS.failed)

  let requestCount = 0
  globalThis.fetch = async (url) => {
    requestCount += 1
    if (String(url).includes('geocoding-api')) {
      return jsonResponse({ results: [{ name: 'Canberra', country: 'Australia', latitude: -35.28, longitude: 149.13, timezone: 'Australia/Sydney' }] })
    }
    return jsonResponse({
      timezone: 'Australia/Sydney',
      current_units: {},
      current: { temperature_2m: 18, apparent_temperature: 17, relative_humidity_2m: 50, weather_code: 1, wind_speed_10m: 10, is_day: 1, time: '2026-09-15T18:00' },
    })
  }

  await store.dispatch(fetchCountryConditions({ ...country, force: true }))
  assert.equal(store.getState().countryInsights.conditionsStatus.AUS, INSIGHT_REQUEST_STATUS.succeeded)
  assert.equal(requestCount, 2)

  globalThis.fetch = originalFetch
})

test('monthly climate aggregation calculates average daily highs and lows by month', () => {
  const result = aggregateMonthlyClimate({
    time: ['2025-01-01', '2025-01-02', '2025-02-01', '2025-02-02'],
    temperature_2m_max: [20, 24, 26, 28],
    temperature_2m_min: [10, 12, 14, 16],
  })

  assert.equal(result[0].month, 'Jan')
  assert.equal(result[0].high, 22)
  assert.equal(result[0].low, 11)
  assert.equal(result[1].high, 27)
  assert.equal(result[1].low, 15)
})

test('country climate thunk stores five-year monthly climate data in session cache', async () => {
  const store = createStore()
  let requestCount = 0

  globalThis.fetch = async (url) => {
    requestCount += 1
    if (String(url).includes('geocoding-api')) {
      return jsonResponse({ results: [{ name: 'Canberra', country: 'Australia', latitude: -35.28, longitude: 149.13, timezone: 'Australia/Sydney' }] })
    }

    return jsonResponse({
      timezone: 'Australia/Sydney',
      timezone_abbreviation: 'AEST',
      daily: {
        time: ['2021-01-01', '2021-02-01', '2022-01-01', '2022-02-01'],
        temperature_2m_max: [28, 27, 30, 29],
        temperature_2m_min: [16, 15, 18, 17],
      },
    })
  }

  await store.dispatch(fetchCountryClimate({ country }))
  const cached = await store.dispatch(fetchCountryClimate({ country }))
  const state = store.getState()
  const climate = selectCountryClimate(state, 'AUS')

  assert.equal(state.countryInsights.climateStatus.AUS, INSIGHT_REQUEST_STATUS.succeeded)
  assert.equal(climate.location.name, 'Canberra')
  assert.equal(climate.months[0].high, 29)
  assert.equal(climate.months[0].low, 17)
  assert.equal(cached.meta.condition, true)
  assert.equal(requestCount, 2)

  globalThis.fetch = originalFetch
})
