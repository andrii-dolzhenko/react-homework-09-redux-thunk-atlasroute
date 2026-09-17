# AtlasRoute — Async Redux Travel Explorer

AtlasRoute is a responsive country-exploration SPA built with **React 19**, **Vite 7**, **React Router 7**, **Redux Toolkit**, and **React Redux**. Shared application state is centralized in Redux, while route-specific and component-local concerns remain close to the UI that owns them. The Home experience also includes a Redux-driven **Recently Explored Countries** feature, while remote country data is handled through Redux Toolkit async thunks.

## State Management

The Redux implementation uses:

- `createAsyncThunk` for remote country-data requests;
- explicit `idle / loading / succeeded / failed` request states;
- session caching and request de-duplication through thunk `condition`;

- `configureStore` for the Redux store;
- `createSlice` for feature state and reducers;
- `<Provider store={store}>` at the application root;
- `useSelector` for reading global state;
- `useDispatch` for dispatching actions;
- multiple slices in one store;
- immutable updates through Redux Toolkit / Immer;
- global state shared across distant routes and nested components without prop drilling;
- persistence through `preloadedState` + `store.subscribe()`;
- reducer and persistence tests;
- Redux DevTools support through `configureStore` in development.

## Redux Architecture

Global state is intentionally split by responsibility:

```text
Provider(store)
└── App
    ├── ThemeSync
    └── RouterProvider
        └── AppShell
            ├── Header
            │   ├── ThemeToggle
            │   ├── UnitToggle
            │   └── SavedCountriesLink
            ├── HomePage
            │   └── RecentlyExploredSection
            │       └── RecentlyExploredCard
            ├── CountriesPage
            │   └── CountryCard
            │       └── SaveCountryButton
            ├── CountryDetailsPage
            │   ├── AreaValue
            │   └── SaveCountryButton
            └── SavedCountriesPage
                └── SavedCountriesGrid

Redux Store
├── countries
│   ├── items
│   ├── request status / error
│   └── country details cache
├── countryInsights
│   ├── current conditions cache
│   ├── destination time-zone data
│   └── five-year climate cache
├── preferences
│   ├── theme
│   └── unitSystem
├── savedCountries
│   └── savedCountryCodes
└── recentlyViewed
    └── countries
```

Local concerns such as search input, contact-form state, gallery modal state, mobile-menu visibility, pagination/query parameters, catalogue sorting, media loading, and route-local UI remain local or router-managed rather than being moved into Redux unnecessarily.

## Redux Slices

### `countriesSlice`

Manages asynchronous country data from **countries.dev**:

- `fetchCountries()` loads the catalogue through `createAsyncThunk`;
- `fetchCountryByCode(code)` loads direct country routes on demand;
- `pending / fulfilled / rejected` states drive loading, success, error, and retry UI;
- thunk `condition` prevents duplicate requests when data is already available in the session cache;

The remote country cache is deliberately **session-only**. Preferences, My Atlas, and Recently Explored remain persisted in `localStorage`, while API responses are fetched fresh after a new browser session.



### `countryInsightsSlice`

Manages asynchronous **Country Insights** data from Open-Meteo:

- `fetchCountryConditions(country)` resolves the capital location, loads current weather, and supplies the destination IANA time zone used for the live local-time comparison;
- `fetchCountryClimate(country)` lazily loads the latest five complete years of historical daily high/low temperatures and aggregates them into monthly averages;
- both thunks expose `idle / loading / succeeded / failed` states with per-card retry UI;
- thunk `condition` keeps weather and climate responses in a session cache and skips duplicate requests;
- the climate request starts only when its card approaches the viewport, so it does not delay the initial Country Details render.

The browser clock remains local UI state: after the destination time zone is known, the **Your time / destination time** comparison updates locally without additional network requests.

### `preferencesSlice`

Manages application-wide display preferences:

- `theme`: `light | dark`;
- `unitSystem`: `metric | imperial`;
- `toggleTheme()`;
- `setUnitSystem()`;
- selectors for theme and unit system.

### `savedCountriesSlice`

Manages **My Atlas**:

- normalized saved ISO country codes;
- add/remove through `toggleSavedCountry()`;
- `clearSavedCountries()`;
- saved-count and saved-state selectors.

### `recentlyViewedSlice`

Manages **Recently Explored Countries**:

