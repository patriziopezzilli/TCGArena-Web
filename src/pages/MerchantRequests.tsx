import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

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

export default function MerchantRequests() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [messages, setMessages] = useState<RequestMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [shopId, setShopId] = useState<string>('')

  // Helper function to parse backend date format
  const parseBackendDate = useCallback((dateInput: string | number | null | undefined): Date | null => {
    if (!dateInput) return null

    try {
      let date: Date

      if (typeof dateInput === 'number') {
        // If it's a number, assume it's a timestamp
        // Check if it's in seconds (10 digits) or milliseconds (13 digits)
        if (dateInput < 1e10) {
          // Likely seconds, convert to milliseconds
          date = new Date(dateInput * 1000)
        } else {
          // Likely milliseconds
          date = new Date(dateInput)
        }
      } else if (typeof dateInput === 'string') {
        // Handle ISO string without timezone by assuming UTC
        if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+')) {
          dateInput += 'Z'
        }
        date = new Date(dateInput)
      } else {
        return null
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return null
      }

      return date
    } catch (error) {
      return null
    }
  }, [])

  useEffect(() => {
    const user = localStorage.getItem('merchant_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.shopId) {
        setShopId(userData.shopId)
        loadRequests(userData.shopId)
      }
    }
  }, []) // Removed navigate from dependencies to prevent re-runs

  // Auto-refresh messages every 4 seconds when in conversation
  useEffect(() => {
    if (!selectedRequest) return

    const interval = setInterval(() => {
      loadMessages(selectedRequest.id)
    }, 4000)

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
      // Refresh the current request data and messages if we're in a conversation
      if (selectedRequest && selectedRequest.id === requestId) {
        await loadMessages(requestId)
      }
      // Refresh the requests list
      loadRequests(shopId, { type: typeFilter, status: statusFilter })
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
      
      // Mark as read if there are unread messages
      if (selectedRequest?.has_unread_messages) {
        await merchantService.markRequestAsRead(requestId)
        // Update the request in the list to mark as read
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
      
      // Reload messages to show the new message
      await loadMessages(selectedRequest.id)
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Errore durante l\'invio del messaggio', 'error')
      setNewMessage(newMessage) // Restore message on error
    } finally {
      setSendingMessage(false)
    }
  }

  const openRequestDetail = async (request: CustomerRequest) => {
    setSelectedRequest(request)
    await loadMessages(request.id)
  }

  const applyFilters = () => {
    const filters: any = {}
    if (typeFilter) filters.type = typeFilter
    if (statusFilter) filters.status = statusFilter
    loadRequests(shopId, filters)
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      AVAILABILITY: 'bg-blue-100 text-blue-800',
      PRICE_CHECK: 'bg-green-100 text-green-800',
      CARD_EVALUATION: 'bg-purple-100 text-purple-800',
      TRADE_IN: 'bg-amber-100 text-amber-800',
      CUSTOM_ORDER: 'bg-pink-100 text-pink-800',
      SUPPORT: 'bg-gray-100 text-gray-800',
      TRADE: 'bg-indigo-100 text-indigo-800',
      BUY: 'bg-emerald-100 text-emerald-800',
      GENERAL: 'bg-slate-100 text-slate-800',
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      ACCEPTED: 'In Lavorazione',
      COMPLETED: 'Completata',
      REJECTED: 'Rifiutata',
      CANCELLED: 'Annullata',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length
    const accepted = requests.filter(r => r.status === 'ACCEPTED').length
    const completed = requests.filter(r => r.status === 'COMPLETED').length
    const rejected = requests.filter(r => r.status === 'REJECTED').length
    const cancelled = requests.filter(r => r.status === 'CANCELLED').length
    const unreadMessages = requests.filter(r => r.has_unread_messages).length
    return { pending, accepted, completed, rejected, cancelled, unreadMessages }
  }, [requests])

  const stats = getStats

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
              <h1 className="text-2xl font-semibold text-gray-900">Gestione Richieste Clienti</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-yellow-600 font-medium mb-1">In Attesa</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-medium mb-1">In Lavorazione</p>
            <p className="text-3xl font-bold text-blue-900">{stats.accepted}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Completate</p>
            <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-red-600 font-medium mb-1">Rifiutate</p>
            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 font-medium mb-1">Annullate</p>
            <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="text-sm text-orange-600 font-medium mb-1">Non Letti</p>
            <p className="text-3xl font-bold text-orange-900">{stats.unreadMessages}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtri:</label>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tutti i tipi</option>
              <option value="AVAILABILITY">Disponibilità</option>
              <option value="PRICE_CHECK">Quotazione</option>
              <option value="CARD_EVALUATION">Valutazione</option>
              <option value="TRADE_IN">Ritiro</option>
              <option value="CUSTOM_ORDER">Ordine Custom</option>
              <option value="SUPPORT">Supporto</option>
              <option value="TRADE">Scambio</option>
              <option value="BUY">Acquisto</option>
              <option value="GENERAL">Generale</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tutti gli stati</option>
              <option value="PENDING">In Attesa</option>
              <option value="ACCEPTED">In Lavorazione</option>
              <option value="COMPLETED">Completate</option>
              <option value="REJECTED">Rifiutate</option>
              <option value="CANCELLED">Annullate</option>
            </select>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Applica
            </button>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nessuna richiesta trovata</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      {getTypeBadge(request.type)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Cliente: {request.user_name}
                      {request.has_unread_messages && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Messaggi non letti
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                    {request.cardName && (
                      <p className="text-sm text-gray-600">
                        Carta: <span className="font-medium">{request.cardName}</span>
                        {request.tcgType && ` • ${request.tcgType}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Ricevuta il {parseBackendDate(request.created_at)?.toLocaleDateString('it-IT') || 'Data non disponibile'} alle{' '}
                      {parseBackendDate(request.created_at)?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) || ''}
                      {request.message_count && request.message_count > 0 && (
                        <span className="ml-2 text-blue-600">
                          • {request.message_count} messaggi
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => openRequestDetail(request)}
                      className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                      Visualizza Conversazione
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedRequest.title}</h2>
                    {getTypeBadge(selectedRequest.type)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="text-sm text-gray-600">Cliente: {selectedRequest.user_name}</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedRequest.description}</p>
                  {selectedRequest.cardName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Carta: <span className="font-medium">{selectedRequest.cardName}</span>
                      {selectedRequest.tcgType && ` • ${selectedRequest.tcgType}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadMessages(selectedRequest.id)}
                    disabled={messagesLoading}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Aggiorna messaggi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(null)
                      setMessages([])
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Nessun messaggio ancora. Inizia la conversazione!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'MERCHANT' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'MERCHANT'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'MERCHANT' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {parseBackendDate(message.created_at)?.toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) || 'Ora non disponibile'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Actions */}
            {selectedRequest.status !== 'COMPLETED' && selectedRequest.status !== 'REJECTED' && selectedRequest.status !== 'CANCELLED' && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'ACCEPTED')}
                    className="flex-1 px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Prendi in Carico
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'COMPLETED')}
                    className="flex-1 px-4 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Completa
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                    className="flex-1 px-4 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
    </div>
  )
}
