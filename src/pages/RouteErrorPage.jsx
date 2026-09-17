import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import ErrorIllustration from '../components/ErrorIllustration'

export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <section className="error-route-boundary">
      <div className="shell error-page">
        <div className="error-copy">
          <p className="eyebrow">{notFound ? '404 · Country not found' : 'Route interrupted'}</p>
          <h1>{notFound ? 'We couldn’t find this destination.' : 'We couldn’t load this route.'}</h1>
          <p>
            {notFound
              ? 'The country code in this URL does not match a destination returned by the country API.'
              : 'The live data source could not complete this route. Return to the explorer and try again.'}
          </p>
          <div className="error-actions">
            <Link className="primary-button" to="/countries">Browse countries</Link>
            <Link className="secondary-button" to="/">Back home</Link>
          </div>
        </div>
        <ErrorIllustration />
      </div>
    </section>
  )
}
