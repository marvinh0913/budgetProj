/**
 * Tests for FAQ page component.
 * Covers rendering of all FAQ sections and navigation.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FAQ from '../../src/pages/FAQ';

const renderFAQ = () => {
  return render(
    <BrowserRouter>
      <FAQ />
    </BrowserRouter>
  );
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('FAQ rendering', () => {
  it('renders without crashing', () => {
    renderFAQ();
    expect(screen.getByText(/frequently asked questions/i)).toBeTruthy();
  });

  it('renders navbar', () => {
    renderFAQ();
    expect(screen.getByRole('navigation')).toBeTruthy();
  });

  it('renders what is this app section', () => {
    renderFAQ();
    expect(screen.getByText(/what is this app/i)).toBeTruthy();
  });

  it('renders FRED data section', () => {
    renderFAQ();
    expect(screen.getByText(/where does the rate data come from/i)).toBeTruthy();
  });

  it('renders 50/30/20 rule section', () => {
    renderFAQ();
    expect(screen.getByRole('heading', { name: /50\/30\/20/i })).toBeTruthy();
  });

  it('renders data storage section', () => {
    renderFAQ();
    expect(screen.getByText(/is my data saved/i)).toBeTruthy();
  });

  it('renders calculations section', () => {
    renderFAQ();
    expect(screen.getByText(/how are calculations done/i)).toBeTruthy();
  });

  it('renders cache section', () => {
    renderFAQ();
    expect(screen.getByText(/what does cache mean/i)).toBeTruthy();
  });

  it('renders back to home link', () => {
    renderFAQ();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeTruthy();
  });
});