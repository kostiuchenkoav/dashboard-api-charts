# External API reference

The app uses two endpoints from [Open-Meteo](https://open-meteo.com/en/docs). Both are public, need no API key and allow browser requests.

## Geocoding API

Used to turn a city name into coordinates.

- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Method:** `GET`

| Parameter | Value in the app | Description |
|---|---|---|
| `name` | user input, trimmed | City name to search for |
| `count` | `5` | Maximum number of results |
| `language` | `en` | Language of the returned names |
| `format` | `json` | Response format |

### Response fields used

```json
{
  "results": [
    {
      "id": 2950159,
      "name": "Berlin",
      "latitude": 52.52437,
      "longitude": 13.41053,
      "country": "Germany",
      "admin1": "Berlin"
    }
  ]
}
```

- `results` is **absent** when nothing matches. The app treats a missing `results` field as an empty list.
- `country` and `admin1` are optional and are only shown when present.

## Forecast API

Used for current conditions and the 7-day daily forecast.

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Method:** `GET`

| Parameter | Value in the app | Description |
|---|---|---|
| `latitude`, `longitude` | from the selected city | Location |
| `current` | `temperature_2m,wind_speed_10m,weather_code` | Current-conditions variables |
| `daily` | `temperature_2m_max,temperature_2m_min,weather_code` | Daily variables |
| `forecast_days` | `7` | Number of forecast days |
| `timezone` | `auto` | Use the location's local timezone |
| `temperature_unit` | `celsius` or `fahrenheit` | Chosen in the UI |
| `wind_speed_unit` | `kmh` | Wind speed unit |

### Response fields used

```json
{
  "current": {
    "time": "2026-10-25T16:00",
    "temperature_2m": 12.4,
    "wind_speed_10m": 15.2,
    "weather_code": 2
  },
  "current_units": {
    "temperature_2m": "°C",
    "wind_speed_10m": "km/h"
  },
  "daily": {
    "time": ["2026-10-25", "2026-10-26"],
    "temperature_2m_max": [13, 11],
    "temperature_2m_min": [6, 5],
    "weather_code": [2, 61]
  }
}
```

- The UI uses `current_units` for labels, so the displayed unit always matches the data.
- `weather_code` values follow the WMO interpretation codes. The labels are defined in `src/lib/weatherCodes.ts`.
- `current.time` is the city's local time without an offset, so the app shows `HH:mm` directly.

## Validation

Responses are checked with zod schemas in `src/api/schemas.ts`. If a field is missing or has the wrong type, the request fails with `ApiError("The weather service returned an unexpected response.")`. This makes API changes visible during development instead of producing silent rendering bugs.

## Error handling

| Situation | HTTP status | App behaviour |
|---|---|---|
| Success | 200 | Data is rendered |
| Invalid request | 400 | Error message with status shown; Retry available |
| Rate limited or service error | 429, 5xx | Error message with status shown; TanStack Query retries once before showing the error |
| Network failure | — | "Network error. Check your connection and try again." |

## Usage and attribution

- Weather data is licensed under **CC BY 4.0**. The attribution link is in the app footer and must stay visible in any deployment.
- The free tier is intended for **non-commercial use**. Before using the app commercially, review the current terms and limits on [open-meteo.com](https://open-meteo.com/). If the app's traffic grows, consider Open-Meteo's commercial plans or caching responses on a server.
- The app makes at most one forecast request per city and unit every 15 minutes, plus geocoding requests after debounced input. Caching keeps this low.

## Verifying the API contract

The automated tests use fixtures that match the documented shape. To check against the live service, open the URLs above in a browser or run:

```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7"
```

If the response shape changes, the zod schemas will reject it and the error message will say so. Update `src/api/schemas.ts` and the fixtures in `src/test/fixtures.ts` together.
