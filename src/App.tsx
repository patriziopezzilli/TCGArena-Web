import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import MerchantOnboarding from './pages/MerchantOnboarding'
import MerchantLogin from './pages/MerchantLogin'
import MerchantDashboard from './pages/MerchantDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/merchant/register" element={<MerchantOnboarding />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
