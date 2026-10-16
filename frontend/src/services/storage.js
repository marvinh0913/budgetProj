/**
 * Storage service for BudgetProj.
 * Handles all localStorage reads and writes for transactions,
 * budgets, and cached FRED rates.
 */

const KEYS = {
  TRANSACTIONS: 'budgetproj_transactions',
  BUDGETS: 'budgetproj_budgets',
  RATES: 'budgetproj_rates',
};

/**
 * Check if localStorage is available in the current browser.
 * @returns {boolean} True if localStorage is available
 */
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely write data to localStorage.
 * @param {string} key - localStorage key
 * @param {*} data - Data to store (will be JSON stringified)
 * @returns {Object} - { success: true } or { success: false, error: string }
 */
const setItem = (key, data) => {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error:
        'localStorage is unavailable. The app requires localStorage to function.',
    };
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      return {
        success: false,
        error:
          'Storage is full. Please refresh the page and clear your browser data.',
      };
    }
    return {
      success: false,
      error: `Failed to save data: ${e.message}`,
    };
  }
};

/**
 * Safely read data from localStorage.
 * @param {string} key - localStorage key
 * @returns {*} Parsed data or null if not found
 */
const getItem = (key) => {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

/**
 * Safely remove an item from localStorage.
 * @param {string} key - localStorage key
 */
const removeItem = (key) => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail on remove
  }
};

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * Save transactions array to localStorage.
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} - { success: true } or { success: false, error: string }
 */
export const saveTransactions = (transactions) => {
  return setItem(KEYS.TRANSACTIONS, transactions);
};

/**
 * Retrieve transactions from localStorage.
 * @returns {Array} Array of transactions or empty array if none found
 */
export const getTransactions = () => {
  return getItem(KEYS.TRANSACTIONS) || [];
};

/**
 * Remove transactions from localStorage.
 */
export const clearTransactions = () => {
  removeItem(KEYS.TRANSACTIONS);
};

// ─── Budgets ─────────────────────────────────────────────────────────────────

/**
 * Save budget data to localStorage.
 * @param {Object} budgets - Budget data object
 * @returns {Object} - { success: true } or { success: false, error: string }
 */
export const saveBudgets = (budgets) => {
  return setItem(KEYS.BUDGETS, budgets);
};

/**
 * Retrieve budget data from localStorage.
 * @returns {Object} Budget data or empty object if none found
 */
export const getBudgets = () => {
  return getItem(KEYS.BUDGETS) || {};
};

/**
 * Remove budget data from localStorage.
 */
export const clearBudgets = () => {
  removeItem(KEYS.BUDGETS);
};

// ─── Rates ───────────────────────────────────────────────────────────────────

/**
 * Save FRED rates with timestamps to localStorage.
 * @param {Object} rates - Rate values keyed by rate type
 * @param {Object} timestamps - Fetch timestamps keyed by rate type
 * @returns {Object} - { success: true } or { success: false, error: string }
 */
export const saveRates = (rates, timestamps) => {
  return setItem(KEYS.RATES, { rates, timestamps });
};

/**
 * Retrieve cached FRED rates from localStorage.
 * @returns {Object} - { rates, timestamps } or null if not found
 */
export const getRates = () => {
  return getItem(KEYS.RATES);
};

/**
 * Remove cached rates from localStorage.
 */
export const clearRates = () => {
  removeItem(KEYS.RATES);
};

// ─── Clear All ────────────────────────────────────────────────────────────────

/**
 * Clear all BudgetProj data from localStorage.
 */
export const clearAll = () => {
  removeItem(KEYS.TRANSACTIONS);
  removeItem(KEYS.BUDGETS);
  removeItem(KEYS.RATES);
};

export default {
  saveTransactions,
  getTransactions,
  clearTransactions,
  saveBudgets,
  getBudgets,
  clearBudgets,
  saveRates,
  getRates,
  clearRates,
  clearAll,
};