- remembers the latest five opened country pages;
- newest destination is always first;
- duplicate visits move the country back to the front instead of creating duplicates;
- country metadata can be refreshed when its hero image becomes available;
- history can be cleared independently from My Atlas.


## Async Country Data Experience

The Countries flow demonstrates Redux Toolkit async state without changing the core AtlasRoute visual language:

- the first catalogue request opens with a visible branded world-map/Lottie loading state, followed by layout-stable skeleton cards while the remote catalogue resolves;
- country cards become usable as soon as country data arrives; Pixabay photography continues loading independently with a subtle media shimmer that never covers the flag;
- failed requests render a dedicated error state with `Try again`;
- repeated catalogue and country-detail navigation reuses the Redux session cache;
- A–Z / Z–A sorting is kept in URL/UI state rather than global Redux state.

My Atlas reuses the same country cache. On a direct reload with saved destinations, it renders matching skeleton cards while country data is fetched; saved ISO codes remain untouched if the remote request fails.

## Recently Explored Countries

The Home page includes a **Recently Explored Countries** section directly after **Explore by region**.

The section:

- is driven entirely by Redux state;
- shows up to five recently visited countries;
- uses fully clickable cards that navigate to the existing `/countries/:code` routes;
- supports hover, active, `focus-visible`, keyboard navigation, Light/Dark themes, and image fallbacks;
- uses a responsive five-column desktop layout, three-column tablet layout, and horizontal scroll-snap cards on mobile;
- includes an empty state before any countries have been visited;
- includes `Clear history` without affecting saved countries.


## State Persistence

Redux state is stored in `localStorage` under:

```text
atlasroute:redux:v1
```

Persisted state includes:

```text
preferences.theme
preferences.unitSystem
savedCountries.savedCountryCodes
recentlyViewed.countries
```

The store is hydrated with `preloadedState` and persisted through `store.subscribe()`.

Stored data is validated and normalized before use. Malformed data falls back safely to Redux slice defaults.

## Main Application Features

- **Home** — branded travel landing page with Popular Destinations, regional discovery, and Recently Explored Countries.
- **Countries** — async Redux catalogue with search, region filters, A–Z/Z–A sorting, pagination, skeletons, retry, session caching, and URL-based UI state.
- **Country Details** — dynamic `/countries/:code` pages with async Redux loading/retry, session caching, live Weather Now, Your Time vs destination Local Time, lazy five-year Climate Through the Year, media, Route Focus map, bordering-country navigation, and Redux history tracking.
- **My Atlas** — persistent saved-country collection on `/saved`.
- **Light / Dark Theme** — application-wide Redux preference.
- **Metric / Imperial Units** — application-wide Redux preference.
- **About** — project overview with Lottie animations.
- **Contact** — dedicated route with interactive local form state.
- **Global Search** — suggestion-based country navigation from the Header.
- **Responsive design** — dedicated desktop, tablet, and mobile behavior.
- **Accessibility** — semantic controls, keyboard interaction, visible focus states, ARIA state where appropriate, and reduced-motion handling.

## Route Focus Map

Route Focus includes:

- continent-level geographic context;
- selected-country highlighting;
- destination markers and Local View;
- International Date Line wrapping for Pacific destinations;
- a coordinate locator fallback for micro-territories missing from the low-resolution geometry.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page + Recently Explored Countries |
| `/countries` | Country catalogue |
| `/countries/:code` | Dynamic country details |
| `/saved` | My Atlas saved-country collection |
| `/about` | About AtlasRoute |
| `/contact` | Contact page |
| `*` | Custom 404 page |

## Data and Media

### Country data

AtlasRoute uses **countries.dev** for country information, search suggestions, and country details.

### Weather, local time, and climate

Country Insights uses **Open-Meteo** without an API key for non-commercial use. The capital is resolved through the Open-Meteo geocoding endpoint; current conditions and the destination IANA time zone come from the forecast endpoint; climate cards use the Historical Weather API to calculate five-year monthly average daily highs and lows. Climate history is fetched lazily and all insight responses are cached for the current Redux session.

Weather data is attributed to Open-Meteo in the Country Details UI. Open-Meteo geocoding data is based on GeoNames.

### Country photography

Featured destinations use curated local imagery. Other Country Details pages can load travel photography from **Pixabay**.

The Pixabay API key is read from `.env.local`, which is excluded from Git. `.env.example` documents the required variable:

