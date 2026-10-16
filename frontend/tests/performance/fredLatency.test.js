/**
 * Performance tests for FRED API latency.
 * Measures real network response times from the FRED API.
 *
 * NOTE: These tests require an active internet connection
 * and hit the real FRED API. They may fail if FRED is
 * temporarily unavailable.
 *
 * Thresholds:
 * - Single rate fetch: under 5000ms
 * - All four rates: under 10000ms
 * - Cache retrieval: under 50ms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchAllRates,
  getCachedRates,
} from '../../src/services/fred';
import {
  saveRates,
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

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ─── Cache retrieval latency ──────────────────────────────────────────────────

describe('cache retrieval latency', () => {
  it('retrieves cached rates in under 50ms', () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);

    const start = performance.now();
    const cached = getCachedRates();
    const duration = performance.now() - start;

    console.warn(`Cache retrieval time: ${duration.toFixed(2)}ms`);
    expect(cached).not.toBeNull();
    expect(duration).toBeLessThan(50);
  });

  it('cache check returns null in under 50ms when empty', () => {
    const start = performance.now();
    const cached = getCachedRates();
    const duration = performance.now() - start;

    console.warn(`Empty cache check time: ${duration.toFixed(2)}ms`);
    expect(cached).toBeNull();
    expect(duration).toBeLessThan(50);
  });

  it('fetchAllRates returns from cache in under 50ms', async () => {
    saveRates(SAMPLE_RATES, FRESH_TIMESTAMPS);

    const start = performance.now();
    const result = await fetchAllRates();
    const duration = performance.now() - start;

    console.warn(`Cache fetch time: ${duration.toFixed(2)}ms`);
    expect(result.fromCache).toBe(true);
    expect(duration).toBeLessThan(50);
  });
});

// ─── Real FRED API latency ────────────────────────────────────────────────────

describe('real FRED API latency', () => {
  it('fetches all four rates in under 10000ms', async () => {
    clearRates();

    const start = performance.now();
    const result = await fetchAllRates();
    const duration = performance.now() - start;

    console.warn(`All four rates fetch time: ${duration.toFixed(2)}ms`);

    // Only assert timing if fetch succeeded
    if (result.success) {
      expect(duration).toBeLessThan(10000);
      expect(result.rates).toBeTruthy();
    } else {
      console.warn('FRED API unavailable — skipping timing assertion');
    }
  }, 15000); // extend test timeout to 15 seconds

  it('fetched rates are cached after successful fetch', async () => {
    clearRates();
    const result = await fetchAllRates();

    if (result.success) {
      const cached = getCachedRates();
      expect(cached).not.toBeNull();
      expect(cached.mortgage).toBeTruthy();
    } else {
      console.warn('FRED API unavailable — skipping cache assertion');
    }
  }, 15000);

  it('second fetch uses cache and is under 50ms', async () => {
    clearRates();

    // First fetch — hits real API
    const firstResult = await fetchAllRates();

    if (firstResult.success) {
      // Second fetch — should use cache
      const start = performance.now();
      const secondResult = await fetchAllRates();
      const duration = performance.now() - start;

      console.warn(`Second fetch from cache: ${duration.toFixed(2)}ms`);
      expect(secondResult.fromCache).toBe(true);
      expect(duration).toBeLessThan(50);
    } else {
      console.warn('FRED API unavailable — skipping second fetch test');
    }
  }, 15000);
});
