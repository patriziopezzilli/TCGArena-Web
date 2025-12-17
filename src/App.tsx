import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ToastContainer'
import Landing from './pages/Landing'
import WaitingList from './pages/WaitingList'
import MerchantLogin from './pages/MerchantLogin'
import MerchantOnboarding from './pages/MerchantOnboarding'
import MerchantDashboard from './pages/MerchantDashboard'
import MerchantInventory from './pages/MerchantInventory'
import MerchantReservations from './pages/MerchantReservations'
import MerchantTournaments from './pages/MerchantTournaments'
import TournamentParticipants from './pages/TournamentParticipants'
import MerchantRequests from './pages/MerchantRequests'
import MerchantSettings from './pages/MerchantSettings'
import MerchantSubscribers from './pages/MerchantSubscribers'
import ShopNews from './pages/ShopNews'
import TournamentRequests from './pages/TournamentRequests'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <ToastProvider>
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
          <Route path="/merchant/tournaments/:tournamentId/participants" element={<TournamentParticipants />} />
          <Route path="/merchant/tournament-requests" element={<TournamentRequests />} />
          <Route path="/merchant/requests" element={<MerchantRequests />} />
          <Route path="/merchant/settings" element={<MerchantSettings />} />
          <Route path="/merchant/subscribers" element={<MerchantSubscribers />} />
          <Route path="/merchant/news" element={<ShopNews />} />
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
