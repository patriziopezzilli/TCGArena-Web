import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WaitingList from './pages/WaitingList'
import MerchantLogin from './pages/MerchantLogin'
import MerchantOnboarding from './pages/MerchantOnboarding'
import MerchantDashboard from './pages/MerchantDashboard'
import MerchantInventory from './pages/MerchantInventory'
import MerchantReservations from './pages/MerchantReservations'
import MerchantTournaments from './pages/MerchantTournaments'
import MerchantRequests from './pages/MerchantRequests'
import MerchantSettings from './pages/MerchantSettings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/waiting-list" element={<WaitingList />} />
        {/* Hidden routes - accessible only via direct URL */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/register" element={<MerchantOnboarding />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/merchant/inventory" element={<MerchantInventory />} />
        <Route path="/merchant/reservations" element={<MerchantReservations />} />
        <Route path="/merchant/tournaments" element={<MerchantTournaments />} />
        <Route path="/merchant/requests" element={<MerchantRequests />} />
        <Route path="/merchant/settings" element={<MerchantSettings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
