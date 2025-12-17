import { useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import apiClient from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import RewardsManagement from './RewardsManagement'
import AchievementsManagement from './AchievementsManagement'
import BatchImport from './BatchImport'
import ShopsManagement from './ShopsManagement'
import ExpansionsAndSetsManagement from './ExpansionsAndSetsManagement'
import PartnersManagement from './PartnersManagement'
import RewardFulfillment from './RewardFulfillment'
import BroadcastNotifications from './BroadcastNotifications'
import {
  StoreIcon,
  ClockIcon,
  ListIcon,
  HandshakeIcon,
  GiftIcon,
  TruckIcon,
  AwardIcon,
  ImportIcon,
  CardsIcon,
  MegaphoneIcon,
  CheckCircleIcon
} from '../components/Icons'

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

type TabType = 'all-shops' | 'pending-shops' | 'waiting-list' | 'partners' | 'rewards' | 'fulfillment' | 'achievements' | 'batch-import' | 'expansions-sets' | 'broadcast'

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

  // Admin menu items with SVG icons
  const adminMenuItems: { id: TabType; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'all-shops', label: 'Tutti i Negozi', icon: <StoreIcon /> },
    { id: 'pending-shops', label: 'In Attesa', icon: <ClockIcon />, badge: stats?.pending },
    { id: 'waiting-list', label: 'Waiting List', icon: <ListIcon />, badge: waitingList.length || undefined },
    { id: 'partners', label: 'Partners', icon: <HandshakeIcon /> },
    { id: 'rewards', label: 'Rewards', icon: <GiftIcon /> },
    { id: 'fulfillment', label: 'Fulfillment', icon: <TruckIcon /> },
    { id: 'achievements', label: 'Achievements', icon: <AwardIcon /> },
    { id: 'batch-import', label: 'Batch Import', icon: <ImportIcon /> },
    { id: 'expansions-sets', label: 'Espansioni & Sets', icon: <CardsIcon /> },
    { id: 'broadcast', label: 'Broadcast', icon: <MegaphoneIcon /> },
  ]

  const getActiveTabTitle = () => {
    const item = adminMenuItems.find(m => m.id === activeTab)
    return item?.label || 'Dashboard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-2">Si è verificato un errore</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/merchant/login')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
          >
            Torna al login
          </button>
        </div>
      </div>
    )
  }

  // Content for each tab
  const renderContent = () => {
    switch (activeTab) {
      case 'pending-shops':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-gray-500 mb-1">Totale Negozi</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-emerald-700 mb-1">Attivi</p>
                <p className="text-3xl font-bold text-emerald-700">{stats?.active || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-amber-700 mb-1">In Attesa</p>
                <p className="text-3xl font-bold text-amber-700">{stats?.pending || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-blue-700 mb-1">Verificati</p>
                <p className="text-3xl font-bold text-blue-700">{stats?.verified || 0}</p>
              </div>
            </div>

            {/* Pending Shops List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Negozi in Attesa di Approvazione</h3>
                <p className="text-sm text-gray-500 mt-1">{pendingShops.length} richieste da gestire</p>
              </div>

              {pendingShops.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-gray-600 font-medium">Nessun negozio in attesa</p>
                  <p className="text-gray-400 text-sm mt-1">Tutte le richieste sono state elaborate</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className="p-6 hover:bg-gray-50 transition-all duration-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <StoreIcon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{shop.name}</h4>
                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                In Attesa
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Indirizzo</p>
                              <p className="text-gray-900 mt-0.5">{shop.address}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Telefono</p>
                              <p className="text-gray-900 mt-0.5">{shop.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Tipo</p>
                              <p className="text-gray-900 mt-0.5">{shop.type}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Owner ID</p>
                              <p className="text-gray-900 mt-0.5">#{shop.ownerId}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleActivate(shop.id)}
                          disabled={processingId === shop.id}
                          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          {processingId === shop.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Attivando...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-4 h-4" />
                              Attiva
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'waiting-list':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-gray-500 mb-1">Totale Iscritti</p>
                <p className="text-3xl font-bold text-gray-900">{waitingList.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-blue-700 mb-1">Giocatori</p>
                <p className="text-3xl font-bold text-blue-700">
                  {waitingList.filter(w => w.userType === 'PLAYER').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-purple-700 mb-1">Negozianti</p>
                <p className="text-3xl font-bold text-purple-700">
                  {waitingList.filter(w => w.userType === 'MERCHANT').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-sm text-emerald-700 mb-1">Contattati</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {waitingList.filter(w => w.contacted).length}
                </p>
              </div>
            </div>

            {/* Waiting List Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Lista d'Attesa</h3>
                <p className="text-sm text-gray-500 mt-1">{waitingList.length} utenti in lista</p>
              </div>

              {waitingList.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Nessun iscritto</p>
                  <p className="text-gray-400 text-sm mt-1">La waiting list è vuota</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Città</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {waitingList.map((entry, index) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{entry.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{entry.city}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${entry.userType === 'PLAYER'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                              }`}>
                              {entry.userType === 'PLAYER' ? 'Giocatore' : 'Negoziante'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(entry.createdAt).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${entry.contacted
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                              }`}>
                              {entry.contacted ? 'Contattato' : 'Da contattare'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!entry.contacted && (
                              <button
                                onClick={() => handleMarkContacted(entry.id)}
                                className="text-sm text-gray-900 font-medium hover:text-gray-700 transition-colors duration-150 flex items-center gap-1 ml-auto"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                Contattato
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
          </div>
        )

      case 'all-shops':
        return <div className="animate-fadeIn"><ShopsManagement /></div>
      case 'partners':
        return <div className="animate-fadeIn"><PartnersManagement /></div>
      case 'rewards':
        return <div className="animate-fadeIn"><RewardsManagement /></div>
      case 'achievements':
        return <div className="animate-fadeIn"><AchievementsManagement /></div>
      case 'fulfillment':
        return <div className="animate-fadeIn"><RewardFulfillment /></div>
      case 'batch-import':
        return <div className="animate-fadeIn"><BatchImport /></div>
      case 'expansions-sets':
        return <div className="animate-fadeIn"><ExpansionsAndSetsManagement /></div>
      case 'broadcast':
        return <div className="animate-fadeIn"><BroadcastNotifications /></div>
      default:
        return null
    }
  }

  return (
    <DashboardLayout
      title={getActiveTabTitle()}
      subtitle="TCG Arena Admin Panel"
      menuItems={adminMenuItems}
      userName="Amministratore"
      isAdmin={true}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as TabType)}
    >
      {renderContent()}

      {/* Fade in animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  )
}
