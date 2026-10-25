import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { renderWithClient } from './test/render';
import { berlin, forecast, jsonResponse } from './test/fixtures';
import { FAVORITES_KEY } from './lib/favorites';

interface MockOptions {
  /** Make the first forecast request fail with HTTP 500. */
  failFirstForecast?: boolean;
}

function mockApi({ failFirstForecast = false }: MockOptions = {}) {
  let forecastCalls = 0;

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = input.toString();

    if (url.startsWith('https://geocoding-api.open-meteo.com')) {
      return jsonResponse({ results: [berlin] });
    }

    if (url.startsWith('https://api.open-meteo.com')) {
      forecastCalls += 1;
      if (failFirstForecast && forecastCalls === 1) {
        return new Response('server error', { status: 500 });
      }
      return jsonResponse(forecast);
    }

    return new Response('not found', { status: 404 });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function addBerlin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Поиск города'), 'Berlin');
  await user.click(await screen.findByRole('button', { name: 'Добавить Berlin, Germany' }));
}

describe('Weather dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds a searched city and shows its current temperature', async () => {
    const user = userEvent.setup();
    mockApi();
    renderWithClient(<App />);

    await addBerlin(user);

    expect(await screen.findByRole('heading', { name: 'Berlin, Germany' })).toBeInTheDocument();
    expect(await screen.findByTestId('current-temperature')).toHaveTextContent('12°C');
    expect(localStorage.getItem(FAVORITES_KEY)).toContain('Berlin');
  });

  it('reloads the forecast in Fahrenheit when the unit toggle changes', async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    renderWithClient(<App />);

    await addBerlin(user);
    await screen.findByTestId('current-temperature');
    await user.click(screen.getByRole('button', { name: '°F' }));

    await waitFor(() => {
      const requestedFahrenheit = fetchMock.mock.calls.some(([input]) =>
        input.toString().includes('temperature_unit=fahrenheit'),
      );
      expect(requestedFahrenheit).toBe(true);
    });
  });

  it('shows an error with a working retry action', async () => {
    const user = userEvent.setup();
    mockApi({ failFirstForecast: true });
    renderWithClient(<App />);

    await addBerlin(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed with status 500');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByTestId('current-temperature')).toHaveTextContent('12°C');
  });

  it('removes a city and returns to the empty state', async () => {
    const user = userEvent.setup();
    mockApi();
    renderWithClient(<App />);

    await addBerlin(user);
    await screen.findByTestId('current-temperature');
    await user.click(screen.getByRole('button', { name: 'Удалить Berlin' }));

    expect(screen.getByText(/Найдите город выше/)).toBeInTheDocument();
  });
});
