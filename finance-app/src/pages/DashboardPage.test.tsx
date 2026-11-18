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

describe('DashboardPage comparison chart (mock provider)', () => {
  async function compare(symbol: string) {
    await userEvent.type(screen.getByLabelText(/compare a company/i), symbol);
    await userEvent.click(screen.getByRole('button', { name: 'Compare' }));
  }

  it('shows no comparison chart until a symbol is submitted', async () => {
    render(<App />);
    await screen.findByTestId('change-UNH');
    expect(screen.queryByRole('region', { name: /vs\. UNH/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('region')).toHaveLength(TICKERS.length);
  });

  it('adds a comparison chart for a normalized symbol and keeps the existing cards', async () => {
    render(<App />);
    await screen.findByTestId('change-UNH');

    await compare(' aapl ');

    expect(await screen.findByRole('region', { name: 'AAPL vs. UNH' })).toBeInTheDocument();
    expect(await screen.findByTestId('comparison-change-AAPL')).toBeInTheDocument();
    expect(screen.getAllByRole('region')).toHaveLength(TICKERS.length + 1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('updates the comparison when the time window changes', async () => {
    render(<App />);
    await compare('MSFT');
    const before = (await screen.findByTestId('comparison-change-MSFT')).textContent;

    await userEvent.click(screen.getByRole('tab', { name: 'Last quarter' }));

    await waitFor(() => expect(screen.getByTestId('comparison-change-MSFT').textContent).not.toBe(before));
  });

  it('replaces the chart when a different symbol is submitted (one at a time)', async () => {
    render(<App />);
    await compare('AAPL');
    await screen.findByTestId('comparison-change-AAPL');

    await userEvent.clear(screen.getByLabelText(/compare a company/i));
    await compare('JNJ');

    expect(await screen.findByTestId('comparison-change-JNJ')).toBeInTheDocument();
    expect(screen.queryByTestId('comparison-change-AAPL')).not.toBeInTheDocument();
  });

  it('still compares a symbol that is already on the dashboard', async () => {
    render(<App />);
    await compare('CI');
    expect(await screen.findByRole('region', { name: 'CI vs. UNH' })).toBeInTheDocument();
    expect(await screen.findByTestId('comparison-change-CI')).toBeInTheDocument();
  });

  it('shows a clear no-data message for an unsupported symbol and no chart', async () => {
    render(<App />);
    await screen.findByTestId('change-UNH');

    await compare('ZZZZ');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('data-kind', 'not_found');
    expect(alert).toHaveTextContent('No data available for ZZZZ');
    const card = screen.getByRole('region', { name: 'ZZZZ vs. UNH' });
    expect(within(card).queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByTestId('comparison-change-ZZZZ')).not.toBeInTheDocument();
  });

  it('shows the no-data message when the provider returns an empty series, never another company', async () => {
    const real = marketDataModule.marketData.getSeries.bind(marketDataModule.marketData);
    vi.spyOn(marketDataModule.marketData, 'getSeries').mockImplementation((symbol, window, signal) =>
      symbol === 'AAPL' ? Promise.reject(new MarketDataError('empty', 'No price data for AAPL')) : real(symbol, window, signal),
    );
    render(<App />);
    await screen.findByTestId('change-UNH');

    await compare('AAPL');

    expect(await screen.findByRole('alert')).toHaveTextContent('No data available for AAPL');
    expect(screen.queryByTestId('comparison-change-AAPL')).not.toBeInTheDocument();
    expect(screen.getByTestId('change-UNH')).toBeInTheDocument();
  });

  it('shows a connection message for network failures', async () => {
    const real = marketDataModule.marketData.getSeries.bind(marketDataModule.marketData);
    vi.spyOn(marketDataModule.marketData, 'getSeries').mockImplementation((symbol, window, signal) =>
      symbol === 'AAPL' ? Promise.reject(new MarketDataError('network', 'Network request failed')) : real(symbol, window, signal),
    );
    render(<App />);
    await compare('AAPL');
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not reach the market data service for AAPL/);
  });

  it('rejects malformed input without fetching or adding a chart', async () => {
    const spy = vi.spyOn(marketDataModule.marketData, 'getSeries');
    render(<App />);
    await screen.findByTestId('change-UNH');
    const callsBefore = spy.mock.calls.length;

    await compare('not a symbol');

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid stock symbol/i);
    expect(spy.mock.calls.length).toBe(callsBefore);
    expect(screen.getAllByRole('region')).toHaveLength(TICKERS.length);
  });

  it('does not fetch while typing, only on submit', async () => {
    const spy = vi.spyOn(marketDataModule.marketData, 'getSeries');
    render(<App />);
    await screen.findByTestId('change-UNH');
    const callsBefore = spy.mock.calls.length;

    await userEvent.type(screen.getByLabelText(/compare a company/i), 'AAPL');

    expect(spy.mock.calls.length).toBe(callsBefore);
  });
});
