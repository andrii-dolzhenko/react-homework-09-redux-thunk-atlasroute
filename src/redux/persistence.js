import { DEFAULT_PREFERENCES_STATE } from './preferencesSlice.js'
import {
  DEFAULT_SAVED_COUNTRIES_STATE,
  normalizeSavedCountryCodes,
} from './savedCountriesSlice.js'
import {
  DEFAULT_RECENTLY_VIEWED_STATE,
  normalizeRecentlyViewedCountries,
} from './recentlyViewedSlice.js'

export const REDUX_STORAGE_KEY = 'atlasroute:redux:v1'
export const LEGACY_PREFERENCES_STORAGE_KEY = 'atlasroute:preferences:v1'

const VALID_THEMES = new Set(['light', 'dark'])
const VALID_UNIT_SYSTEMS = new Set(['metric', 'imperial'])

const cloneDefaults = () => ({
  preferences: { ...DEFAULT_PREFERENCES_STATE },
  savedCountries: {
    savedCountryCodes: [...DEFAULT_SAVED_COUNTRIES_STATE.savedCountryCodes],
  },
  recentlyViewed: {
    countries: [...DEFAULT_RECENTLY_VIEWED_STATE.countries],
  },
})

export const normalizePersistedState = (value) => {
  const defaults = cloneDefaults()

  return {
    preferences: {
      theme: VALID_THEMES.has(value?.preferences?.theme)
        ? value.preferences.theme
        : defaults.preferences.theme,
      unitSystem: VALID_UNIT_SYSTEMS.has(value?.preferences?.unitSystem)
        ? value.preferences.unitSystem
        : defaults.preferences.unitSystem,
    },
    savedCountries: {
      savedCountryCodes: normalizeSavedCountryCodes(
        value?.savedCountries?.savedCountryCodes,
      ),
    },
    recentlyViewed: {
      countries: normalizeRecentlyViewedCountries(
        value?.recentlyViewed?.countries,
      ),
    },
  }
}

const migrateLegacyPreferences = (legacyValue) => normalizePersistedState({
  preferences: {
    theme: legacyValue?.theme,
    unitSystem: legacyValue?.unitSystem,
  },
  savedCountries: {
    savedCountryCodes: legacyValue?.savedCountryCodes,
  },
  recentlyViewed: {
    countries: [],
  },
})

export const loadPersistedState = () => {
  if (typeof window === 'undefined') return undefined

  try {
    const storedValue = window.localStorage.getItem(REDUX_STORAGE_KEY)

    if (storedValue) {
      return normalizePersistedState(JSON.parse(storedValue))
    }

    const legacyValue = window.localStorage.getItem(LEGACY_PREFERENCES_STORAGE_KEY)
    if (!legacyValue) return undefined

    return migrateLegacyPreferences(JSON.parse(legacyValue))
  } catch {
    return undefined
  }
}

export const savePersistedState = (state) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      REDUX_STORAGE_KEY,
      JSON.stringify(normalizePersistedState(state)),
    )
    return true
  } catch {
    return false
  }
}
