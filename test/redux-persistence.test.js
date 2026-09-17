import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_PREFERENCES_STORAGE_KEY,
  REDUX_STORAGE_KEY,
  loadPersistedState,
  normalizePersistedState,
  savePersistedState,
} from '../src/redux/persistence.js'

const originalWindow = globalThis.window

const createLocalStorage = () => {
  const values = new Map()

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
    clear() {
      values.clear()
    },
  }
}

const installWindow = () => {
  globalThis.window = { localStorage: createLocalStorage() }
}

const restoreWindow = () => {
  if (originalWindow === undefined) {
    delete globalThis.window
  } else {
    globalThis.window = originalWindow
  }
}

test('persisted Redux state is validated and normalized', () => {
  const normalized = normalizePersistedState({
    preferences: { theme: 'dark', unitSystem: 'imperial' },
    savedCountries: { savedCountryCodes: [' isl ', 'JPN', 'isl'] },
    recentlyViewed: {
      countries: [
        { code: 'jpn', name: ' Japan ', region: 'Asia' },
        { code: 'JPN', name: 'Duplicate', region: 'Asia' },
      ],
    },
  })

  assert.deepEqual(normalized.preferences, { theme: 'dark', unitSystem: 'imperial' })
  assert.deepEqual(normalized.savedCountries.savedCountryCodes, ['ISL', 'JPN'])
  assert.deepEqual(normalized.recentlyViewed.countries.map(({ code }) => code), ['JPN'])
})

test('invalid persisted values fall back without losing valid data', () => {
  const normalized = normalizePersistedState({
    preferences: { theme: 'neon', unitSystem: 'yards' },
    savedCountries: { savedCountryCodes: ['che'] },
  })

  assert.deepEqual(normalized.preferences, { theme: 'light', unitSystem: 'metric' })
  assert.deepEqual(normalized.savedCountries.savedCountryCodes, ['CHE'])
  assert.deepEqual(normalized.recentlyViewed.countries, [])
})

test('loadPersistedState returns undefined outside the browser', () => {
  delete globalThis.window
  assert.equal(loadPersistedState(), undefined)
  restoreWindow()
})

test('legacy HW07 preferences migrate into the Redux store shape', () => {
  installWindow()
  window.localStorage.setItem(LEGACY_PREFERENCES_STORAGE_KEY, JSON.stringify({
    theme: 'dark',
    unitSystem: 'imperial',
    savedCountryCodes: ['jpn', 'isl'],
  }))

  assert.deepEqual(loadPersistedState(), {
    preferences: { theme: 'dark', unitSystem: 'imperial' },
    savedCountries: { savedCountryCodes: ['JPN', 'ISL'] },
    recentlyViewed: { countries: [] },
  })

  restoreWindow()
})

test('savePersistedState stores only normalized Redux data', () => {
  installWindow()

  assert.equal(savePersistedState({
    preferences: { theme: 'dark', unitSystem: 'imperial' },
    savedCountries: { savedCountryCodes: [' jpn ', 'JPN'] },
    recentlyViewed: {
      countries: [{ code: 'che', name: 'Switzerland', region: 'Europe' }],
    },
  }), true)

  const stored = JSON.parse(window.localStorage.getItem(REDUX_STORAGE_KEY))
  assert.deepEqual(stored.savedCountries.savedCountryCodes, ['JPN'])
  assert.deepEqual(stored.recentlyViewed.countries[0].code, 'CHE')

  restoreWindow()
})
