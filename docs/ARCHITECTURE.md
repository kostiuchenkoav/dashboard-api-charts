# Architecture

This document describes how the Weather Dashboard is organised, how data moves through it, and why certain choices were made.

## Overview

The app is a client-only single-page application. It calls two public Open-Meteo endpoints directly from the browser and keeps user preferences in `localStorage`. There is no backend.

```
┌──────────────┐   search text   ┌─────────────────┐   GET /v1/search   ┌──────────────────────────┐
│  CitySearch  │ ───────────────▶│ TanStack Query  │ ─────────────────▶ │ geocoding-api.open-meteo │
└──────┬───────┘                 │    (cache)      │                    └──────────────────────────┘
       │ onSelect(city)          │                 │   GET /v1/forecast ┌──────────────────────────┐
       ▼                         │                 │ ─────────────────▶ │ api.open-meteo.com       │
┌──────────────────┐  city ids   │                 │                    └──────────────────────────┘
│ useFavoriteCities│ ◀──────────▶│                 │
└──────┬───────────┘             └────────┬────────┘
       │ cities                           │ forecast data
       ▼                                  ▼
┌──────────────┐   unit          ┌──────────────────┐
│     App      │ ──────────────▶ │     CityCard     │ ──▶ ForecastChart (lazy)
└──────────────┘                 └──────────────────┘
```

## Layers

| Layer | Path | Responsibility | May depend on |
|---|---|---|---|
| Components | `src/components` | Rendering and user interaction | hooks, api types, lib |
| Hooks | `src/hooks` | Stateful logic shared between components | api, lib |
| API | `src/api` | HTTP requests, error mapping, runtime validation | lib (none today) |
| Lib | `src/lib` | Pure helpers, storage, query client configuration | nothing app-specific except types |

Dependencies point downward only. Components never call `fetch` directly, and the API layer knows nothing about React.

## Data flow

### City search

1. `CitySearch` keeps the raw input in local state.
2. `useDebouncedValue` emits the trimmed value after 300 ms of inactivity.
3. Once the value has at least two characters, a `useQuery` with key `['geocoding', query]` calls `searchCities`.
4. Results are shown as buttons. Selecting one calls `addCity` and clears the input.

### Forecast cards

1. `App` renders one `CityCard` per tracked city, passing the selected unit.
2. Each card runs `useQuery` with key `['forecast', city.id, unit]`.
3. Switching the unit changes the key, so cached data for the other unit is reused if it is still fresh.
4. Every card refetches every 15 minutes (`refetchInterval`) and uses the default five-minute `staleTime` otherwise.

### Persistence

- `useFavoriteCities` initialises state from `loadFavorites()` and writes back on every change.
- `loadFavorites` validates stored JSON against `citySchema`. Corrupted or outdated entries are dropped silently instead of crashing the app.

## Data validation

Every response is parsed with a zod schema in `fetchJson`:

- Compile-time types are inferred from the schemas (`z.infer`), so the TypeScript types and runtime checks cannot drift apart.
- Invalid payloads raise an `ApiError` with a user-friendly message. The UI never receives a partially valid object.

## Error handling

| Failure | Where it is detected | What the user sees |
|---|---|---|
| Network offline or DNS failure | `fetchJson` (`fetch` rejects) | "Network error. Check your connection and try again." |
| HTTP 4xx or 5xx | `fetchJson` (`response.ok` is false) | "Request failed with status N" and a Retry button |
| Payload shape changed | zod `safeParse` | "The weather service returned an unexpected response." |
| No geocoding matches | Empty `results` | "No cities found for …" |
| Request cancelled (new search) | `AbortSignal` | Nothing; the query is dropped silently |

`ApiError` is the only error type the UI needs to understand. Any other exception is shown with a generic message.

## State management

| State | Where it lives | Why |
|---|---|---|
| Server data (forecasts, search results) | TanStack Query cache | Caching, retries, refetching and loading flags come for free |
| Tracked cities | `useFavoriteCities` (state + localStorage) | Small, local, user-owned data |
| Temperature unit | `App` local state | Affects every card, so it sits at the top of the tree |
| Search input | `CitySearch` local state | Only used inside that component |

No global store is needed at this size. Adding one would duplicate what TanStack Query already provides.

## Performance

- **Code splitting.** `ForecastChart` is loaded with `React.lazy`. Recharts is the largest dependency, so the initial bundle stays small and the chart appears after its chunk loads.
- **Debouncing.** Geocoding requests start only after the user pauses typing.
- **Cache reuse.** Cards for the same city and unit share one cache entry, so adding a duplicate city is prevented in state and the network is not hit twice.
- **Abort on change.** Obsolete geocoding requests are cancelled through `AbortSignal`.

## Accessibility

- Form controls have explicit labels.
- Status changes are announced through `role="status"` (loading) and `role="alert"` (errors).
- Pressed-state buttons use `aria-pressed` rather than changing their text.
- The chart is complemented by a table with the same values.

## Testing strategy

| Level | Tooling | What it covers |
|---|---|---|
| Unit | Vitest | Pure helpers, schemas and storage validation |
| API | Vitest with stubbed `fetch` | Request URLs, parameters, error mapping |
| Integration | Testing Library with `user-event` | User flows across components, query caching and error recovery |

Network calls are never made in tests. Fixtures in `src/test/fixtures.ts` match the documented response shape, which keeps the tests readable and deterministic.

## Known trade-offs

- **No backend.** Keeps the project simple and deployable as static files, but it means API calls are visible in the browser. Open-Meteo does not require a key, so no secrets are exposed.
- **Browser-only persistence.** Cities are not synced across devices. A future version could add accounts with a small backend.
- **Fixed forecast length.** The app requests 7 days. Changing this only requires editing one parameter in `fetchForecast`.
