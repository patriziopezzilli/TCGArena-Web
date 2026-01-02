import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ToastContainer'
import Landing from './pages/Landing'
import WaitingList from './pages/WaitingList'
import MerchantLogin from './pages/MerchantLogin'
import MerchantRegister from './pages/MerchantRegister'
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
import ShopSuggestions from './components/admin/ShopSuggestions'
import QrCodeLanding from './pages/QrCodeLanding'
import ApiSdk from './pages/ApiSdk'
// Share pages
import ShareShop from './pages/ShareShop'
import ShareTournament from './pages/ShareTournament'
import ShareEvent from './pages/ShareEvent'
import ShareCard from './pages/ShareCard'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/waiting-list" element={<WaitingList />} />
          {/* API SDK Landing Page */}
          <Route path="/api/sdk" element={<ApiSdk />} />
          {/* Hidden routes - accessible only via direct URL */}
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant/register" element={<MerchantRegister />} />
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
          <Route path="/admin/shop-suggestions" element={<ShopSuggestions />} />
          {/* Landing pages */}
          <Route path="/qr-code" element={<QrCodeLanding />} />
          {/* Share pages - public, no auth required */}
          <Route path="/share/shop/:id" element={<ShareShop />} />
          <Route path="/share/tournament/:id" element={<ShareTournament />} />
          <Route path="/share/event/:id" element={<ShareEvent />} />
          <Route path="/share/card/:id" element={<ShareCard />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
