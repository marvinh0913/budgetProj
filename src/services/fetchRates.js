/* eslint-env node */
import { writeFileSync } from 'fs';

const FRED_API_KEY = process.env.VITE_FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

const FRED_SERIES = {
  mortgage: 'MORTGAGE30US',
  federal_funds: 'FEDFUNDS',
  credit_card: 'TERMCBCCALLNS',
  auto_loan: 'TERMCBAUTO48NS',
};

const FALLBACK_RATES = {
  mortgage: 6.59,
  federal_funds: 5.25,
  credit_card: 21.47,
  auto_loan: 7.89,
};

const fetchRate = async (seriesId) => {
  try {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&sort_order=desc&limit=1&file_type=json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.observations || data.observations.length === 0) return null;
    return parseFloat(data.observations[0].value);
  } catch {
    return null;
  }
};

const main = async () => {
  console.warn('Fetching FRED rates...');

  const [mortgage, federal_funds, credit_card, auto_loan] = await Promise.all([
    fetchRate(FRED_SERIES.mortgage),
    fetchRate(FRED_SERIES.federal_funds),
    fetchRate(FRED_SERIES.credit_card),
    fetchRate(FRED_SERIES.auto_loan),
  ]);

  const rates = {
    mortgage: mortgage ?? FALLBACK_RATES.mortgage,
    federal_funds: federal_funds ?? FALLBACK_RATES.federal_funds,
    credit_card: credit_card ?? FALLBACK_RATES.credit_card,
    auto_loan: auto_loan ?? FALLBACK_RATES.auto_loan,
    fetchedAt: new Date().toISOString(),
  };

  writeFileSync(
    'public/rates.json',
    JSON.stringify(rates, null, 2)
  );

  console.warn('Rates saved:', rates);
};

main();