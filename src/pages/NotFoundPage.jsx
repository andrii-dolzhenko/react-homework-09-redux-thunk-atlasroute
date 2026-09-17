import { Link } from 'react-router'
import ErrorIllustration from '../components/ErrorIllustration'

export default function NotFoundPage() {
  return (
    <section className="shell error-page">
      <div className="error-copy">
        <p className="eyebrow">404 · Route not found</p>
        <h1>Lost on the route?</h1>
        <p>This page doesn’t exist, but there is still a world to explore.</p>
        <div className="error-actions">
          <Link className="primary-button" to="/">Back home</Link>
          <Link className="secondary-button" to="/countries">Explore countries</Link>
        </div>
      </div>
      <ErrorIllustration />
    </section>
  )
}
