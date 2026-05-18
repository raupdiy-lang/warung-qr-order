import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { CustomerMenuPage } from './pages/customer/CustomerMenuPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { KitchenDashboardPage } from './pages/kitchen/KitchenDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/menu' replace />} />
        <Route path='/menu' element={<CustomerMenuPage />} />
        <Route path='/admin' element={<AdminDashboardPage />} />
        <Route path='/kitchen' element={<KitchenDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
