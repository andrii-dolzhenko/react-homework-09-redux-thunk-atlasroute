import CountriesLayout from '../components/CountriesLayout'
import PrimaryLoader from '../components/PrimaryLoader'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import CountriesPage from '../pages/CountriesPage'
import CountryDetailsPage from '../pages/CountryDetailsPage'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import RouteErrorPage from '../pages/RouteErrorPage'
import SavedCountriesPage from '../pages/SavedCountriesPage'

const pageLoader = async () => {
  await new Promise((resolve) => setTimeout(resolve, 160))
  return null
}

const routeDefinitions = [
  {
    key: 'home',
    path: '/',
    label: 'Home',
    inNav: true,
    end: true,
    route: {
      index: true,
      loader: pageLoader,
      Component: HomePage,
    },
  },
  {
    key: 'countries',
    path: '/countries',
    label: 'Countries',
    inNav: true,
    route: {
      path: 'countries',
      Component: CountriesLayout,
      errorElement: <RouteErrorPage />,
      hydrateFallbackElement: <PrimaryLoader label="Preparing your route…" />,
      children: [
        { index: true, Component: CountriesPage },
        {
          path: ':code',
          Component: CountryDetailsPage,
        },
      ],
    },
  },
  {
    key: 'saved',
    path: '/saved',
    label: 'My Atlas',
    inNav: false,
    route: {
      path: 'saved',
      Component: SavedCountriesPage,
      errorElement: <RouteErrorPage />,
      hydrateFallbackElement: <PrimaryLoader label="Opening your atlas…" />,
    },
  },
  {
    key: 'about',
    path: '/about',
    label: 'About',
    inNav: true,
    end: true,
    route: {
      path: 'about',
      loader: pageLoader,
      Component: AboutPage,
    },
  },
  {
    key: 'contact',
    path: '/contact',
    label: 'Contact',
    inNav: true,
    end: true,
    route: {
      path: 'contact',
      loader: pageLoader,
      Component: ContactPage,
    },
  },
  {
    key: 'not-found',
    path: '*',
    inNav: false,
    route: {
      path: '*',
      Component: NotFoundPage,
    },
  },
]

export const navigationRoutes = routeDefinitions
  .filter(({ inNav }) => inNav)
  .map(({ key, path, label, end = false }) => ({ key, path, label, end }))

export const rootRouteChildren = routeDefinitions.map(({ route }) => route)
