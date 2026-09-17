import { Link } from 'react-router'
import { navigationRoutes } from '../config/routes'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>AtlasRoute</strong>
          <p>Explore. Learn. Go further.</p>
        </div>
        <nav aria-label="Footer navigation">
          {navigationRoutes.map(({ key, path, label }) => (
            <Link key={key} to={path}>{label}</Link>
          ))}
        </nav>
        <p className="copyright">© 2026 Andrii Dolzhenko. All Rights Reserved.</p>
      </div>
    </footer>
  )
}
