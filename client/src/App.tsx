import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BuyerDashboard from './pages/buyer/Dashboard'
import BuyerCatalog from './pages/buyer/Catalog'
import BuyerRFQs from './pages/buyer/RFQs'
import BuyerOrders from './pages/buyer/Orders'
import BuyerQuotations from './pages/buyer/Quotations'
import BuyerBuyAgain from './pages/buyer/BuyAgain'
import VendorDashboard from './pages/vendor/Dashboard'
import VendorRFQs from './pages/vendor/RFQs'
import VendorBids from './pages/vendor/Bids'
import VendorOrders from './pages/vendor/Orders'
import AdminDashboard from './pages/admin/Dashboard'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Buyer Routes */}
      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/buyer/catalog" element={<BuyerCatalog />} />
      <Route path="/buyer/rfqs" element={<BuyerRFQs />} />
      <Route path="/buyer/rfq/create" element={<div>Create RFQ</div>} />
      <Route path="/buyer/orders" element={<BuyerOrders />} />
      <Route path="/buyer/quotations" element={<BuyerQuotations />} />
      <Route path="/buyer/buy-again" element={<BuyerBuyAgain />} />
      <Route path="/buyer/upload" element={<div>Upload</div>} />

      {/* Vendor Routes */}
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      <Route path="/vendor/rfqs" element={<VendorRFQs />} />
      <Route path="/vendor/bids" element={<VendorBids />} />
      <Route path="/vendor/orders" element={<VendorOrders />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
