import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface Subscriber {
  id: number
  username: string
  displayName: string
  email: string
  dateJoined: string
  points: number
  favoriteTCGTypes: string[]
}

export default function MerchantSubscribers() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [error, setError] = useState('')
  const [shopId, setShopId] = useState<string>('')

  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [sendingNotification, setSendingNotification] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    if (!token) {
      navigate('/merchant/login')
      return
    }

    loadShopData()
  }, [navigate])

  const loadShopData = async () => {
    try {
      const shopStatus = await merchantService.getShopStatus()
      const shopId = shopStatus.shop.id.toString()
      setShopId(shopId)

      // Load subscribers and count in parallel
      const [subscribersData, countData] = await Promise.all([
        merchantService.getShopSubscribers(shopId),
        merchantService.getSubscriberCount(shopId)
      ])

      setSubscribers(subscribersData)
      setSubscriberCount(countData.count)
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('merchant_token')
        navigate('/merchant/login')
      } else {
        setError('Errore nel caricamento degli iscritti')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      showToast('Inserisci titolo e messaggio per la notifica', 'warning')
      return
    }

    setSendingNotification(true)
    try {
      await merchantService.sendShopNotification(shopId, notificationTitle, notificationMessage)
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
      showToast('Notifica inviata con successo a tutti gli iscritti!', 'success')
    } catch (err: any) {
      showToast('Errore nell\'invio della notifica: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setSendingNotification(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Caricamento iscritti...</p>
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
            onClick={() => navigate('/merchant/dashboard')}
            className="text-primary hover:underline"
          >
            Torna alla dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/merchant/dashboard')}
                className="text-gray-300 hover:text-white flex items-center gap-2 mb-2"
              >
                ← Torna alla Dashboard
              </button>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Iscritti al Negozio
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Gestisci gli utenti iscritti alle tue notifiche
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg transition-colors flex items-center gap-2"
              >
                📢 Invia Notifica
              </button>
              <button
                onClick={() => navigate('/merchant/settings')}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
              >
                ⚙️ Impostazioni
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {subscriberCount} Iscritti
              </h2>
              <p className="text-gray-600">
                Utenti che riceveranno le tue notifiche e aggiornamenti
              </p>
            </div>
            <div className="text-6xl">👥</div>
          </div>
        </div>

        {/* Subscribers List */}
        {subscribers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuno iscritto ancora
            </h3>
            <p className="text-gray-600 mb-6">
              Quando gli utenti si iscriveranno alle tue notifiche, appariranno qui
            </p>
            <button
              onClick={() => navigate('/merchant/dashboard')}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              Torna alla Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista Iscritti ({subscribers.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {subscriber.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {subscriber.displayName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          @{subscriber.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          Iscritto dal {formatDate(subscriber.dateJoined)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {subscriber.points} punti
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          ⭐
                        </span>
                      </div>

                      {subscriber.favoriteTCGTypes && subscriber.favoriteTCGTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {subscriber.favoriteTCGTypes.slice(0, 3).map((tcg, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                            >
                              {tcg}
                            </span>
                          ))}
                          {subscriber.favoriteTCGTypes.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{subscriber.favoriteTCGTypes.length - 3} altri
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Invia Notifica
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Es: Nuovo arrivo carte!"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Messaggio *
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Descrivi l'aggiornamento o la promozione..."
                  maxLength={500}
                />
              </div>

              <div className="text-sm text-gray-500">
                Verrà inviata a {subscriberCount} iscritti
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                disabled={sendingNotification}
              >
                Annulla
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
                className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Invio...
                  </>
                ) : (
                  <>
                    📢 Invia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}