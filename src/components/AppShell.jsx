import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'
import RouteProgress from './RouteProgress'
import ScrollToTop from './ScrollToTop'

export default function AppShell() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <RouteProgress />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
