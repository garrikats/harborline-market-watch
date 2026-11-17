import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChartCard } from './ChartCard';
import { TimeWindowTabs } from '../controls/TimeWindowTabs';

describe('ChartCard', () => {
  it('renders title, subtitle, badge and children', () => {
    render(
      <ChartCard title="UNH" subtitle="$520.00" badge="+1.00%">
        <p>body</p>
      </ChartCard>,
    );
    expect(screen.getByRole('heading', { name: 'UNH' })).toBeInTheDocument();
    expect(screen.getByText('$520.00')).toBeInTheDocument();
    expect(screen.getByText('+1.00%')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});

describe('TimeWindowTabs', () => {
  it('marks the selected tab and reports changes', async () => {
    const onChange = vi.fn();
    render(<TimeWindowTabs value="day" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Current day' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Last quarter' }));
    expect(onChange).toHaveBeenCalledWith('quarter');
  });
});
