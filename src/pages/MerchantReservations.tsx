import { useEffect, useState } from 'react'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { ReservationsIcon } from '../components/Icons'

// Merchant menu items
const merchantMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/merchant/dashboard' },
  { id: 'inventory', label: 'Inventario', icon: '📦', path: '/merchant/inventory' },
  { id: 'reservations', label: 'Prenotazioni', icon: '🎫', path: '/merchant/reservations' },
  { id: 'tournaments', label: 'Tornei', icon: '🏆', path: '/merchant/tournaments' },
  { id: 'tournament-requests', label: 'Richieste Tornei', icon: '⏱️', path: '/merchant/tournament-requests' },
  { id: 'requests', label: 'Richieste Clienti', icon: '💬', path: '/merchant/requests' },
  { id: 'subscribers', label: 'Iscritti', icon: '🔔', path: '/merchant/subscribers' },
  { id: 'news', label: 'Notizie', icon: '📰', path: '/merchant/news' },
  { id: 'settings', label: 'Impostazioni', icon: '⚙️', path: '/merchant/settings' },
]

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

interface MerchantReservationsProps {
  embedded?: boolean
}

export default function MerchantReservations({ embedded = false }: MerchantReservationsProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [shopId, setShopId] = useState<string>('')

  // Get user info for layout
  const merchantUser = localStorage.getItem('merchant_user')
  const userData = merchantUser ? JSON.parse(merchantUser) : null

  useEffect(() => {
    if (userData?.shopId) {
      setShopId(userData.shopId)
      loadReservations(userData.shopId)
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
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      VALIDATED: 'bg-blue-50 text-blue-700 border border-blue-200',
      PICKED_UP: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      EXPIRED: 'bg-red-50 text-red-700 border border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      VALIDATED: 'Validata',
      PICKED_UP: 'Ritirata',
      EXPIRED: 'Scaduta',
      CANCELLED: 'Cancellata',
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status]}`}>
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
    if (diffMs <= 3600000) return 'text-orange-600'
    return 'text-amber-600'
  }

  const getExpiryText = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()

    if (diffMs <= 0) return 'Scaduta!'

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

  const content = (
    <>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 -mt-2">
        <div className="flex gap-1 overflow-x-auto">
          {['', 'PENDING', 'VALIDATED', 'PICKED_UP', 'EXPIRED'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => {
                setStatusFilter(status)
                loadReservations(shopId, status)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {status === '' ? 'Tutti' :
                status === 'PENDING' ? 'In Attesa' :
                  status === 'VALIDATED' ? 'Validate' :
                    status === 'PICKED_UP' ? 'Ritirate' : 'Scadute'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowQRModal(true)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>📷</span> Scansiona QR
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">In Attesa</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Validate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.validated}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Ritirate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pickedUp}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Scadute</p>
          <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
        </div>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ReservationsIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nessuna prenotazione trovata</p>
          <p className="text-gray-500 text-sm mt-1">Le prenotazioni dei clienti appariranno qui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{reservation.card_name || 'Carta sconosciuta'}</h3>
                    {reservation.card_rarity && (
                      <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                        {reservation.card_rarity}
                      </span>
                    )}
                    {reservation.card_set && (
                      <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                        {reservation.card_set}
                      </span>
                    )}
                    {getStatusBadge(reservation.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    👤 {reservation.user_name || `ID: ${reservation.user_id}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 Prenotata il {new Date(reservation.created_at).toLocaleDateString('it-IT')} alle {new Date(reservation.created_at).toLocaleTimeString('it-IT')}
                  </p>
                  {reservation.expires_at && (
                    <p className={`text-sm mt-1 font-medium ${getTimeRemaining(reservation.expires_at)}`}>
                      ⏱️ {getExpiryText(reservation.expires_at)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-mono">#{reservation.id.slice(-8)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-700">
                  {reservation.qr_code}
                </div>
                {(reservation.status === 'PENDING' || reservation.status === 'VALIDATED') && (
                  <>
                    <button
                      onClick={() => handleManualConfirm(reservation.id)}
                      className="px-4 py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      ✓ Conferma
                    </button>
                    <button
                      onClick={() => {
                        setQrCode(reservation.qr_code)
                        setShowQRModal(true)
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Valida QR
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Valida Prenotazione
            </h2>
            <p className="text-gray-600 text-sm mb-6">Inserisci o scansiona il codice QR del cliente</p>
            <form onSubmit={handleValidateQR}>
              <div className="mb-6">
                <input
                  type="text"
                  required
                  placeholder="es: RSV-ABC123XYZ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-lg"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRModal(false)
                    setQrCode('')
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Valida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )

  if (embedded) {
    return content
  }

  return (
    <DashboardLayout
      title="Prenotazioni"
      subtitle={`${reservations.length} prenotazioni totali`}
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}
