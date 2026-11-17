import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { TICKERS } from '../config/tickers';
import * as marketDataModule from '../services/marketData';
import { MarketDataError } from '../services/marketData';

afterEach(() => vi.restoreAllMocks());

describe('DashboardPage (mock provider)', () => {
  it('renders a card for UNH and each peer, then updates when the window changes', async () => {
    render(<App />);

    for (const { symbol } of TICKERS) {
      expect(await screen.findByTestId(`change-${symbol}`)).toBeInTheDocument();
    }
    const before = screen.getByTestId('change-UNH').textContent;

    await userEvent.click(screen.getByRole('tab', { name: 'Last quarter' }));
    expect(screen.getByRole('tab', { name: 'Last quarter' })).toHaveAttribute('aria-selected', 'true');

    await waitFor(() => expect(screen.getByTestId('change-UNH').textContent).not.toBe(before));
    expect(screen.getAllByRole('region')).toHaveLength(TICKERS.length);
  });

  it('isolates a failing ticker so the others still render', async () => {
    const real = marketDataModule.marketData.getSeries.bind(marketDataModule.marketData);
    vi.spyOn(marketDataModule.marketData, 'getSeries').mockImplementation((symbol, window, signal) =>
      symbol === 'CI' ? Promise.reject(new MarketDataError('network', 'Network request failed')) : real(symbol, window, signal),
    );

    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('data-kind', 'network');
    expect(within(alert).getByText(/Could not load CI/)).toBeInTheDocument();
    expect(await screen.findByTestId('change-UNH')).toBeInTheDocument();
  });
});
