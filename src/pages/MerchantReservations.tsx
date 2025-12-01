import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'

interface Reservation {
  id: string
  userId: string
  userName: string
  cardId: string
  cardName: string
  shopId: string
  shopName: string
  quantity: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
  qrCode: string
  expiresAt: string
  createdAt: string
}

export default function MerchantReservations() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [shopId, setShopId] = useState<string>('')

  useEffect(() => {
    const user = localStorage.getItem('merchant_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.shopId) {
        setShopId(userData.shopId)
        loadReservations(userData.shopId)
      }
    }
  }, [])

  const loadReservations = async (shopId: string, status?: string) => {
    try {
      setLoading(true)
      const data = await merchantService.getReservations(shopId, status)
      setReservations(data.reservations || [])
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateQR = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await merchantService.validateReservation(shopId, qrCode)
      alert(`Prenotazione validata con successo!\nCliente: ${result.userName}\nCarta: ${result.cardName}`)
      setShowQRModal(false)
      setQrCode('')
      loadReservations(shopId, statusFilter)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Errore durante la validazione del QR code')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      READY_FOR_PICKUP: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      CONFIRMED: 'Confermata',
      READY_FOR_PICKUP: 'Pronta per il Ritiro',
      COMPLETED: 'Completata',
      CANCELLED: 'Cancellata',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStats = () => {
    const pending = reservations.filter(r => r.status === 'PENDING').length
    const confirmed = reservations.filter(r => r.status === 'CONFIRMED').length
    const ready = reservations.filter(r => r.status === 'READY_FOR_PICKUP').length
    const completed = reservations.filter(r => r.status === 'COMPLETED').length
    return { pending, confirmed, ready, completed }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/merchant/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Torna alla Dashboard
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Gestione Prenotazioni</h1>
            </div>
            <button
              onClick={() => setShowQRModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📷 Scansiona QR Code
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-yellow-600 font-medium mb-1">In Attesa</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-medium mb-1">Confermate</p>
            <p className="text-3xl font-bold text-blue-900">{stats.confirmed}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Pronte</p>
            <p className="text-3xl font-bold text-green-900">{stats.ready}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 font-medium mb-1">Completate</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtra per stato:</label>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                loadReservations(shopId, e.target.value)
              }}
            >
              <option value="">Tutti gli stati</option>
              <option value="PENDING">In Attesa</option>
              <option value="CONFIRMED">Confermate</option>
              <option value="READY_FOR_PICKUP">Pronte per il Ritiro</option>
              <option value="COMPLETED">Completate</option>
              <option value="CANCELLED">Cancellate</option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nessuna prenotazione trovata</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{reservation.cardName}</h3>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Cliente: {reservation.userName} • Quantità: {reservation.quantity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Prenotata il {new Date(reservation.createdAt).toLocaleDateString('it-IT')}
                    </p>
                    {reservation.expiresAt && (
                      <p className="text-sm text-amber-600 mt-1">
                        ⏱ Scade il {new Date(reservation.expiresAt).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{reservation.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700">
                    QR Code: {reservation.qrCode}
                  </div>
                  <button
                    onClick={() => {
                      setQrCode(reservation.qrCode)
                      setShowQRModal(true)
                    }}
                    className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Valida
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Valida Prenotazione
            </h2>
            <form onSubmit={handleValidateQR}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inserisci o scansiona il QR Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="es: RSV-ABC123XYZ"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 In produzione, qui ci sarebbe un lettore QR integrato
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRModal(false)
                    setQrCode('')
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Valida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
