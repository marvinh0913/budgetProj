/**
 * Unit tests for fred.js
 * Tests CSV parsing, cache staleness logic, and rate fetching.
 * Mocks fetch to avoid hitting the real FRED API during tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isCacheStale,
  parseFredCsv,
  getCachedRates,
  fetchAllRates,
} from '../../src/services/fred';
import { saveRates, clearRates } from '../../src/services/storage';

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
  mortgage: Date.now() - 1000 * 60 * 60 * 25,    // 25 hours ago
  federal_funds: Date.now() - 1000 * 60 * 60 * 25,
  credit_card: Date.now() - 1000 * 60 * 60 * 25,
  auto_loan: Date.now() - 1000 * 60 * 60 * 25,
};

// Sample FRED CSV response
const SAMPLE_CSV = `DATE,MORTGAGE30US
2026-07-10,6.59
2026-07-03,6.61
2026-06-26,6.72
`;

const MISSING_VALUE_CSV = `DATE,MORTGAGE30US
2026-07-10,.
2026-07-03,6.61
`;

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ─── isCacheStale ─────────────────────────────────────────────────────────────

describe('isCacheStale', () => {
  it('returns true if timestamp is null', () => {
    expect(isCacheStale(null, 24)).toBe(true);
  });

  it('returns true if timestamp is undefined', () => {
    expect(isCacheStale(undefined, 24)).toBe(true);
  });

  it('returns false if cache is fresh', () => {
    const oneHourAgo = Date.now() - 1000 * 60 * 60;
    expect(isCacheStale(oneHourAgo, 24)).toBe(false);
  });

  it('returns true if cache is older than maxAgeHours', () => {
    const twentyFiveHoursAgo = Date.now() - 1000 * 60 * 60 * 25;
    expect(isCacheStale(twentyFiveHoursAgo, 24)).toBe(true);
  });

  it('returns false if cache is exactly at maxAgeHours', () => {
    const exactlyTwentyFourHoursAgo = Date.now() - 1000 * 60 * 60 * 24;
    expect(isCacheStale(exactlyTwentyFourHoursAgo, 24)).toBe(false);
  });

  it('respects different maxAgeHours values', () => {
    const tenHoursAgo = Date.now() - 1000 * 60 * 60 * 10;
    expect(isCacheStale(tenHoursAgo, 24)).toBe(false);  // fresh for 24hr cache
    expect(isCacheStale(tenHoursAgo, 5)).toBe(true);    // stale for 5hr cache
  });
});

// ─── parseFredCsv ─────────────────────────────────────────────────────────────

describe('parseFredCsv', () => {
  it('parses valid CSV and returns most recent value', () => {
    const result = parseFredCsv(SAMPLE_CSV);
    expect(result).toBe(6.59);
  });

  it('returns null for empty string', () => {
    expect(parseFredCsv('')).toBeNull();
  });

  it('returns null for header only', () => {
    expect(parseFredCsv('DATE,MORTGAGE30US')).toBeNull();
  });

  it('returns null for missing value indicated by dot', () => {
    expect(parseFredCsv(MISSING_VALUE_CSV)).toBeNull();
  });

  it('returns null for malformed CSV', () => {
    expect(parseFredCsv('not,valid,csv,data')).toBeNull();
  });

  it('parses float values correctly', () => {
    const csv = `DATE,FEDFUNDS\n2026-07-10,5.25\n2026-06-10,5.33`;
    expect(parseFredCsv(csv)).toBe(5.25);
  });

  it('returns null for NaN value', () => {
    const csv = `DATE,MORTGAGE30US\n2026-07-10,abc`;
    expect(parseFredCsv(csv)).toBeNull();
  });
});

// ─── getCachedRates ───────────────────────────────────────────────────────────

describe('getCachedRates', () => {
  it('returns null if no rates cached', () => {
    const result = getCachedRates();
    expect(result).toBeNull();
  });

  it('returns rates if cache is fresh', () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);
    const result = getCachedRates();
    expect(result).toEqual(SAMPLE_RATES);
  });

  it('returns null if cache is stale', () => {
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);
    const result = getCachedRates();
    expect(result).toBeNull();
  });

  it('returns null if rates exist but timestamps missing', () => {
    saveRates(SAMPLE_RATES, null);
    const result = getCachedRates();
    expect(result).toBeNull();
  });

  it('returns correct rate values from cache', () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);
    const result = getCachedRates();
    expect(result.mortgage).toBe(6.59);
    expect(result.federal_funds).toBe(5.25);
    expect(result.credit_card).toBe(21.47);
    expect(result.auto_loan).toBe(7.89);
  });
});

// ─── fetchAllRates ────────────────────────────────────────────────────────────

describe('fetchAllRates', () => {
  it('returns cached rates without fetching if cache is fresh', async () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await fetchAllRates();
    expect(result.success).toBe(true);
    expect(result.fromCache).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches from FRED if cache is stale', async () => {
    saveRates(SAMPLE_RATES, STALE_TIMESTAMPS);
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_CSV,
    });
    const result = await fetchAllRates();
    expect(result.success).toBe(true);
    expect(result.fromCache).toBe(false);
  });

  it('returns error if fetch fails', async () => {
    clearRates();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '',
    });
    const result = await fetchAllRates();
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('saves fetched rates to cache', async () => {
    clearRates();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_CSV,
    });
    await fetchAllRates();
    const cached = getCachedRates();
    expect(cached).not.toBeNull();
  });

  it('returns fromCache false when fetching fresh data', async () => {
    clearRates();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_CSV,
    });
    const result = await fetchAllRates();
    expect(result.fromCache).toBe(false);
  });
});
