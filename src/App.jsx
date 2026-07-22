import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}

export default App;
