import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import RecentlyExploredCard from './RecentlyExploredCard'
import {
  clearRecentlyViewed,
  selectRecentlyViewedCountries,
} from '../redux/recentlyViewedSlice'

function RecentlyExploredSection() {
  const dispatch = useDispatch()
  const countries = useSelector(selectRecentlyViewedCountries)

  return (
    <section className="shell recently-explored" aria-labelledby="recently-explored-title">
      <div className="recently-explored__heading">
        <div>
          <p className="eyebrow">Your trail</p>
          <h2 id="recently-explored-title">Recently explored countries</h2>
          <p>Jump back into the countries you viewed most recently.</p>
        </div>

        {countries.length ? (
          <button
            className="recently-explored__clear"
            type="button"
            onClick={() => dispatch(clearRecentlyViewed())}
          >
            Clear history
          </button>
        ) : null}
      </div>

      {countries.length ? (
        <div className="recently-explored__list">
          {countries.map((country) => (
            <RecentlyExploredCard
              key={country.code}
              country={country}
            ></RecentlyExploredCard>
          ))}
        </div>
      ) : (
        <div className="recently-explored__empty">
          <span className="recently-explored__empty-icon" aria-hidden="true">↗</span>
          <div>
            <strong>Your recent routes will appear here.</strong>
            <span>Open a country page and AtlasRoute will keep the latest five destinations ready for a quick return.</span>
          </div>
          <Link className="text-link" to="/countries">Explore countries →</Link>
        </div>
      )}
    </section>
  )
}

export default memo(RecentlyExploredSection)
