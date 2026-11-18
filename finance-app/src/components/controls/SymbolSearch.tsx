import { useState, type FormEvent } from 'react';
import { SUGGESTED_SYMBOLS, TICKERS } from '../../config/tickers';
import { normalizeSymbol } from '../../utils/symbol';

interface SymbolSearchProps {
  /** Called with a normalized symbol. Never fetches. */
  onSubmit: (symbol: string) => void;
}

const SUGGESTIONS = [...TICKERS, ...SUGGESTED_SYMBOLS];

/** Free-text symbol entry with known tickers as suggestions. */
export function SymbolSearch({ onSubmit }: SymbolSearchProps) {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const symbol = normalizeSymbol(value);
    setInvalid(symbol === null);
    if (symbol) onSubmit(symbol);
  }

  return (
    <form className="symbol-search" onSubmit={handleSubmit}>
      <label htmlFor="symbol-input">Compare a company with UNH</label>
      <div className="symbol-search__row">
        <input
          id="symbol-input"
          list="symbol-suggestions"
          value={value}
          placeholder="Stock symbol, e.g. AAPL"
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
        />
        <datalist id="symbol-suggestions">
          {SUGGESTIONS.map((t) => (
            <option key={t.symbol} value={t.symbol}>{t.name}</option>
          ))}
        </datalist>
        <button type="submit" className="tab tab--active">Compare</button>
      </div>
      {invalid && (
        <p role="alert" className="error">
          Enter a valid stock symbol (letters and numbers, up to 12 characters), such as AAPL.
        </p>
      )}
    </form>
  );
}
