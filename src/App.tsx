import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MerchantDashboard from './pages/MerchantDashboard';
import CustomerScanner from './pages/CustomerScanner';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/scanner" element={<CustomerScanner />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
