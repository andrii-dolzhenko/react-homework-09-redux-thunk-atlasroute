import test from 'node:test'
import assert from 'node:assert/strict'
import preferencesReducer, {
  DEFAULT_PREFERENCES_STATE,
  setUnitSystem,
  toggleTheme,
} from '../src/redux/preferencesSlice.js'
import savedCountriesReducer, {
  clearSavedCountries,
  normalizeCountryCode,
  toggleSavedCountry,
} from '../src/redux/savedCountriesSlice.js'
import recentlyViewedReducer, {
  MAX_RECENTLY_VIEWED,
  addRecentlyViewed,
  clearRecentlyViewed,
} from '../src/redux/recentlyViewedSlice.js'

test('preferences slice exposes a light metric initial state', () => {
  assert.deepEqual(
    preferencesReducer(undefined, { type: 'unknown' }),
    DEFAULT_PREFERENCES_STATE,
  )
})

test('theme action toggles light and dark', () => {
  const dark = preferencesReducer(undefined, toggleTheme())
  assert.equal(dark.theme, 'dark')

  const light = preferencesReducer(dark, toggleTheme())
  assert.equal(light.theme, 'light')
})

test('unit action accepts supported units and ignores unsupported values', () => {
  const imperial = preferencesReducer(undefined, setUnitSystem('imperial'))
  assert.equal(imperial.unitSystem, 'imperial')

  const unchanged = preferencesReducer(imperial, setUnitSystem('yards'))
  assert.equal(unchanged.unitSystem, 'imperial')
})

test('saved-country slice normalizes, adds, removes and clears country codes', () => {
  assert.equal(normalizeCountryCode(' isl '), 'ISL')

  const withIceland = savedCountriesReducer(undefined, toggleSavedCountry(' isl '))
  assert.deepEqual(withIceland.savedCountryCodes, ['ISL'])

  const withoutIceland = savedCountriesReducer(withIceland, toggleSavedCountry('ISL'))
  assert.deepEqual(withoutIceland.savedCountryCodes, [])

  const withJapan = savedCountriesReducer(withoutIceland, toggleSavedCountry('JPN'))
  const cleared = savedCountriesReducer(withJapan, clearSavedCountries())
  assert.deepEqual(cleared.savedCountryCodes, [])
})

test('invalid saved-country actions leave the collection unchanged', () => {
  const state = savedCountriesReducer(undefined, toggleSavedCountry('JPN'))
  const next = savedCountriesReducer(state, toggleSavedCountry(null))

  assert.deepEqual(next.savedCountryCodes, ['JPN'])
})

test('recently viewed keeps the latest destination first without duplicates', () => {
  const japan = { code: 'JPN', name: 'Japan', region: 'Asia' }
  const iceland = { code: 'ISL', name: 'Iceland', region: 'Europe' }

  let state = recentlyViewedReducer(undefined, addRecentlyViewed(japan))
  state = recentlyViewedReducer(state, addRecentlyViewed(iceland))
  state = recentlyViewedReducer(state, addRecentlyViewed({ ...japan, image: '/japan.jpg' }))

  assert.deepEqual(state.countries.map(({ code }) => code), ['JPN', 'ISL'])
  assert.equal(state.countries[0].image, '/japan.jpg')
})

test('recently viewed caps history at five countries', () => {
  let state

  for (let index = 0; index < MAX_RECENTLY_VIEWED + 2; index += 1) {
    state = recentlyViewedReducer(state, addRecentlyViewed({
      code: `C${index}`,
      name: `Country ${index}`,
      region: 'Test',
    }))
  }

  assert.equal(state.countries.length, MAX_RECENTLY_VIEWED)
  assert.deepEqual(
    state.countries.map(({ code }) => code),
    ['C6', 'C5', 'C4', 'C3', 'C2'],
  )
})

test('recently viewed can be cleared independently', () => {
  const withCountry = recentlyViewedReducer(undefined, addRecentlyViewed({
    code: 'CHE',
    name: 'Switzerland',
    region: 'Europe',
  }))

  const cleared = recentlyViewedReducer(withCountry, clearRecentlyViewed())
  assert.deepEqual(cleared.countries, [])
})
