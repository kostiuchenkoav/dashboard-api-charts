# Weather Dashboard

A responsive dashboard that tracks weather for any number of cities. Search a city, add it to your board, and see current conditions plus a 7-day chart of daily highs and lows. Switch between °C and °F at any time.

Data comes live from the [Open-Meteo](https://open-meteo.com/) API, which needs no API key.

> **Live demo:** _add the deployed URL here after deployment_

## Features

- City search with debounced requests and a minimum query length
- Multiple tracked cities, saved in `localStorage` and restored on reload
- Current temperature, weather condition and wind speed per city
- 7-day line chart (Recharts) with tooltips, plus an equivalent table for screen readers
- °C / °F toggle that refetches data in the selected unit
- Automatic background refresh every 15 minutes
- Loading, empty, error and retry states for every request
- Responsive grid from mobile to desktop
- Runtime validation of every API response (zod)

## Tech stack

| Area | Choice | Why |
|---|---|---|
| UI | React 18, TypeScript (strict) | Typed components and hooks |
| Build | Vite | Fast dev server, small production bundle |
| Server state | TanStack Query | Caching, deduplication, retries, background refresh and abort handling |
| Charts | Recharts | Declarative React API, responsive containers, accessible tooltips |
| Validation | zod | Checks API responses at runtime, not only at compile time |
| Tests | Vitest, Testing Library, jsdom | Fast unit tests and user-centred component tests |
| CI | GitHub Actions | Type-check, build and tests on every push and pull request |

## Getting started

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm test` | Run the full test suite once |
| `npm run test:watch` | Run tests in watch mode |

No environment variables or secrets are required.

## Architecture

The app is split into four layers. Each one only depends on the layers below it.

```
components/   UI: CitySearch, CityCard, ForecastChart, UnitToggle
hooks/        Stateful logic shared by components
api/          Typed HTTP client, Open-Meteo requests, zod schemas
lib/          Pure helpers: weather code labels, formatting, storage, query client
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data flow, caching strategy and testing approach.

## Testing

```bash
npm test
```

The suite has 19 tests in three groups:

- **API layer** (`src/api/weather.test.ts`): request parameters, error mapping (HTTP, network, invalid payload) and empty results.
- **Pure logic** (`src/lib/*.test.ts`): weather code labels, formatting, and localStorage validation with corrupted data.
- **User flows** (`src/App.test.tsx`): adding a city, switching units, recovering from an error with Retry, and removing a city. Network calls are mocked with `vi.stubGlobal('fetch')`, so the tests never depend on the live API.

## Accessibility

- Every input has a visible or visually hidden label.
- Toggle and filter controls expose their state with `aria-pressed`.
- Loading and error messages use `role="status"` and `role="alert"`.
- Each chart has a `figcaption` and a hidden data table with the same numbers.
- Focus styles are visible for keyboard users.

## Performance decisions

- **Debounced search.** Typing "Berlin" sends one geocoding request instead of six.
- **Lazy-loaded chart.** Recharts (about 386 kB minified) loads only when a city card renders its forecast, so the first paint stays light (the entry bundle is about 243 kB).
- **Query caching.** Data is considered fresh for five minutes. Switching units refetches only the affected cards, and each unit has its own cache entry.
- **Cancellation.** Requests receive an `AbortSignal`, so stale searches are dropped when the query changes.

## Project structure

```
src/
  api/
    client.ts          fetchJson() with error mapping and runtime validation
    schemas.ts         zod schemas and inferred types for API responses
    weather.ts         searchCities() and fetchForecast()
  components/
    CitySearch.tsx     search input, debounced geocoding, result list
    CityCard.tsx       forecast query and card states for one city
    ForecastChart.tsx  Recharts line chart with accessible table
    UnitToggle.tsx     °C / °F switch
  hooks/
    useDebouncedValue.ts
    useFavoriteCities.ts
  lib/
    favorites.ts       localStorage persistence with validation
    format.ts          temperature, weekday and city name formatting
    queryClient.ts     shared TanStack Query configuration
    weatherCodes.ts    WMO weather code labels
  test/                test setup, fixtures and render helper
docs/
  API.md               external API reference used by the app
  ARCHITECTURE.md      design notes
```

## Data source and attribution

Weather data is provided by [Open-Meteo.com](https://open-meteo.com/) under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The attribution is shown in the app footer. Open-Meteo's free tier is intended for non-commercial use; check its terms before deploying a commercial product. Details are in [docs/API.md](docs/API.md).

## Known limitations

- The Open-Meteo forecast covers 7 days, and the chart shows daily values only.
- Tracked cities are stored per browser. There are no accounts or server-side sync.
- Searches return up to 5 matches.

## Roadmap

- Hourly forecast view for a selected day
- Drag-and-drop card ordering
- Dark theme with system preference detection

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

[MIT](LICENSE)
