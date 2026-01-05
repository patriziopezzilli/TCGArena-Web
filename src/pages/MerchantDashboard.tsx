import { useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import AdminDashboard from './AdminDashboard'
import MerchantReservations from './MerchantReservations'
import MerchantTournaments from './MerchantTournaments'
import MerchantRequests from './MerchantRequests'
import MerchantSubscribers from './MerchantSubscribers'
import ShopNews from './ShopNews'
import TournamentRequests from './TournamentRequests'
import MerchantSettings from './MerchantSettings'
import MerchantInventory from './MerchantInventory'
import MerchantRewards from './MerchantRewards'
import {
  DashboardIcon,
  InventoryIcon,
  ReservationsIcon,
  TournamentIcon,
  ClockIcon,
  ChatIcon,
  BellIcon,
  NewsIcon,
  SettingsIcon,
  ArrowRightIcon,
  GiftIcon
} from '../components/Icons'

// Merchant menu items with SVG icons
const merchantMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'reservations', label: 'Prenotazioni', icon: <ReservationsIcon /> },
  { id: 'tournaments', label: 'Tornei', icon: <TournamentIcon /> },
  { id: 'tournament-requests', label: 'Richieste Tornei', icon: <ClockIcon /> },
  { id: 'requests', label: 'Richieste Clienti', icon: <ChatIcon /> },
  { id: 'subscribers', label: 'Iscritti', icon: <BellIcon /> },
  { id: 'news', label: 'Notizie', icon: <NewsIcon /> },
  { id: 'rewards', label: 'Premi Partner', icon: <GiftIcon /> },
  { id: 'settings', label: 'Impostazioni', icon: <SettingsIcon /> },
]

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopStatus, setShopStatus] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<{
    inventoryCount: number;
    activeReservations: number;
    upcomingTournaments: number;
    pendingRequests: number;
    subscriberCount: number;
  } | null>(null)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    const adminFlag = localStorage.getItem('is_admin')

    if (!token) {
      navigate('/merchant/login')
      return
    }

    if (adminFlag === 'true') {
      setIsAdmin(true)
      setLoading(false)
      return
    }

    loadShopStatus()
  }, [navigate])

  const loadShopStatus = async () => {
    try {
      const status = await merchantService.getShopStatus()
      setShopStatus(status)

      if (status.active) {
        await loadDashboardStats()
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('merchant_token')
        navigate('/merchant/login')
      } else {
        setError('Errore nel caricamento dello status del negozio')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const stats = await merchantService.getDashboardStats()
      setDashboardStats(stats)
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err)
    }
  }

  if (isAdmin) {
    return <AdminDashboard />
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
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl animate-fadeIn">
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

  const menuWithBadges = merchantMenuItems.map(item => ({
    ...item,
    badge: item.id === 'reservations' ? dashboardStats?.activeReservations :
      item.id === 'requests' ? dashboardStats?.pendingRequests :
        undefined
  }))

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard'
      case 'inventory': return 'Inventario'
      case 'reservations': return 'Prenotazioni'
      case 'tournaments': return 'Tornei'
      case 'tournament-requests': return 'Richieste Tornei'
      case 'requests': return 'Richieste Clienti'
      case 'subscribers': return 'Iscritti'
      case 'news': return 'Notizie'
      case 'rewards': return 'Premi Partner'
      case 'settings': return 'Impostazioni'
      default: return 'Dashboard'
    }
  }

  // Handle tab change - all render inline now
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent()
      case 'inventory':
        return <MerchantInventory embedded />
      case 'reservations':
        return <MerchantReservations embedded />
      case 'tournaments':
        return <MerchantTournaments embedded />
      case 'tournament-requests':
        return <TournamentRequests embedded />
      case 'requests':
        return <MerchantRequests embedded />
      case 'subscribers':
        return <MerchantSubscribers embedded />
      case 'news':
        return <ShopNews embedded />
      case 'rewards':
        return <MerchantRewards embedded />
      case 'settings':
        return <MerchantSettings embedded />
      default:
        return renderDashboardContent()
    }
  }

  const renderDashboardContent = () => {
    if (!shopStatus?.active) {
      return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl mb-4 shadow-lg">
                <ClockIcon className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Negozio in Attesa di Approvazione
              </h2>
              <p className="text-gray-600">
                Il tuo negozio è stato registrato con successo ma non è ancora attivo.
                Il nostro team sta verificando le informazioni fornite.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Informazioni Negozio</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Nome Negozio</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Indirizzo</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.address}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Telefono</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Tipo</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.type}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-amber-700 font-medium">In attesa di verifica</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              Riceverai una notifica via email quando il negozio sarà attivato.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Benvenuto, {shopStatus?.user?.displayName || shopStatus?.user?.username}
              </h2>
              <p className="text-gray-600 mt-1">
                Ecco un riepilogo delle attività del tuo negozio
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full ring-1 ring-emerald-200">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-700">Negozio Attivo</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Carte in Inventario"
            value={dashboardStats?.inventoryCount ?? 0}
            icon={<InventoryIcon className="w-6 h-6" />}
            delay={0}
          />
          <StatCard
            label="Prenotazioni Attive"
            value={dashboardStats?.activeReservations ?? 0}
            icon={<ReservationsIcon className="w-6 h-6" />}
            delay={100}
          />
          <StatCard
            label="Tornei in Programma"
            value={dashboardStats?.upcomingTournaments ?? 0}
            icon={<TournamentIcon className="w-6 h-6" />}
            delay={200}
          />
          <StatCard
            label="Richieste in Attesa"
            value={dashboardStats?.pendingRequests ?? 0}
            icon={<ChatIcon className="w-6 h-6" />}
            delay={300}
          />
          <StatCard
            label="Iscritti Notifiche"
            value={dashboardStats?.subscriberCount ?? 0}
            icon={<BellIcon className="w-6 h-6" />}
            delay={400}
          />
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Gestione Inventario"
              description="Aggiungi, modifica ed elimina carte dal tuo inventario"
              icon={<InventoryIcon className="w-7 h-7" />}
              onClick={() => navigate('/merchant/inventory')}
              delay={0}
            />
            <QuickActionCard
              title="Prenotazioni"
              description="Gestisci le prenotazioni e scansiona i QR per i ritiri"
              icon={<ReservationsIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('reservations')}
              delay={100}
            />
            <QuickActionCard
              title="Tornei"
              description="Crea e gestisci tornei per i tuoi clienti"
              icon={<TournamentIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('tournaments')}
              delay={200}
            />
            <QuickActionCard
              title="Richieste Clienti"
              description="Rispondi alle richieste di disponibilità e valutazioni"
              icon={<ChatIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('requests')}
              delay={300}
            />
            <QuickActionCard
              title="Iscritti Notifiche"
              description="Gestisci gli iscritti e invia aggiornamenti"
              icon={<BellIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('subscribers')}
              delay={400}
            />
            <QuickActionCard
              title="Notizie"
              description="Pubblica notizie, offerte e aggiornamenti"
              icon={<NewsIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('news')}
              delay={500}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title={getPageTitle()}
      subtitle={shopStatus?.shop?.name || 'Il tuo negozio'}
      menuItems={menuWithBadges}
      userName={shopStatus?.user?.displayName || shopStatus?.user?.username}
      shopName={shopStatus?.shop?.name}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  )
}

// Stat Card Component - Premium Style
interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  delay: number
}

function StatCard({ label, value, icon, delay }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-0.5 animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-600">
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// Quick Action Card Component
interface QuickActionCardProps {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  delay: number
}

function QuickActionCard({ title, description, icon, onClick, delay }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-gray-300 hover:shadow-lg transition-all duration-300 group transform hover:-translate-y-1 animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex items-center text-gray-900 font-medium text-sm group-hover:text-gray-700">
        Gestisci
        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </button>
  )
}
