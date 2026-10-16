/**
 * FRED API service for BudgetProj.
 * Rates are fetched at build time and baked into rates.json.
 * Implements per-rate caching based on each rate's update frequency.
 */

import { saveRates, getRates } from './storage';

const FRED_SERIES = {
  mortgage: 'MORTGAGE30US',
  federal_funds: 'FEDFUNDS',
  credit_card: 'TERMCBCCALLNS',
  auto_loan: 'TERMCBAUTO48NS',
};

const CACHE_EXPIRY_HOURS = {
  mortgage: 24,
  federal_funds: 168,
  credit_card: 720,
  auto_loan: 168,
};

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
 * Kept for test compatibility.
 * @param {string} csvText - Raw CSV text
 * @returns {number|null} Most recent rate value or null if parsing fails
 */
export const parseFredCsv = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return null;
    const parts = lines[1].split(',');
    if (parts.length < 2) return null;
    const value = parseFloat(parts[1]);
    if (isNaN(value) || parts[1].trim() === '.') return null;
    return value;
  } catch {
    return null;
  }
};

/**
 * Get cached rates from localStorage if they exist and are fresh.
 * @returns {Object|null} Cached rates or null if stale/missing
 */
export const getCachedRates = () => {
  const cached = getRates();
  if (!cached || !cached.rates || !cached.timestamps) return null;

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
 * Fetch all four interest rates from rates.json (baked in at build time).
 * Falls back to cached rates if available.
 * @returns {Promise<Object>} Rate values keyed by rate type
 */
export const fetchAllRates = async () => {
  const cached = getCachedRates();
  if (cached) {
    return { success: true, rates: cached, fromCache: true };
  }

  try {
    const ratesUrl = import.meta.env.DEV
      ? '/rates.json'
      : '/budgetProj/rates.json';

    const response = await fetch(ratesUrl);
    if (!response.ok) throw new Error('Failed to load rates');
    const data = await response.json();

    const rates = {
      mortgage: data.mortgage,
      federal_funds: data.federal_funds,
      credit_card: data.credit_card,
      auto_loan: data.auto_loan,
    };

    const timestamps = {};
    for (const rateType of Object.keys(rates)) {
      timestamps[rateType] = Date.now();
    }

    saveRates(rates, timestamps);

    return { success: true, rates, fromCache: false };
  } catch (error) {
    console.warn('Failed to load rates:', error.message);
    return { success: false, error: error.message, rates: null };
  }
};

export default {
  fetchAllRates,
  getCachedRates,
  isCacheStale,
  parseFredCsv,
};
