import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Affordability from './pages/Affordability';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/login" element={<Login />} />
      <Route path="/affordability" element={<Affordability />} />
    </Routes>
  );
}

export default App;
