import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../services/api';
import '../styles/navbar.css';
import {
  CalculatorIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

function NavBar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const logoUrl = import.meta.env.DEV ? '/logo.png' : '/budgetProj/logo.png';

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BudgetProj
          <img src={logoUrl} alt="BudgetProj logo" className="navbar-logo" />
        </Link>
        <div className="navbar-links">
          <Link to="/affordability" className="navbar-faq-link">
            <CalculatorIcon className="navbar-icon" />
            Affordability
          </Link>
          <Link to="/faq" className="navbar-faq-link">
            <QuestionMarkCircleIcon className="navbar-icon" />
            FAQ
          </Link>
          {loggedIn ? (
            <button
              type="button"
              className="navbar-faq-link navbar-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            <Link to="/login" className="navbar-faq-link">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
