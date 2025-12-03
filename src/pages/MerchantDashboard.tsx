import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import AdminDashboard from './AdminDashboard'

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopStatus, setShopStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    const adminFlag = localStorage.getItem('is_admin')
    
    if (!token) {
      navigate('/merchant/login')
      return
    }

    // Check if admin
    if (adminFlag === 'true') {
      setIsAdmin(true)
      setLoading(false)
      return
    }

    loadShopStatus()
  }, [navigate])

  const loadShopStatus = async () => {
    try {
      const status = await merchantService.getShopStatus()
      setShopStatus(status)
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('merchant_token')
        navigate('/merchant/login')
      } else {
        setError('Errore nel caricamento dello status del negozio')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchant_token')
    localStorage.removeItem('merchant_user')
    localStorage.removeItem('is_admin')
    navigate('/merchant/login')
  }

  // Render admin dashboard if admin
  if (isAdmin) {
    return <AdminDashboard />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="text-primary hover:underline"
          >
            Torna al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🏪</span>
                TCG Arena Backoffice
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Benvenuto, {shopStatus?.user?.displayName || shopStatus?.user?.username}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/merchant/settings')}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
              >
                ⚙️ Impostazioni
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!shopStatus?.active ? (
          // Shop NOT Active - Show Pending Status
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Negozio in Attesa di Approvazione
              </h2>
              <p className="text-gray-600 mb-6">
                Il tuo negozio è stato registrato con successo ma non è ancora attivo.
                Il nostro team sta verificando le informazioni fornite.
              </p>
              
              <div className="bg-white rounded-lg p-6 text-left space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Informazioni Negozio:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nome Negozio</p>
                    <p className="text-gray-900 font-medium">{shopStatus?.shop?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Indirizzo</p>
                    <p className="text-gray-900 font-medium">{shopStatus?.shop?.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefono</p>
                    <p className="text-gray-900 font-medium">{shopStatus?.shop?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo</p>
                    <p className="text-gray-900 font-medium">{shopStatus?.shop?.type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Status</p>
                    <p className="text-amber-600 font-medium">⏳ In attesa di verifica</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Riceverai una notifica via email quando il negozio sarà attivato.
              </p>
            </div>
          </div>
        ) : (
          // Shop Active - Show Full Dashboard
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Dashboard {shopStatus?.shop?.name}
              </h2>
              <p className="text-gray-600">
                Gestisci il tuo negozio, inventario, tornei e richieste
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-700">Inventario</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-4xl font-bold text-green-600">0</p>
                <p className="text-xs text-green-600 mt-1">Carte totali</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-700">Prenotazioni</h3>
                  <span className="text-2xl">🎫</span>
                </div>
                <p className="text-4xl font-bold text-blue-600">0</p>
                <p className="text-xs text-blue-600 mt-1">Attive</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-700">Tornei</h3>
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-4xl font-bold text-purple-600">0</p>
                <p className="text-xs text-purple-600 mt-1">In programma</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-amber-700">Richieste</h3>
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-4xl font-bold text-amber-600">0</p>
                <p className="text-xs text-amber-600 mt-1">Da gestire</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-indigo-700">Iscritti</h3>
                  <span className="text-2xl">🔔</span>
                </div>
                <p className="text-4xl font-bold text-indigo-600">0</p>
                <p className="text-xs text-indigo-600 mt-1">Abbonati alle notifiche</p>
              </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inventory Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gestione Inventario
                </h3>
                <p className="text-gray-600 mb-6">
                  Aggiungi, modifica ed elimina carte dal tuo inventario
                </p>
                <button
                  onClick={() => navigate('/merchant/inventory')}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Gestisci Inventario →
                </button>
              </div>

              {/* Reservations Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🎫</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Prenotazioni
                </h3>
                <p className="text-gray-600 mb-6">
                  Gestisci le prenotazioni e scansiona i QR per i ritiri
                </p>
                <button
                  onClick={() => navigate('/merchant/reservations')}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Vedi Prenotazioni →
                </button>
              </div>

              {/* Tournaments Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tornei
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea e gestisci tornei per i tuoi clienti
                </p>
                <button
                  onClick={() => navigate('/merchant/tournaments')}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Gestisci Tornei →
                </button>
              </div>

              {/* Requests Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Richieste Clienti
                </h3>
                <p className="text-gray-600 mb-6">
                  Rispondi alle richieste di disponibilità, valutazioni e altro
                </p>
                <button
                  onClick={() => navigate('/merchant/requests')}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Vedi Richieste →
                </button>
              </div>

              {/* Subscribers Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Iscritti alle Notifiche
                </h3>
                <p className="text-gray-600 mb-6">
                  Gestisci gli iscritti alle notifiche e invia aggiornamenti
                </p>
                <button
                  onClick={() => navigate('/merchant/subscribers')}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Gestisci Iscritti →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
