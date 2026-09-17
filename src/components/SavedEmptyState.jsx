import { memo } from 'react'
import { Link } from 'react-router'

function SavedEmptyState() {
  return (
    <section className="saved-empty-state" aria-labelledby="saved-empty-title">
      <div className="saved-empty-state__visual" aria-hidden="true">
        <span className="saved-empty-state__orbit saved-empty-state__orbit--outer" />
        <span className="saved-empty-state__orbit saved-empty-state__orbit--inner" />
        <span className="saved-empty-state__marker">↗</span>
        <svg className="saved-empty-state__bookmark" viewBox="0 0 24 24" focusable="false">
          <path d="M6.75 4.75A2.75 2.75 0 0 1 9.5 2h5A2.75 2.75 0 0 1 17.25 4.75V21L12 17.65 6.75 21V4.75Z" />
        </svg>
      </div>

      <div className="saved-empty-state__copy">
        <p className="eyebrow">My Atlas</p>
        <h2 id="saved-empty-title">Your atlas is waiting.</h2>
        <p>
          Save countries while exploring and they will appear here as your
          own shortlist of routes to revisit.
        </p>
        <Link className="primary-button" to="/countries">
          Explore countries
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

export default memo(SavedEmptyState)
