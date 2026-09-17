import { createSlice } from '@reduxjs/toolkit'

export const DEFAULT_PREFERENCES_STATE = Object.freeze({
  theme: 'light',
  unitSystem: 'metric',
})

const VALID_UNIT_SYSTEMS = new Set(['metric', 'imperial'])

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: DEFAULT_PREFERENCES_STATE,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    setUnitSystem(state, action) {
      if (VALID_UNIT_SYSTEMS.has(action.payload)) {
        state.unitSystem = action.payload
      }
    },
  },
})

export const { toggleTheme, setUnitSystem } = preferencesSlice.actions

export const selectTheme = (state) => state.preferences.theme
export const selectUnitSystem = (state) => state.preferences.unitSystem

export default preferencesSlice.reducer
