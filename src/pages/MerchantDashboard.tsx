import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import AdminDashboard from './AdminDashboard'

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopStatus, setShopStatus] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<{
    inventoryCount: number;
    activeReservations: number;
    upcomingTournaments: number;
    pendingRequests: number;
    subscriberCount: number;
  } | null>(null)
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

      // Load dashboard stats if shop is active
      if (status.active) {
        await loadDashboardStats()
      }
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

  const loadDashboardStats = async () => {
    try {
      const stats = await merchantService.getDashboardStats()
      setDashboardStats(stats)
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err)
      // Don't set error state for stats, just log it
      // Stats are not critical for the dashboard to function
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
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

            {/* Quick Stats - Scrollable Horizontal */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex-shrink-0 w-48 bg-green-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-800">Inventario</h3>
                    <span className="text-2xl">📦</span>
                  </div>
                  <p className="text-4xl font-bold text-green-700">{dashboardStats?.inventoryCount ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">Carte totali</p>
                </div>

                <div className="flex-shrink-0 w-48 bg-blue-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-800">Prenotazioni</h3>
                    <span className="text-2xl">🎫</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-700">{dashboardStats?.activeReservations ?? 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Attive</p>
                </div>

                <div className="flex-shrink-0 w-48 bg-purple-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800">Tornei</h3>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-4xl font-bold text-purple-700">{dashboardStats?.upcomingTournaments ?? 0}</p>
                  <p className="text-xs text-purple-600 mt-1">In programma</p>
                </div>

                <div className="flex-shrink-0 w-48 bg-amber-50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-amber-800">Richieste</h3>
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-4xl font-bold text-amber-700">{dashboardStats?.pendingRequests ?? 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Da gestire</p>
                </div>

                <div className="flex-shrink-0 w-48 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-indigo-800">Iscritti</h3>
                    <span className="text-2xl">🔔</span>
                  </div>
                  <p className="text-4xl font-bold text-indigo-700">{dashboardStats?.subscriberCount ?? 0}</p>
                  <p className="text-xs text-indigo-600 mt-1">Abbonati alle notifiche</p>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
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
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
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
                  Crea e gestisci tornei per i tuoi clienti, gestendo anche i partecipanti
                </p>
                <button
                  onClick={() => navigate('/merchant/tournaments')}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105 mb-3"
                >
                  Gestisci Tornei →
                </button>
                <button
                  onClick={() => navigate('/merchant/tournament-requests')}
                  className="w-full border border-orange-200 text-orange-700 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all"
                >
                  Richieste Tornei ⏱️
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
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
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
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
                >
                  Gestisci Iscritti →
                </button>
              </div>

              {/* News Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">📰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Notizie
                </h3>
                <p className="text-gray-600 mb-6">
                  Pubblica notizie, offerte e aggiornamenti per i tuoi clienti
                </p>
                <button
                  onClick={() => navigate('/merchant/news')}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
                >
                  Gestisci Notizie →
                </button>
              </div>

              {/* Shop Management Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gestione Negozio
                </h3>
                <p className="text-gray-600 mb-6">
                  Modifica informazioni, foto, contatti e impostazioni del negozio
                </p>
                <button
                  onClick={() => navigate('/merchant/settings')}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-105"
                >
                  Configura Negozio →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
