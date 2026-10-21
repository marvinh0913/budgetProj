import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
