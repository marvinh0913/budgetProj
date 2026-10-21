import { describe, it, expect } from 'vitest';
import {
  buildScenarios,
  summarizeBudget,
} from '../../src/utils/budgetScenarios';

const TRANSACTIONS = [
  { id: 1, type: 'income', category: 'paycheck', amount: 5000 },
  { id: 2, type: 'expense', category: 'rent', amount: 1500 },
  { id: 3, type: 'expense', category: 'groceries', amount: 400 },
  { id: 4, type: 'expense', category: 'dining', amount: 300 },
  { id: 5, type: 'expense', category: 'savings', amount: 500 },
  { id: 6, type: 'expense', category: 'other', amount: 100 },
];

const RESULTS = {
  mortgage: { monthly_payment: 1680 },
  auto: { monthly_payment: 600 },
};

describe('summarizeBudget', () => {
  it('totals income and groups expenses', () => {
    expect(summarizeBudget(TRANSACTIONS)).toEqual({
      income: 5000,
      essentials: 1900,
      wants: 400, // dining plus "other"
      savings: 500,
      housing: 1500,
    });
  });

  it('handles an empty budget', () => {
    expect(summarizeBudget([]).income).toBe(0);
  });
});

describe('buildScenarios', () => {
  const scenarios = buildScenarios(summarizeBudget(TRANSACTIONS), RESULTS);

  it('builds current, home, and car scenarios', () => {
    expect(scenarios.map((s) => s.label)).toEqual([
      'Current budget',
      'With this home',
      'With this car',
    ]);
  });

  it('replaces rent with the mortgage payment', () => {
    const home = scenarios[1];
    expect(home.essentials).toBe(400); // 1900 minus 1500 rent
    expect(home.leftOver).toBe(5000 - (400 + 400 + 500 + 1680));
  });

  it('adds the car payment on top of current spending', () => {
    expect(scenarios[2].leftOver).toBe(5000 - (1900 + 400 + 500 + 600));
  });

  it('skips scenarios with no affordable payment', () => {
    const none = buildScenarios(summarizeBudget(TRANSACTIONS), {
      mortgage: { monthly_payment: 0 },
      auto: { monthly_payment: 600 },
    });
    expect(none.map((s) => s.label)).toEqual(['Current budget', 'With this car']);
  });
});
