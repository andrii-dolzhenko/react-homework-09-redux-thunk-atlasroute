import { memo } from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router'
import { selectSavedCount } from '../redux/savedCountriesSlice'

function SavedCountriesLink() {
  const savedCount = useSelector(selectSavedCount)
  const countLabel = savedCount > 99 ? '99+' : savedCount
  const savedLabel = savedCount === 1 ? 'saved country' : 'saved countries'
  const ariaLabel = savedCount
    ? `Open My Atlas, ${savedCount} ${savedLabel}`
    : 'Open My Atlas, no saved countries'

  return (
    <NavLink
      to="/saved"
      className={({ isActive }) => (
        `saved-countries-link${isActive ? ' saved-countries-link--active' : ''}`
      )}
      aria-label={ariaLabel}
      title="My Atlas"
    >
      <span className="saved-countries-link__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M6.75 4.75A2.75 2.75 0 0 1 9.5 2h5a2.75 2.75 0 0 1 2.75 2.75V21L12 17.65 6.75 21V4.75Z"></path>
        </svg>
      </span>
      <span className="saved-countries-link__count" aria-hidden="true">
        {countLabel}
      </span>
    </NavLink>
  )
}

export default memo(SavedCountriesLink)
