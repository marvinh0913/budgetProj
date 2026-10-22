import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/services/api', () => ({ getRates: vi.fn() }));

import { getRates } from '../../src/services/api';
import { fetchAllRates } from '../../src/services/fred';

const API_RATES = {
  mortgage: { series_id: 'MORTGAGE30US', value: 6.3, observation_date: '2026-10-15' },
  federal_funds: { series_id: 'FEDFUNDS', value: 4.1, observation_date: '2026-09-01' },
  credit_card: { series_id: 'TERMCBCCALLNS', value: 21.4, observation_date: '2026-08-01' },
  auto_loan: { series_id: 'TERMCBAUTO48NS', value: 7.47, observation_date: '2026-08-01' },
};

const NUMBERS = { mortgage: 6.3, federal_funds: 4.1, credit_card: 21.4, auto_loan: 7.47 };

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('fetchAllRates', () => {
  it('returns backend rates as plain numbers', async () => {
    getRates.mockResolvedValue(API_RATES);
    expect(await fetchAllRates()).toEqual({
      success: true,
      rates: NUMBERS,
      fromCache: false,
    });
  });

  it('falls back to the last saved rates when the backend fails', async () => {
    getRates.mockResolvedValueOnce(API_RATES);
    await fetchAllRates(); // saves the rates

    getRates.mockRejectedValueOnce(new Error('offline'));
    expect(await fetchAllRates()).toEqual({
      success: true,
      rates: NUMBERS,
      fromCache: true,
    });
  });

  it('fails when the backend fails and nothing is saved', async () => {
    getRates.mockRejectedValue(new Error('offline'));
    const result = await fetchAllRates();
    expect(result.success).toBe(false);
    expect(result.rates).toBeNull();
  });

  it('treats a response with a missing rate as a failure', async () => {
    const { auto_loan, ...incomplete } = API_RATES; // eslint-disable-line no-unused-vars
    getRates.mockResolvedValue(incomplete);
    const result = await fetchAllRates();
    expect(result.success).toBe(false);
  });
});
