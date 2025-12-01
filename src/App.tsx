import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WaitingList from './pages/WaitingList'
import MerchantLogin from './pages/MerchantLogin'
import MerchantOnboarding from './pages/MerchantOnboarding'
import MerchantDashboard from './pages/MerchantDashboard'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
