import { Link } from 'react-router-dom';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import '../styles/navbar.css';

function NavBar() {
  return (
    <nav className="navbar" role="navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BudgetProj
        </Link>
        <div className="navbar-links">
          <Link to="/faq" className="navbar-faq-link">
            <QuestionMarkCircleIcon className="navbar-icon" />
            FAQ
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
