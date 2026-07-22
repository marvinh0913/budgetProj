/**
 * Integration tests for FRED API flow.
 * Tests the full pipeline: fetch rates from FRED →
 * validate response → cache in localStorage →
 * retrieve from cache on next load.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchAllRates,
  getCachedRates,
  isCacheStale,
  parseFredCsv,
} from '../../src/services/fred';
import {
  saveRates,
  getRates,
  clearRates,
} from '../../src/services/storage';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_RATES = {
  mortgage: 6.59,
  federal_funds: 5.25,
  credit_card: 21.47,
  auto_loan: 7.89,
};

const FRESH_TIMESTAMPS = {
  mortgage: Date.now(),
  federal_funds: Date.now(),
  credit_card: Date.now(),
  auto_loan: Date.now(),
};

const STALE_TIMESTAMPS = {
  mortgage: Date.now() - 1000 * 60 * 60 * 25,
  federal_funds: Date.now() - 1000 * 60 * 60 * 25,
  credit_card: Date.now() - 1000 * 60 * 60 * 25,
  auto_loan: Date.now() - 1000 * 60 * 60 * 25,
};

const MOCK_CSV = `DATE,MORTGAGE30US
2026-07-10,6.59
2026-07-03,6.61
`;

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ─── Fetch → Validate → Cache ─────────────────────────────────────────────────

describe('fetch rates and cache', () => {
  it('fetches rates and saves to localStorage', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    await fetchAllRates();
    const cached = getRates();
    expect(cached).not.toBeNull();
    expect(cached.rates).toBeTruthy();
  });

  it('saves timestamps alongside rates', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    await fetchAllRates();
    const cached = getRates();
    expect(cached.timestamps).toBeTruthy();
    expect(cached.timestamps.mortgage).toBeTruthy();
  });

  it('returns success after fetching', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    const result = await fetchAllRates();
    expect(result.success).toBe(true);
  });

  it('returns fromCache false on first fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    const result = await fetchAllRates();
    expect(result.fromCache).toBe(false);
  });

  it('returns error if FRED API is down', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '',
    });

    const result = await fetchAllRates();
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('does not cache rates if fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '',
    });

    await fetchAllRates();
    expect(getRates()).toBeNull();
  });
});

// ─── Cache retrieval ──────────────────────────────────────────────────────────

describe('retrieve from cache on subsequent loads', () => {
  it('returns cached rates without fetching if fresh', async () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);
    const fetchSpy = vi.spyOn(global, 'fetch');

    const result = await fetchAllRates();
    expect(result.success).toBe(true);
    expect(result.fromCache).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches fresh rates if cache is stale', async () => {
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    await fetchAllRates();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('updates cache after fetching stale rates', async () => {
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    await fetchAllRates();
    const cached = getRates();
    expect(isCacheStale(cached.timestamps.mortgage, 24)).toBe(false);
  });

  it('getCachedRates returns null after clearRates', () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);
    clearRates();
    expect(getCachedRates()).toBeNull();
  });
});

// ─── Parse → Validate → Use ───────────────────────────────────────────────────

describe('parse and validate FRED response', () => {
  it('parses CSV and extracts correct rate value', () => {
    const result = parseFredCsv(MOCK_CSV);
    expect(result).toBe(6.59);
  });

  it('returns null for malformed CSV', () => {
    expect(parseFredCsv('not valid csv')).toBeNull();
  });

  it('cached rates match parsed values after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });

    await fetchAllRates();
    const cached = getCachedRates();
    expect(cached.mortgage).toBe(parseFredCsv(MOCK_CSV));
  });
});

// ─── Multi step real world scenarios ─────────────────────────────────────────

describe('multi step real world FRED scenarios', () => {
  it('app loads → fetches rates → caches → uses cache on reload', async () => {
    // Step 1 — first app load, no cache
    expect(getCachedRates()).toBeNull();

    // Step 2 — fetch from FRED
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });
    const firstLoad = await fetchAllRates();
    expect(firstLoad.fromCache).toBe(false);

    // Step 3 — simulate reload, use cache
    vi.restoreAllMocks();
    const fetchSpy = vi.spyOn(global, 'fetch');
    const secondLoad = await fetchAllRates();
    expect(secondLoad.fromCache).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stale cache triggers refetch and updates cache', async () => {
    // Step 1 — save stale rates
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);
    expect(getCachedRates()).toBeNull();

    // Step 2 — fetch triggers because cache is stale
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ value: '6.59' }],
      }),
    });
    const result = await fetchAllRates();
    expect(result.fromCache).toBe(false);

    // Step 3 — cache is now fresh
    expect(getCachedRates()).not.toBeNull();
  });

  it('failed fetch leaves existing cache intact', async () => {
    // Step 1 — save fresh rates
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);

    // Step 2 — fetch fails
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '',
    });

    await fetchAllRates();

    // Step 3 — original rates still in localStorage
    const stored = getRates();
    expect(stored.rates).toEqual(SAMPLE_RATES);
  });
});
