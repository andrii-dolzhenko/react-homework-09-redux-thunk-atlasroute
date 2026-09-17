import { createBrowserRouter } from 'react-router'
import AppShell from './components/AppShell'
import PrimaryLoader from './components/PrimaryLoader'
import RouteErrorPage from './pages/RouteErrorPage'
import { rootRouteChildren } from './config/routes'

const basename = import.meta.env.BASE_URL === '/'
  ? '/'
  : import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    Component: AppShell,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PrimaryLoader label="Preparing your route…" />,
    children: rootRouteChildren,
  },
], { basename })
