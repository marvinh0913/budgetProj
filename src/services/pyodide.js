/**
 * Pyodide service for BudgetProj.
 * Handles lazy initialization of the Pyodide runtime and
 * bridges JavaScript data to Python calculation functions.
 * Pyodide only loads when the user first triggers a calculation.
 */

// Pyodide instance — null until first calculation is triggered
let pyodideInstance = null;
let isLoading = false;

/**
 * Check if Pyodide has been initialized and is ready to use.
 * @returns {boolean} True if Pyodide is ready
 */
export const isReady = () => pyodideInstance !== null;

/**
 * Load Python source files into Pyodide.
 * @param {Object} pyodide - Initialized Pyodide instance
 */
const loadPythonFiles = async (pyodide) => {
  const files = [
    '/src/python/validation.py',
    '/src/python/calculations.py',
    '/src/python/interest.py',
  ];

  for (const file of files) {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load Python file: ${file}`);
    }
    const code = await response.text();
    pyodide.runPython(code);
  }
};

/**
 * Initialize Pyodide runtime lazily.
 * Only loads when first called — subsequent calls return
 * the existing instance without reloading.
 * @returns {Promise<Object>} Initialized Pyodide instance
 */
export const initializePyodide = async () => {
  // Return existing instance if already loaded
  if (pyodideInstance) return pyodideInstance;

  // Prevent multiple simultaneous load attempts
  if (isLoading) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (pyodideInstance) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    return pyodideInstance;
  }

  try {
    isLoading = true;

    // Load Pyodide runtime
    const { loadPyodide } = await import('pyodide');
    pyodideInstance = await loadPyodide();

    // Load Python calculation files
    await loadPythonFiles(pyodideInstance);

    return pyodideInstance;
  } catch (error) {
    isLoading = false;
    pyodideInstance = null;
    throw new Error(`Failed to initialize Pyodide: ${error.message}`);
  } finally {
    isLoading = false;
  }
};

/**
 * Run budget calculations on a list of transactions.
 * Initializes Pyodide if not already loaded.
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<Object>} Budget summary from Python calculations
 */
export const runCalculations = async (transactions) => {
  try {
    const pyodide = await initializePyodide();

    // Pass transactions to Python as JSON
    pyodide.globals.set('transactions_json', JSON.stringify(transactions));

    const result = pyodide.runPython(`
      import json
      transactions = json.loads(transactions_json)
      summary = get_budget_summary(transactions)
      json.dumps(summary)
    `);

    return { success: true, data: JSON.parse(result) };
  } catch (error) {
    return {
      success: false,
      error: `Calculation failed: ${error.message}`,
    };
  }
};

/**
 * Run a specific interest calculation.
 * @param {string} type - Calculation type: mortgage, credit_card, auto_loan, savings
 * @param {Object} data - Input data for the calculation
 * @returns {Promise<Object>} Calculation result from Python
 */
export const runInterestCalculation = async (type, data) => {
  try {
    const pyodide = await initializePyodide();

    pyodide.globals.set('calc_type', type);
    pyodide.globals.set('calc_data_json', JSON.stringify(data));

    const result = pyodide.runPython(`
      import json
      calc_data = json.loads(calc_data_json)

      if calc_type == 'mortgage':
          result = calculate_mortgage_payment(
              calc_data['loan_amount'],
              calc_data['rate'],
              calc_data['term_years']
          )
      elif calc_type == 'mortgage_affordability':
          result = calculate_mortgage_affordability(
              calc_data['transactions'],
              calc_data['rate'],
              calc_data['term_years']
          )
      elif calc_type == 'credit_card':
          result = calculate_credit_card_cost(
              calc_data['balance'],
              calc_data['rate']
          )
      elif calc_type == 'auto_loan':
          result = calculate_auto_loan_payment(
              calc_data['principal'],
              calc_data['rate'],
              calc_data['term_months']
          )
      elif calc_type == 'savings':
          result = calculate_savings_growth(
              calc_data['principal'],
              calc_data['monthly_deposit'],
              calc_data['rate'],
              calc_data['months']
          )
      else:
          result = {'error': f'Unknown calculation type: {calc_type}'}

      json.dumps(result)
    `);

    return { success: true, data: JSON.parse(result) };
  } catch (error) {
    return {
      success: false,
      error: `Interest calculation failed: ${error.message}`,
    };
  }
};

export default {
  initializePyodide,
  runCalculations,
  runInterestCalculation,
  isReady,
};
