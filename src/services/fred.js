/**
 * FRED API service for BudgetProj.
 * Fetches real-time interest rate data from the Federal Reserve
 * Bank of St. Louis. Implements per-rate caching based on
 * each rate's actual update frequency.
 */

import { saveRates, getRates } from './storage';

// FRED series IDs for each rate type
const FRED_SERIES = {
  mortgage: 'MORTGAGE30US',
  federal_funds: 'FEDFUNDS',
  credit_card: 'TERMCBCCALLNS',
  auto_loan: 'TERMCBAU48NS',
};

// Cache expiry in hours per rate type
// Based on actual FRED update frequency
const CACHE_EXPIRY_HOURS = {
  mortgage: 24, // updates weekly
  federal_funds: 168, // updates every ~6 weeks
  credit_card: 720, // updates quarterly
  auto_loan: 168, // updates monthly
};

const FRED_BASE_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=';

/**
 * Check if a cached rate is stale based on its expiry hours.
 * @param {number} timestamp - Unix timestamp of when rate was fetched
 * @param {number} maxAgeHours - Maximum age in hours before stale
 * @returns {boolean} True if cache is stale and needs refreshing
 */
export const isCacheStale = (timestamp, maxAgeHours) => {
  if (!timestamp) return true;
  const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
  return ageInHours > maxAgeHours;
};

/**
 * Parse FRED CSV response and extract the most recent rate value.
 * FRED returns CSV in format: DATE,VALUE with newest data at top.
 * @param {string} csvText - Raw CSV text from FRED API
 * @returns {number|null} Most recent rate value or null if parsing fails
 */
export const parseFredCsv = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');

    // First line is header: DATE,SERIES_ID
    // Second line is most recent value
    if (lines.length < 2) return null;

    const mostRecentLine = lines[1];
    const parts = mostRecentLine.split(',');

    if (parts.length < 2) return null;

    const value = parseFloat(parts[1]);

    // Check for missing/invalid data
    if (isNaN(value) || parts[1].trim() === '.') return null;

    return value;
  } catch {
    return null;
  }
};

/**
 * Fetch a single rate from FRED API.
 * @param {string} seriesId - FRED series ID
 * @returns {Promise<number|null>} Rate value or null if fetch fails
 */
const fetchSingleRate = async (seriesId) => {
  try {
    const response = await fetch(`${FRED_BASE_URL}${seriesId}`);

    if (!response.ok) {
      console.warn(`FRED API returned ${response.status} for ${seriesId}`);
      return null;
    }

    const csvText = await response.text();
    return parseFredCsv(csvText);
  } catch (error) {
    console.warn(`Failed to fetch ${seriesId}:`, error.message);
    return null;
  }
};

/**
 * Get cached rates from localStorage if they exist and are fresh.
 * Returns null if any rate is stale or cache is empty.
 * @returns {Object|null} Cached rates or null if stale/missing
 */
export const getCachedRates = () => {
  const cached = getRates();
  if (!cached || !cached.rates || !cached.timestamps) return null;

  // Check each rate individually against its own expiry
  for (const rateType of Object.keys(FRED_SERIES)) {
    const timestamp = cached.timestamps[rateType];
    const maxAge = CACHE_EXPIRY_HOURS[rateType];

    if (isCacheStale(timestamp, maxAge)) {
      return null;
    }
  }

  return cached.rates;
};

/**
 * Fetch all four interest rates from FRED API.
 * Validates each rate before returning.
 * @returns {Promise<Object>} Rate values keyed by rate type
 */
export const fetchAllRates = async () => {
  // Check cache first
  const cached = getCachedRates();
  if (cached) {
    return { success: true, rates: cached, fromCache: true };
  }

  // Fetch all rates in parallel
  const [mortgage, federal_funds, credit_card, auto_loan] = await Promise.all([
    fetchSingleRate(FRED_SERIES.mortgage),
    fetchSingleRate(FRED_SERIES.federal_funds),
    fetchSingleRate(FRED_SERIES.credit_card),
    fetchSingleRate(FRED_SERIES.auto_loan),
  ]);

  // Check if any rate failed to fetch
  const rates = { mortgage, federal_funds, credit_card, auto_loan };
  const failedRates = Object.entries(rates)
    .filter(([, value]) => value === null)
    .map(([key]) => key);

  if (failedRates.length > 0) {
    return {
      success: false,
      error: `Failed to fetch rates: ${failedRates.join(', ')}`,
      rates: null,
    };
  }

  // Save to cache with individual timestamps
  const timestamps = {};
  for (const rateType of Object.keys(FRED_SERIES)) {
    timestamps[rateType] = Date.now();
  }

  saveRates(rates, timestamps);

  return { success: true, rates, fromCache: false };
};

/**
 * Fetch individual rate types
 */
export const fetchMortgageRate = async () => {
  return fetchSingleRate(FRED_SERIES.mortgage);
};

export const fetchFederalFundsRate = async () => {
  return fetchSingleRate(FRED_SERIES.federal_funds);
};

export const fetchCreditCardRate = async () => {
  return fetchSingleRate(FRED_SERIES.credit_card);
};

export const fetchAutoLoanRate = async () => {
  return fetchSingleRate(FRED_SERIES.auto_loan);
};

export default {
  fetchAllRates,
  fetchMortgageRate,
  fetchFederalFundsRate,
  fetchCreditCardRate,
  fetchAutoLoanRate,
  getCachedRates,
  isCacheStale,
  parseFredCsv,
};
