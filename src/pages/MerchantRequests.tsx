import { useEffect, useState, useCallback, useMemo } from 'react'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { merchantMenuItems, getMerchantUserData } from '../constants/merchantMenu'
import { ChatIcon } from '../components/Icons'

interface CustomerRequest {
  id: string
  user_id: number
  user_name: string
  shop_id: number
  shop_name: string
  shop_address: string
  type: 'TRADE' | 'BUY' | 'GENERAL' | 'AVAILABILITY' | 'PRICE_CHECK' | 'CARD_EVALUATION' | 'TRADE_IN' | 'CUSTOM_ORDER' | 'SUPPORT'
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  title: string
  description: string
  cardName?: string
  tcgType?: string
  images?: string[]
  merchantResponse?: string
  created_at: string
  updated_at: string
  resolved_at: string | null
  has_unread_messages?: boolean
  message_count?: number
  user_avatar: string | null
}

interface RequestMessage {
  id: string
  request_id: string
  sender_id: number
  sender_type: 'USER' | 'MERCHANT' | 'SYSTEM'
  content: string
  attachment_url?: string
  created_at: string
}

interface MerchantRequestsProps {
  embedded?: boolean
}

export default function MerchantRequests({ embedded = false }: MerchantRequestsProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [messages, setMessages] = useState<RequestMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [shopId, setShopId] = useState<string>('')

  const userData = getMerchantUserData()

  const parseBackendDate = useCallback((dateInput: string | number | null | undefined): Date | null => {
    if (!dateInput) return null
    try {
      let date: Date
      if (typeof dateInput === 'number') {
        date = dateInput < 1e10 ? new Date(dateInput * 1000) : new Date(dateInput)
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+')) {
          dateInput += 'Z'
        }
        date = new Date(dateInput)
      } else {
        return null
      }
      return isNaN(date.getTime()) ? null : date
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (userData?.shopId) {
      setShopId(userData.shopId)
      loadRequests(userData.shopId)
    }
  }, [])

  useEffect(() => {
    if (!selectedRequest) return
    const interval = setInterval(() => loadMessages(selectedRequest.id), 4000)
    return () => clearInterval(interval)
  }, [selectedRequest])

  const loadRequests = async (shopId: string, filters?: any) => {
    try {
      setLoading(true)
      const data = await merchantService.getRequests(shopId, filters)
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await merchantService.updateRequestStatus(requestId, shopId, newStatus)
      if (selectedRequest && selectedRequest.id === requestId) {
        await loadMessages(requestId)
      }
      loadRequests(shopId, { status: statusFilter })
    } catch (error) {
      console.error('Error updating request status:', error)
      showToast('Errore durante l\'aggiornamento dello stato', 'error')
    }
  }

  const loadMessages = async (requestId: string) => {
    try {
      setMessagesLoading(true)
      const data = await merchantService.getRequestMessages(requestId)
      setMessages(data.messages || [])
      if (selectedRequest?.has_unread_messages) {
        await merchantService.markRequestAsRead(requestId)
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, has_unread_messages: false } : req
        ))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return
    try {
      setSendingMessage(true)
      setNewMessage('')
      await merchantService.sendMessage(selectedRequest.id, newMessage)
      await loadMessages(selectedRequest.id)
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Errore durante l\'invio del messaggio', 'error')
      setNewMessage(newMessage)
    } finally {
      setSendingMessage(false)
    }
  }

  const openRequestDetail = async (request: CustomerRequest) => {
    setSelectedRequest(request)
    await loadMessages(request.id)
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      AVAILABILITY: 'bg-blue-50 text-blue-700 border border-blue-200',
      PRICE_CHECK: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      CARD_EVALUATION: 'bg-purple-50 text-purple-700 border border-purple-200',
      TRADE_IN: 'bg-amber-50 text-amber-700 border border-amber-200',
      CUSTOM_ORDER: 'bg-pink-50 text-pink-700 border border-pink-200',
      SUPPORT: 'bg-gray-100 text-gray-700 border border-gray-200',
      TRADE: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      BUY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      GENERAL: 'bg-slate-100 text-slate-700 border border-slate-200',
    }
    const labels: Record<string, string> = {
      AVAILABILITY: 'Disponibilità',
      PRICE_CHECK: 'Quotazione',
      CARD_EVALUATION: 'Valutazione',
      TRADE_IN: 'Ritiro',
      CUSTOM_ORDER: 'Ordine Custom',
      SUPPORT: 'Supporto',
      TRADE: 'Scambio',
      BUY: 'Acquisto',
      GENERAL: 'Generale',
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      ACCEPTED: 'bg-blue-50 text-blue-700 border border-blue-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      REJECTED: 'bg-red-50 text-red-700 border border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      ACCEPTED: 'In Lavorazione',
      COMPLETED: 'Completata',
      REJECTED: 'Rifiutata',
      CANCELLED: 'Annullata',
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length
    const accepted = requests.filter(r => r.status === 'ACCEPTED').length
    const completed = requests.filter(r => r.status === 'COMPLETED').length
    const unreadMessages = requests.filter(r => r.has_unread_messages).length
    return { pending, accepted, completed, unreadMessages }
  }, [requests])

  const content = (
    <>
      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6 -mt-2">
        <div className="flex gap-1 overflow-x-auto">
          {['', 'PENDING', 'ACCEPTED', 'COMPLETED'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => {
                setStatusFilter(status)
                loadRequests(shopId, status ? { status } : {})
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {status === '' ? 'Tutte' :
                status === 'PENDING' ? 'In Attesa' :
                  status === 'ACCEPTED' ? 'In Lavorazione' : 'Completate'}
              {status === 'PENDING' && stats.pending > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === status ? 'bg-white text-gray-900' : 'bg-amber-100 text-amber-700'
                  }`}>{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
        {stats.unreadMessages > 0 && (
          <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            📩 {stats.unreadMessages} non letti
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">In Attesa</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">In Lavorazione</p>
          <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Completate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Non Letti</p>
          <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChatIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nessuna richiesta trovata</p>
          <p className="text-gray-500 text-sm mt-1">Le richieste dei clienti appariranno qui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => openRequestDetail(request)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    {getTypeBadge(request.type)}
                    {getStatusBadge(request.status)}
                    {request.has_unread_messages && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    👤 {request.user_name}
                    {request.message_count && request.message_count > 0 && (
                      <span className="ml-3 text-gray-400">💬 {request.message_count}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
                  {request.cardName && (
                    <p className="text-sm text-gray-500 mt-2">
                      🃏 {request.cardName} {request.tcgType && `• ${request.tcgType}`}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400">
                    {parseBackendDate(request.created_at)?.toLocaleDateString('it-IT')}
                  </p>
                  <button className="mt-2 text-sm text-gray-900 font-medium hover:underline">
                    Apri →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 h-[85vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedRequest.title}</h2>
                    {getTypeBadge(selectedRequest.type)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="text-sm text-gray-600">👤 {selectedRequest.user_name}</p>
                </div>
                <button
                  onClick={() => { setSelectedRequest(null); setMessages([]) }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ChatIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p>Nessun messaggio. Inizia la conversazione!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'MERCHANT' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender_type === 'MERCHANT'
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender_type === 'MERCHANT' ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                          {parseBackendDate(message.created_at)?.toLocaleTimeString('it-IT', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Actions */}
            {selectedRequest.status !== 'COMPLETED' && selectedRequest.status !== 'REJECTED' && selectedRequest.status !== 'CANCELLED' && (
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'ACCEPTED')}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Prendi in Carico
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'COMPLETED')}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    ✓ Completa
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Rifiuta
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            {selectedRequest.status !== 'COMPLETED' && selectedRequest.status !== 'REJECTED' && selectedRequest.status !== 'CANCELLED' && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? (
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
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
      title="Richieste Clienti"
      subtitle={`${requests.length} richieste totali`}
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}
