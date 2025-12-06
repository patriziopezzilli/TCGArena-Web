import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface Reservation {
  id: string
  card_id: string
  user_id: string
  merchant_id: string
  status: 'PENDING' | 'VALIDATED' | 'PICKED_UP' | 'EXPIRED' | 'CANCELLED'
  qr_code: string
  expires_at: string
  created_at: string
  validated_at?: string
  picked_up_at?: string
  updated_at?: string
  card_name?: string
  card_rarity?: string
  card_set?: string
  shop_name?: string
  shop_location?: string
  user_name?: string
}

export default function MerchantReservations() {
  const navigate = useNavigate()
  const { showToast } = useToast()
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
      showToast(`Prenotazione validata con successo!\nCliente: ${result.user_name}\nCarta: ${result.card_name}`, 'success')
      setShowQRModal(false)
      setQrCode('')
      loadReservations(shopId, statusFilter)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Errore durante la validazione del QR code', 'error')
    }
  }

  const handleManualConfirm = async (reservationId: string) => {
    try {
      const result = await merchantService.validateReservationById(shopId, reservationId)
      showToast(`Prenotazione confermata manualmente!\nCliente: ${result.user_name}\nCarta: ${result.card_name}`, 'success')
      loadReservations(shopId, statusFilter)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Errore durante la conferma manuale', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VALIDATED: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      VALIDATED: 'Validata',
      PICKED_UP: 'Ritirata',
      EXPIRED: 'Scaduta',
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
    const validated = reservations.filter(r => r.status === 'VALIDATED').length
    const pickedUp = reservations.filter(r => r.status === 'PICKED_UP').length
    const expired = reservations.filter(r => r.status === 'EXPIRED').length
    return { pending, validated, pickedUp, expired }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'text-red-600'
    if (diffMs <= 3600000) return 'text-orange-600' // meno di 1 ora
    return 'text-amber-600'
  }

  const getExpiryText = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    
    if (diffMs <= 0) {
      return 'Scaduta!'
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24)
      return `Scade tra ${diffDays} giorno${diffDays > 1 ? 'i' : ''}`
    } else if (diffHours > 0) {
      return `Scade tra ${diffHours}h ${diffMinutes}m`
    } else {
      return `Scade tra ${diffMinutes} minuti`
    }
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
            <p className="text-sm text-blue-600 font-medium mb-1">Validate</p>
            <p className="text-3xl font-bold text-blue-900">{stats.validated}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Ritirate</p>
            <p className="text-3xl font-bold text-green-900">{stats.pickedUp}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-red-600 font-medium mb-1">Scadute</p>
            <p className="text-3xl font-bold text-red-900">{stats.expired}</p>
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
              <option value="VALIDATED">Validate</option>
              <option value="PICKED_UP">Ritirate</option>
              <option value="EXPIRED">Scadute</option>
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
                      <h3 className="font-semibold text-gray-900">{reservation.card_name || 'Carta sconosciuta'}</h3>
                      {reservation.card_rarity && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {reservation.card_rarity}
                        </span>
                      )}
                      {reservation.card_set && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {reservation.card_set}
                        </span>
                      )}
                      {getStatusBadge(reservation.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Cliente: {reservation.user_name || `ID: ${reservation.user_id}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Prenotata il {new Date(reservation.created_at).toLocaleDateString('it-IT')} alle {new Date(reservation.created_at).toLocaleTimeString('it-IT')}
                    </p>
                    {reservation.expires_at && (
                      <p className={`text-sm mt-1 ${getTimeRemaining(reservation.expires_at)}`}>
                        ⏱ {getExpiryText(reservation.expires_at)}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 mt-1">
                      💳 Carta ID: {reservation.card_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">ID: {reservation.id.slice(-8)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700">
                    QR Code: {reservation.qrCode}
                  </div>
                  <button
                    onClick={() => handleManualConfirm(reservation.id)}
                    className="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Conferma Manuale
                  </button>
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
