/**
 * Interest rates for BudgetProj.
 * Rates come from the backend (GET /rates), which refreshes them from FRED
 * every Friday. The last good response is saved in localStorage and used
 * only as a fallback when the backend can't be reached.
 */

import { getRates as fetchRatesFromApi } from './api';
import { saveRates, getRates as getSavedRates } from './storage';

const RATE_TYPES = ['mortgage', 'federal_funds', 'credit_card', 'auto_loan'];

/**
 * Load the current rates as plain numbers, e.g. { mortgage: 6.3, ... }.
 * @returns {Promise<Object>} { success, rates, fromCache } or { success: false, error }
 */
export const fetchAllRates = async () => {
  try {
    const data = await fetchRatesFromApi();

    const rates = {};
    for (const type of RATE_TYPES) {
      if (!data[type]) throw new Error(`Missing ${type} rate`);
      rates[type] = data[type].value;
    }

    saveRates(rates, { savedAt: Date.now() });
    return { success: true, rates, fromCache: false };
  } catch (error) {
    const saved = getSavedRates();
    if (saved?.rates) {
      return { success: true, rates: saved.rates, fromCache: true };
    }
    return { success: false, error: error.message, rates: null };
  }
};

export default { fetchAllRates };
