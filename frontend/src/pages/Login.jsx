import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { login, register } from '../services/api';
import '../styles/auth.css';

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  };

  return (
    <div className="auth">
      <NavBar />
      <div className="container page">
        <div className="auth-card card">
          <h1 className="auth-heading">
            {isRegister ? 'Create an account' : 'Log in'}
          </h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 8 : undefined}
                required
              />
              {isRegister && (
                <span className="auth-hint">At least 8 characters</span>
              )}
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Please wait…'
                : isRegister
                  ? 'Create account'
                  : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to BudgetProj?'}{' '}
            <button type="button" className="auth-link" onClick={toggleMode}>
              {isRegister ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
