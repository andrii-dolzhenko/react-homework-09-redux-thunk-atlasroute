import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectIsCountrySaved,
  toggleSavedCountry,
} from '../redux/savedCountriesSlice'

function HeartIcon({ filled }) {
  return (
    <svg
      className="save-country-button__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 20.4 4.7 13.7A5 5 0 0 1 11.8 6.6L12 6.8l.2-.2a5 5 0 0 1 7.1 7.1Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  )
}

function SaveCountryButton({ code, countryName, variant = 'card' }) {
  const dispatch = useDispatch()
  const saved = useSelector((state) => selectIsCountrySaved(state, code))
  const accessibleName = saved
    ? `Remove ${countryName} from My Atlas`
    : `Save ${countryName} to My Atlas`

  const handleClick = (event) => {
    event.stopPropagation()
    dispatch(toggleSavedCountry(code))
  }

  return (
    <button
      type="button"
      className={`save-country-button save-country-button--${variant}${saved ? ' save-country-button--saved' : ''}`}
      aria-label={accessibleName}
      aria-pressed={saved}
      title={accessibleName}
      onClick={handleClick}
    >
      <HeartIcon filled={saved}></HeartIcon>
      {variant === 'hero' && (
        <span className="save-country-button__label">
          {saved ? 'Saved to My Atlas' : 'Save to My Atlas'}
        </span>
      )}
    </button>
  )
}

export default memo(SaveCountryButton)
