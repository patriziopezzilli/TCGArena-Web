import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import apiClient from '../services/api'
import RewardsManagement from './RewardsManagement'
import AchievementsManagement from './AchievementsManagement'
import BatchImport from './BatchImport'
import ShopsManagement from './ShopsManagement'
import ExpansionsAndSetsManagement from './ExpansionsAndSetsManagement'
import PartnersManagement from './PartnersManagement'

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

type TabType = 'all-shops' | 'pending-shops' | 'waiting-list' | 'partners' | 'rewards' | 'achievements' | 'batch-import' | 'expansions-sets'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('all-shops')
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
        apiClient.get('/waiting-list/all').then(res => res.data),
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
      showToast('Negozio attivato con successo', 'success')
      await loadData()
    } catch (err: any) {
      showToast('Errore durante l\'attivazione: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkContacted = async (entryId: number) => {
    try {
      await apiClient.put(`/waiting-list/${entryId}/contacted`)
      showToast('Stato aggiornato con successo', 'success')
      await loadData()
    } catch (err: any) {
      showToast('Errore durante l\'aggiornamento: ' + (err.response?.data?.message || err.message), 'error')
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
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                TCG Arena Admin
              </h1>
              <p className="text-sm text-gray-300 mt-1">Gestione completa della piattaforma</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              Logout
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all-shops')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'all-shops'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Tutti i Negozi
            </button>
            <button
              onClick={() => setActiveTab('pending-shops')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'pending-shops'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              In Attesa {stats?.pending ? <span className="ml-1 px-2 py-0.5 bg-amber-500 rounded-full text-xs text-white">{stats.pending}</span> : null}
            </button>
            <button
              onClick={() => setActiveTab('waiting-list')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'waiting-list'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Waiting List {waitingList.length > 0 ? <span className="ml-1 px-2 py-0.5 bg-blue-500 rounded-full text-xs text-white">{waitingList.length}</span> : null}
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'partners'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Partners
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rewards'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'achievements'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('batch-import')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'batch-import'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Batch Import
            </button>
            <button
              onClick={() => setActiveTab('expansions-sets')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'expansions-sets'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Espansioni & Sets
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'pending-shops' ? (
          <>
            {/* Shop Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-gray-600 mb-2">Totale Negozi</div>
                <div className="text-4xl font-bold text-gray-900">{stats?.total || 0}</div>
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-green-700 mb-2">Attivi</div>
                <div className="text-4xl font-bold text-green-600">{stats?.active || 0}</div>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-amber-700 mb-2">In Attesa</div>
                <div className="text-4xl font-bold text-amber-600">{stats?.pending || 0}</div>
              </div>
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-blue-700 mb-2">Verificati</div>
                <div className="text-4xl font-bold text-blue-600">{stats?.verified || 0}</div>
              </div>
            </div>

            {/* Pending Shops */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">
                  Negozi in Attesa di Approvazione
                </h2>
                <p className="text-sm text-gray-600 mt-1">{pendingShops.length} richieste da gestire</p>
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
                            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:scale-105"
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
        ) : activeTab === 'waiting-list' ? (
          <>
            {/* Waiting List Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-gray-600 mb-2">Totale Iscritti</div>
                <div className="text-4xl font-bold text-gray-900">{waitingList.length}</div>
              </div>
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-blue-700 mb-2">Giocatori</div>
                <div className="text-4xl font-bold text-blue-600">
                  {waitingList.filter(w => w.userType === 'PLAYER').length}
                </div>
              </div>
              <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-purple-700 mb-2">Negozianti</div>
                <div className="text-4xl font-bold text-purple-600">
                  {waitingList.filter(w => w.userType === 'MERCHANT').length}
                </div>
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-100 p-6 hover:shadow-lg transition-all">
                <div className="text-sm font-medium text-green-700 mb-2">Contattati</div>
                <div className="text-4xl font-bold text-green-600">
                  {waitingList.filter(w => w.contacted).length}
                </div>
              </div>
            </div>

            {/* Waiting List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">
                  Lista d'Attesa
                </h2>
                <p className="text-sm text-gray-600 mt-1">{waitingList.length} utenti in lista</p>
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
        ) : activeTab === 'all-shops' ? (
          <ShopsManagement />
        ) : activeTab === 'partners' ? (
          <PartnersManagement />
        ) : activeTab === 'rewards' ? (
          <RewardsManagement />
        ) : activeTab === 'achievements' ? (
          <AchievementsManagement />
        ) : activeTab === 'batch-import' ? (
          <BatchImport />
        ) : activeTab === 'expansions-sets' ? (
          <ExpansionsAndSetsManagement />
        ) : null}
      </div>
    </div>
  )
}
