import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'

interface CustomerRequest {
  id: string
  userId: string
  userName: string
  shopId: string
  shopName: string
  type: 'AVAILABILITY' | 'PRICE_CHECK' | 'CARD_EVALUATION' | 'TRADE_IN' | 'CUSTOM_ORDER' | 'SUPPORT'
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
  title: string
  description: string
  cardName?: string
  tcgType?: string
  images?: string[]
  merchantResponse?: string
  createdAt: string
  updatedAt: string
}

export default function MerchantRequests() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [response, setResponse] = useState('')
  const [shopId, setShopId] = useState<string>('')

  useEffect(() => {
    const user = localStorage.getItem('merchant_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.shopId) {
        setShopId(userData.shopId)
        loadRequests(userData.shopId)
      }
    }
  }, [])

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
      await merchantService.updateRequestStatus(requestId, shopId, newStatus, response)
      setSelectedRequest(null)
      setResponse('')
      loadRequests(shopId, { type: typeFilter, status: statusFilter })
    } catch (error) {
      console.error('Error updating request status:', error)
      alert('Errore durante l\'aggiornamento dello stato')
    }
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
    }
    const labels: Record<string, string> = {
      AVAILABILITY: 'Disponibilità',
      PRICE_CHECK: 'Quotazione',
      CARD_EVALUATION: 'Valutazione',
      TRADE_IN: 'Ritiro',
      CUSTOM_ORDER: 'Ordine Custom',
      SUPPORT: 'Supporto',
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
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      PENDING: 'In Attesa',
      IN_PROGRESS: 'In Lavorazione',
      RESOLVED: 'Risolta',
      REJECTED: 'Rifiutata',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStats = () => {
    const pending = requests.filter(r => r.status === 'PENDING').length
    const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length
    const resolved = requests.filter(r => r.status === 'RESOLVED').length
    const rejected = requests.filter(r => r.status === 'REJECTED').length
    return { pending, inProgress, resolved, rejected }
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
              <h1 className="text-2xl font-semibold text-gray-900">Gestione Richieste Clienti</h1>
            </div>
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
            <p className="text-sm text-blue-600 font-medium mb-1">In Lavorazione</p>
            <p className="text-3xl font-bold text-blue-900">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Risolte</p>
            <p className="text-3xl font-bold text-green-900">{stats.resolved}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-red-600 font-medium mb-1">Rifiutate</p>
            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
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
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tutti gli stati</option>
              <option value="PENDING">In Attesa</option>
              <option value="IN_PROGRESS">In Lavorazione</option>
              <option value="RESOLVED">Risolte</option>
              <option value="REJECTED">Rifiutate</option>
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
                      Cliente: {request.userName}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                    {request.cardName && (
                      <p className="text-sm text-gray-600">
                        Carta: <span className="font-medium">{request.cardName}</span>
                        {request.tcgType && ` • ${request.tcgType}`}
                      </p>
                    )}
                    {request.merchantResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">Tua Risposta:</p>
                        <p className="text-sm text-gray-900">{request.merchantResponse}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Ricevuta il {new Date(request.createdAt).toLocaleDateString('it-IT')} alle{' '}
                      {new Date(request.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      disabled={request.status === 'RESOLVED' || request.status === 'REJECTED'}
                    >
                      Rispondi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Rispondi alla Richiesta
            </h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{selectedRequest.title}</h3>
                {getTypeBadge(selectedRequest.type)}
              </div>
              <p className="text-sm text-gray-600 mb-2">Cliente: {selectedRequest.userName}</p>
              <p className="text-sm text-gray-700">{selectedRequest.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato della Richiesta
              </label>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'IN_PROGRESS')}
                  className="flex-1 px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Prendi in Carico
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risposta al Cliente
              </label>
              <textarea
                rows={5}
                placeholder="Scrivi la tua risposta qui..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setResponse('')
                }}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Rifiuta
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, 'RESOLVED')}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                disabled={!response.trim()}
              >
                Risolvi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
