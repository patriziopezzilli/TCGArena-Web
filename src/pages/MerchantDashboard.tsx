import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopStatus, setShopStatus] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    if (!token) {
      navigate('/merchant/login')
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
    navigate('/merchant/login')
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">TCG Arena Backoffice</h1>
              <p className="text-sm text-gray-600 mt-1">
                Benvenuto, {shopStatus?.user?.displayName || shopStatus?.user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Inventario</h3>
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Carte totali</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Prenotazioni</h3>
                  <span className="text-blue-600">●</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Attive</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Tornei</h3>
                  <span className="text-purple-600">◆</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">In programma</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Richieste</h3>
                  <span className="text-amber-600">!</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Da gestire</p>
              </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inventory Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gestione Inventario
                </h3>
                <p className="text-gray-600 mb-4">
                  Aggiungi, modifica ed elimina carte dal tuo inventario
                </p>
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Gestisci Inventario
                </button>
              </div>

              {/* Reservations Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Prenotazioni
                </h3>
                <p className="text-gray-600 mb-4">
                  Gestisci le prenotazioni e scansiona i QR per i ritiri
                </p>
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Vedi Prenotazioni
                </button>
              </div>

              {/* Tournaments Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tornei
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea e gestisci tornei per i tuoi clienti
                </p>
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Gestisci Tornei
                </button>
              </div>

              {/* Requests Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Richieste Clienti
                </h3>
                <p className="text-gray-600 mb-4">
                  Rispondi alle richieste di disponibilità, valutazioni e altro
                </p>
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Vedi Richieste
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
