import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectTheme, toggleTheme } from '../redux/preferencesSlice'

function ThemeToggle() {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={() => dispatch(toggleTheme())}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? (
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="4.1"></circle>
            <path d="M12 2.4v2.1M12 19.5v2.1M4.5 12H2.4M21.6 12h-2.1M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5"></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M20.1 15.2A8.6 8.6 0 0 1 8.8 3.9 8.7 8.7 0 1 0 20.1 15.2Z"></path>
          </svg>
        )}
      </span>
      <span className="visually-hidden">{label}</span>
    </button>
  )
}

export default memo(ThemeToggle)
