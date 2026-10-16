/**
 * Tests for NavBar component.
 * Covers rendering, navigation link, and FAQ icon.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../src/components/NavBar';

// Wrap with BrowserRouter since NavBar uses React Router links
const renderNavBar = () => {
  return render(
    <BrowserRouter>
      <NavBar />
    </BrowserRouter>
  );
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('NavBar rendering', () => {
  it('renders without crashing', () => {
    renderNavBar();
    expect(screen.getByRole('navigation')).toBeTruthy();
  });

  it('displays the app name', () => {
    renderNavBar();
    expect(screen.getByText('BudgetProj')).toBeTruthy();
  });

  it('renders FAQ link', () => {
    renderNavBar();
    expect(screen.getByText('FAQ')).toBeTruthy();
  });

  it('FAQ link points to correct path', () => {
    renderNavBar();
    const faqLink = screen.getByRole('link', { name: /faq/i });
    expect(faqLink.getAttribute('href')).toBe('/faq');
  });

  it('app name links to home page', () => {
    renderNavBar();
    const homeLink = screen.getByRole('link', { name: /budgetproj/i });
    expect(homeLink.getAttribute('href')).toBe('/');
  });
});