```text
VITE_PIXABAY_API_KEY=PASTE_YOUR_PIXABAY_API_KEY_HERE
```

### Map data

Country geometry is bundled locally from the **Natural Earth low-resolution public-domain dataset**.

## Technologies

- React 19
- Redux Toolkit
- React Redux
- React Router 7
- Vite 7
- JavaScript / JSX
- CSS
- Lottie React
- countries.dev API
- Open-Meteo Forecast, Geocoding, and Historical Weather APIs
- Pixabay API
- Natural Earth map data
- Node.js built-in test runner

## Installation and Local Run

Clone the repository:

```bash
git clone https://github.com/andrii-dolzhenko/react-homework-09-redux-thunk-atlasroute.git
cd react-homework-09-redux-thunk-atlasroute
```

Install dependencies:

```bash
npm install
```

For Pixabay photography, copy `.env.example` to `.env.local` and add your own API key. Do not commit `.env.local`.

Start the development server:

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

- `npm run dev` — starts the Vite development server.
- `npm run lint` — runs ESLint and source validation.
- `npm test` — runs Redux reducers, async thunks, persistence, country-data, map-projection, and unit tests.
- `npm run build` — creates the production build and validates generated HTML/CSS.
- `npm run preview` — serves the production build locally.

## Validation

Before a release or deployment run:

```bash
npm run lint
npm test
npm run build
```

The lint and build scripts also run lightweight source and production-output validation checks.

Manual QA should also cover:

- Light/Dark theme persistence;
- Metric/Imperial persistence;
- save/remove/clear My Atlas state;
- visit at least six countries and verify Recently Explored keeps only the latest five in correct order;
- revisit a country and verify it moves to the first position without duplication;
- clear recent history without clearing My Atlas;
- Recently Explored card hover/focus/active states;
- responsive Recently Explored layout on desktop, tablet, and mobile;
- initial Countries skeleton/loading state under throttled network;
- Countries error + retry behavior;
- A–Z / Z–A sorting together with search, region filters, pagination, and browser history;
- direct Country Details route loading/retry and cached repeat navigation;
- Country Insights Weather/Local Time loading, success, error/retry, and session-cache behavior;
- Climate Through the Year lazy loading, chart rendering, error/retry, and session-cache behavior;
- Your Time vs destination time-zone comparison, including a destination on another calendar day;
- My Atlas direct reload with saved destinations;
- direct route navigation/reload;
- browser console and network errors.

## Deployment

The project is prepared for both **GitHub Pages** and **Vercel**.

GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`, which runs install, lint, tests, and build before deployment. The workflow uses:

```text
/react-homework-09-redux-thunk-atlasroute/
```

`vercel.json` keeps the SPA rewrite required for direct navigation and reloads on nested routes.

For production Pixabay photography, configure `VITE_PIXABAY_API_KEY` in the deployment environment before building.

## Project Links

- **Repository:** https://github.com/andrii-dolzhenko/react-homework-09-redux-thunk-atlasroute
- **GitHub Pages:** https://andrii-dolzhenko.github.io/react-homework-09-redux-thunk-atlasroute/
- **Vercel:** https://react-homework-09-redux-thunk-atlas.vercel.app/

## Project Structure

```text
.github/
└── workflows/
    └── deploy-pages.yml
src/
├── api/
│   ├── countries.js
│   ├── countryInsights.js
│   └── media.js
├── assets/
├── components/
│   ├── CountryDataLoader.jsx
│   ├── CountryDataError.jsx
│   ├── CountryGridSkeleton.jsx
│   ├── CountryInsights.jsx
│   ├── CountrySortMenu.jsx
│   ├── RecentlyExploredCard.jsx
│   ├── RecentlyExploredSection.jsx
│   └── ...
├── config/
├── data/
├── hooks/
├── pages/
├── redux/
│   ├── countriesSlice.js
│   ├── countryInsightsSlice.js
│   ├── persistence.js
│   ├── preferencesSlice.js
│   ├── recentlyViewedSlice.js
│   ├── savedCountriesSlice.js
│   └── store.js
├── utils/
├── App.jsx
├── main.jsx
├── router.jsx
└── styles.css
test/
├── countries-async.test.js
├── countries-data.test.js
├── country-insights.test.js
├── map-projection.test.js
├── redux-persistence.test.js
├── redux-slices.test.js
└── units.test.js
```

---

© 2026 Andrii Dolzhenko. All Rights Reserved.
