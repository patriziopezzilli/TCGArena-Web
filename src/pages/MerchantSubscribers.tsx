import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { merchantMenuItems, getMerchantUserData } from '../constants/merchantMenu'
import { ExclamationTriangleIcon, UsersIcon, MegaphoneIcon, InboxIcon } from '../components/Icons'

interface Subscriber {
  id: number
  username: string
  displayName: string
  email: string
  dateJoined: string
  points: number
  favoriteTCGTypes: string[]
}

interface MerchantSubscribersProps {
  embedded?: boolean
}

export default function MerchantSubscribers({ embedded = false }: MerchantSubscribersProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [error, setError] = useState('')
  const [shopId, setShopId] = useState<string>('')

  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [sendingNotification, setSendingNotification] = useState(false)

  const userData = getMerchantUserData()

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
      showToast('Inserisci titolo e messaggio', 'warning')
      return
    }

    setSendingNotification(true)
    try {
      await merchantService.sendShopNotification(shopId, notificationTitle, notificationMessage)
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
      showToast('Notifica inviata con successo!', 'success')
    } catch (err: any) {
      showToast('Errore nell\'invio: ' + (err.response?.data?.message || err.message), 'error')
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
    if (embedded) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      )
    }
    return (
      <DashboardLayout
        title="Iscritti"
        subtitle="Caricamento..."
        menuItems={merchantMenuItems}
        userName={userData?.displayName || userData?.username}
        shopName={userData?.shopName}
      >
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    if (embedded) {
      return (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )
    }
    return (
      <DashboardLayout
        title="Iscritti"
        subtitle="Errore"
        menuItems={merchantMenuItems}
        userName={userData?.displayName || userData?.username}
        shopName={userData?.shopName}
      >
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const content = (
    <>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 -mt-2">
        <div></div>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <MegaphoneIcon className="w-5 h-5" /> Invia Notifica
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Iscritti Totali</p>
            <p className="text-4xl font-bold text-gray-900">{subscriberCount}</p>
            <p className="text-sm text-gray-500 mt-1">Riceveranno le tue notifiche</p>
          </div>
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      {subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nessuno iscritto ancora</p>
          <p className="text-gray-500 text-sm mt-1">Gli iscritti appariranno qui</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Lista Iscritti ({subscribers.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {subscribers.map((subscriber) => (
              <div key={subscriber.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-semibold text-indigo-700">
                        {subscriber.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{subscriber.displayName}</h4>
                      <p className="text-sm text-gray-500">@{subscriber.username}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Iscritto dal {formatDate(subscriber.dateJoined)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{subscriber.points}</span>
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg">⭐ punti</span>
                    </div>
                    {subscriber.favoriteTCGTypes && subscriber.favoriteTCGTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {subscriber.favoriteTCGTypes.slice(0, 3).map((tcg, index) => (
                          <span
                            key={index}
                            className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg"
                          >
                            {tcg}
                          </span>
                        ))}
                        {subscriber.favoriteTCGTypes.length > 3 && (
                          <span className="text-xs text-gray-400">+{subscriber.favoriteTCGTypes.length - 3}</span>
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

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invia Notifica</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titolo *</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                  placeholder="Es: Nuovo arrivo carte!"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Messaggio *</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 resize-none"
                  rows={4}
                  placeholder="Descrivi l'aggiornamento..."
                  maxLength={500}
                />
              </div>

              <p className="text-sm text-gray-500">Verrà inviata a {subscriberCount} iscritti</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={sendingNotification}
              >
                Annulla
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
                className="flex-1 px-4 py-3 text-white bg-gray-900 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Invio...
                  </>
                ) : (
                  <>📢 Invia</>
                )}
              </button>
            </div>
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
      title="Iscritti"
      subtitle={`${subscriberCount} utenti iscritti`}
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}