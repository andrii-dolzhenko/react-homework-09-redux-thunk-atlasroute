import test from 'node:test'
import assert from 'node:assert/strict'
import { configureStore } from '@reduxjs/toolkit'
import countriesReducer, {
  COUNTRY_REQUEST_STATUS,
  fetchCountries,
  fetchCountryByCode,
  selectCountryByCode,
} from '../src/redux/countriesSlice.js'

const originalFetch = globalThis.fetch

const rawCountry = (overrides = {}) => ({
  name: 'Armenia',
  alpha2Code: 'AM',
  alpha3Code: 'ARM',
  capital: 'Yerevan',
  region: 'Asia',
  subregion: 'Western Asia',
  population: 3000000,
  area: 29743,
  currencies: [],
  languages: [],
  timezones: ['UTC+04:00'],
  borders: ['GEO'],
  latlng: [40, 45],
  flag: '🇦🇲',
  flags: { svg: 'https://example.test/am.svg' },
  ...overrides,
})

const createStore = () => configureStore({
  reducer: { countries: countriesReducer },
})

const jsonResponse = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json' },
})

test('countries thunk moves through loading to succeeded and stores catalogue data', async () => {
  const store = createStore()
  globalThis.fetch = async () => jsonResponse([rawCountry()])

  const actionPromise = store.dispatch(fetchCountries())
  assert.equal(store.getState().countries.status, COUNTRY_REQUEST_STATUS.loading)

  await actionPromise
  const state = store.getState().countries

  assert.equal(state.status, COUNTRY_REQUEST_STATUS.succeeded)
  assert.equal(state.items.length, 1)
  assert.equal(state.items[0].code, 'ARM')

  globalThis.fetch = originalFetch
})

test('countries thunk skips duplicate successful requests while forced recovery can bypass the cache', async () => {
  const store = createStore()
  let requestCount = 0
  globalThis.fetch = async () => {
    requestCount += 1
    return jsonResponse([rawCountry()])
  }

  await store.dispatch(fetchCountries())
  const skipped = await store.dispatch(fetchCountries())
  await store.dispatch(fetchCountries({ force: true }))

  assert.equal(skipped.meta.condition, true)
  assert.equal(requestCount, 2)

  globalThis.fetch = originalFetch
})

test('failed catalogue requests expose a retryable failed state', async () => {
  const store = createStore()
  globalThis.fetch = async () => {
    throw new Error('Network unavailable')
  }

  await store.dispatch(fetchCountries())
  const state = store.getState().countries

  assert.equal(state.status, COUNTRY_REQUEST_STATUS.failed)
  assert.equal(state.error, 'Network unavailable')
  assert.deepEqual(state.items, [])

  globalThis.fetch = originalFetch
})

test('country detail thunk caches a direct route by requested and canonical code', async () => {
  const store = createStore()
  let requestCount = 0
  globalThis.fetch = async () => {
    requestCount += 1
    return jsonResponse(rawCountry())
  }

  await store.dispatch(fetchCountryByCode({ code: 'am' }))
  await store.dispatch(fetchCountryByCode({ code: 'AM' }))

  const state = store.getState()
  assert.equal(selectCountryByCode(state, 'AM')?.name, 'Armenia')
  assert.equal(selectCountryByCode(state, 'ARM')?.name, 'Armenia')
  assert.equal(requestCount, 1)

  globalThis.fetch = originalFetch
})
