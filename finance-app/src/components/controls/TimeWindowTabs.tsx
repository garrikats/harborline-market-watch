import { TIME_WINDOWS, type TimeWindowId } from '../../config/timeWindows';

interface TimeWindowTabsProps {
  value: TimeWindowId;
  onChange: (id: TimeWindowId) => void;
}

/** Controlled tab group. Writes the selected window up; never fetches. */
export function TimeWindowTabs({ value, onChange }: TimeWindowTabsProps) {
  return (
    <div role="tablist" aria-label="Time window" className="tabs">
      {TIME_WINDOWS.map((w) => (
        <button
          key={w.id}
          role="tab"
          type="button"
          aria-selected={w.id === value}
          className={w.id === value ? 'tab tab--active' : 'tab'}
          onClick={() => onChange(w.id)}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
