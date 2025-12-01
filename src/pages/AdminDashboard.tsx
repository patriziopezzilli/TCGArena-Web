import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/api'
import axios from 'axios'

interface Shop {
  id: number
  name: string
  address: string
  phoneNumber: string
  description: string
  type: string
  active: boolean
  isVerified: boolean
  ownerId: number
}

interface Stats {
  total: number
  active: number
  pending: number
  verified: number
}

interface WaitingListEntry {
  id: number
  email: string
  city: string
  userType: 'PLAYER' | 'MERCHANT'
  createdAt: string
  contacted: boolean
}

type TabType = 'shops' | 'waiting-list'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('shops')
  const [loading, setLoading] = useState(true)
  const [pendingShops, setPendingShops] = useState<Shop[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin')
    if (!isAdmin) {
      navigate('/merchant/login')
      return
    }

    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const [shops, statistics, waiting] = await Promise.all([
        adminService.getPendingShops(),
        adminService.getShopStats(),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/waiting-list/all`).then(res => res.data),
      ])
      setPendingShops(shops)
      setStats(statistics)
      setWaitingList(waiting)
    } catch (err: any) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (shopId: number) => {
    if (!confirm('Sei sicuro di voler attivare questo negozio?')) return

    setProcessingId(shopId)
    try {
      await adminService.activateShop(shopId)
      await loadData()
    } catch (err: any) {
      alert('Errore durante l\'attivazione: ' + (err.response?.data?.message || err.message))
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkContacted = async (entryId: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/waiting-list/${entryId}/contacted`)
      await loadData()
    } catch (err: any) {
      alert('Errore durante l\'aggiornamento: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchant_token')
    localStorage.removeItem('is_admin')
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
          <button onClick={handleLogout} className="text-primary hover:underline">
            Torna al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                🔐 Admin Panel - TCG Arena
              </h1>
              <p className="text-sm text-gray-600 mt-1">Gestione Negozi e Waiting List</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('shops')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'shops'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Negozi ({stats?.pending || 0})
            </button>
            <button
              onClick={() => setActiveTab('waiting-list')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'waiting-list'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Waiting List ({waitingList.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'shops' ? (
          <>
            {/* Shop Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Totale Negozi</div>
                <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Attivi</div>
                <div className="text-3xl font-bold text-green-600">{stats?.active || 0}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">In Attesa</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.pending || 0}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Verificati</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.verified || 0}</div>
              </div>
            </div>

            {/* Pending Shops */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Negozi in Attesa di Approvazione ({pendingShops.length})
                </h2>
              </div>

              {pendingShops.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">✅ Nessun negozio in attesa di approvazione</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingShops.map((shop) => (
                    <div key={shop.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                              In Attesa
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Indirizzo:</span>
                              <span className="ml-2 text-gray-900">{shop.address}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Telefono:</span>
                              <span className="ml-2 text-gray-900">{shop.phoneNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tipo:</span>
                              <span className="ml-2 text-gray-900">{shop.type}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Owner ID:</span>
                              <span className="ml-2 text-gray-900">#{shop.ownerId}</span>
                            </div>
                            {shop.description && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Descrizione:</span>
                                <p className="mt-1 text-gray-900">{shop.description}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col gap-2">
                          <button
                            onClick={() => handleActivate(shop.id)}
                            disabled={processingId === shop.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {processingId === shop.id ? 'Attivazione...' : '✓ Attiva Negozio'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Waiting List Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Totale Iscritti</div>
                <div className="text-3xl font-bold text-gray-900">{waitingList.length}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Giocatori</div>
                <div className="text-3xl font-bold text-blue-600">
                  {waitingList.filter(w => w.userType === 'PLAYER').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Negozianti</div>
                <div className="text-3xl font-bold text-purple-600">
                  {waitingList.filter(w => w.userType === 'MERCHANT').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Contattati</div>
                <div className="text-3xl font-bold text-green-600">
                  {waitingList.filter(w => w.contacted).length}
                </div>
              </div>
            </div>

            {/* Waiting List Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lista d'Attesa ({waitingList.length})
                </h2>
              </div>

              {waitingList.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">Nessun iscritto alla waiting list</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Città
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Iscrizione
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {waitingList.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {entry.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              entry.userType === 'PLAYER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {entry.userType === 'PLAYER' ? 'Giocatore' : 'Negoziante'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(entry.createdAt).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              entry.contacted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.contacted ? 'Contattato' : 'Da contattare'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {!entry.contacted && (
                              <button
                                onClick={() => handleMarkContacted(entry.id)}
                                className="text-primary hover:text-blue-700 font-medium"
                              >
                                Segna come contattato
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
