import { useEffect, useState, ReactNode, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

// Feature flag per GRAAD partnership
const graadEnabled = true

export default function MerchantDashboard() {
  const { t } = useTranslation()
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

  // Merchant menu items with SVG icons
  const merchantMenuItems = useMemo(() => [
    { id: 'dashboard', label: t('merchant.menu.dashboard'), icon: <DashboardIcon /> },
    { id: 'inventory', label: t('merchant.menu.inventory'), icon: <InventoryIcon /> },
    { id: 'reservations', label: t('merchant.menu.reservations'), icon: <ReservationsIcon /> },
    { id: 'tournaments', label: t('merchant.menu.tournaments'), icon: <TournamentIcon /> },
    { id: 'tournament-requests', label: t('merchant.menu.tournamentRequests'), icon: <ClockIcon /> },
    { id: 'requests', label: t('merchant.menu.customerRequests'), icon: <ChatIcon /> },
    { id: 'subscribers', label: t('merchant.menu.subscribers'), icon: <BellIcon /> },
    { id: 'news', label: t('merchant.menu.news'), icon: <NewsIcon /> },
    { id: 'rewards', label: t('merchant.menu.rewards'), icon: <GiftIcon /> },
    { id: 'settings', label: t('merchant.menu.settings'), icon: <SettingsIcon /> },
  ], [t])

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
        setError(t('merchant.dashboard.error.loadStatus') || 'Errore nel caricamento dello status del negozio')
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
          <p className="mt-4 text-gray-600 animate-pulse">{t('common.loading')}</p>
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
          <p className="text-gray-900 font-medium mb-2">{t('merchant.dashboard.error.title')}</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/merchant/login')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
          >
            {t('merchant.dashboard.error.backLogin')}
          </button>
        </div>
      </div>
    )
  }

  // Filter menu items based on shop status
  const visibleMenuItems = shopStatus?.active
    ? merchantMenuItems
    : merchantMenuItems.filter(item => item.id === 'dashboard')

  const menuWithBadges = visibleMenuItems.map(item => ({
    ...item,
    badge: item.id === 'reservations' ? dashboardStats?.activeReservations :
      item.id === 'requests' ? dashboardStats?.pendingRequests :
        undefined
  }))

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t('merchant.menu.dashboard')
      case 'inventory': return t('merchant.menu.inventory')
      case 'reservations': return t('merchant.menu.reservations')
      case 'tournaments': return t('merchant.menu.tournaments')
      case 'tournament-requests': return t('merchant.menu.tournamentRequests')
      case 'requests': return t('merchant.menu.customerRequests')
      case 'subscribers': return t('merchant.menu.subscribers')
      case 'news': return t('merchant.menu.news')
      case 'rewards': return t('merchant.menu.rewards')
      case 'settings': return t('merchant.menu.settings')
      default: return t('merchant.menu.dashboard')
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
                {t('merchant.dashboard.pendingApproval.title')}
              </h2>
              <p className="text-gray-600">
                {t('merchant.dashboard.pendingApproval.description')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-gray-900">{t('merchant.dashboard.pendingApproval.shopInfo')}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{t('merchant.dashboard.pendingApproval.shopName')}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{t('merchant.dashboard.pendingApproval.address')}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.address}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{t('merchant.dashboard.pendingApproval.phone')}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{t('merchant.dashboard.pendingApproval.type')}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{shopStatus?.shop?.type}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-amber-700 font-medium">{t('merchant.dashboard.pendingApproval.waitingVerification')}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              {t('merchant.dashboard.pendingApproval.emailNotification')}
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
                {t('merchant.dashboard.welcome', { name: shopStatus?.user?.displayName || shopStatus?.user?.username })}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('merchant.dashboard.summary')}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full ring-1 ring-emerald-200">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-700">{t('merchant.dashboard.activeShop')}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label={t('merchant.dashboard.stats.inventory')}
            value={dashboardStats?.inventoryCount ?? 0}
            icon={<InventoryIcon className="w-6 h-6" />}
            delay={0}
          />
          <StatCard
            label={t('merchant.dashboard.stats.reservations')}
            value={dashboardStats?.activeReservations ?? 0}
            icon={<ReservationsIcon className="w-6 h-6" />}
            delay={100}
          />
          <StatCard
            label={t('merchant.dashboard.stats.tournaments')}
            value={dashboardStats?.upcomingTournaments ?? 0}
            icon={<TournamentIcon className="w-6 h-6" />}
            delay={200}
          />
          <StatCard
            label={t('merchant.dashboard.stats.requests')}
            value={dashboardStats?.pendingRequests ?? 0}
            icon={<ChatIcon className="w-6 h-6" />}
            delay={300}
          />
          <StatCard
            label={t('merchant.dashboard.stats.subscribers')}
            value={dashboardStats?.subscriberCount ?? 0}
            icon={<BellIcon className="w-6 h-6" />}
            delay={400}
          />
        </div>

        {/* GRAAD Partner Info Box */}
        {graadEnabled && <GraadPartnerInfoBox />}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('merchant.dashboard.quickActions.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.inventory.title')}
              description={t('merchant.dashboard.quickActions.inventory.desc')}
              icon={<InventoryIcon className="w-7 h-7" />}
              onClick={() => navigate('/merchant/inventory')}
              delay={0}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.reservations.title')}
              description={t('merchant.dashboard.quickActions.reservations.desc')}
              icon={<ReservationsIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('reservations')}
              delay={100}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.tournaments.title')}
              description={t('merchant.dashboard.quickActions.tournaments.desc')}
              icon={<TournamentIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('tournaments')}
              delay={200}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.requests.title')}
              description={t('merchant.dashboard.quickActions.requests.desc')}
              icon={<ChatIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('requests')}
              delay={300}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.subscribers.title')}
              description={t('merchant.dashboard.quickActions.subscribers.desc')}
              icon={<BellIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('subscribers')}
              delay={400}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
            <QuickActionCard
              title={t('merchant.dashboard.quickActions.news.title')}
              description={t('merchant.dashboard.quickActions.news.desc')}
              icon={<NewsIcon className="w-7 h-7" />}
              onClick={() => setActiveTab('news')}
              delay={500}
              manageText={t('merchant.dashboard.quickActions.manage')}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title={getPageTitle()}
      subtitle={shopStatus?.shop?.name || t('merchant.menu.dashboard')}
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
  manageText: string
}

function QuickActionCard({ title, description, icon, onClick, delay, manageText }: QuickActionCardProps) {
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
        {manageText}
        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </button>
  )
}

// GRAAD Partner Info Box Component
function GraadPartnerInfoBox() {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg animate-fadeIn">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Left: Icon and Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-amber-400/90 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wide">
              {t('merchant.graad.badge')}
            </div>
          </div>

          {/* Center: Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">
                {t('merchant.graad.title')}
              </h3>
              <img
                src="https://s3-eu-west-1.amazonaws.com/tpd/logos/615adb52d7cbf7001d84eaaf/0x0.png"
                alt="GRAAD Logo"
                className="h-6 object-contain"
              />
            </div>
            <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
              {t('merchant.graad.description')}
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col gap-3">
            <a
              href="https://www.graad.eu/it/diventa-partner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>{t('merchant.graad.ctaPartner')}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://www.graad.eu/it/servizi-e-prezzi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <span>{t('merchant.graad.ctaServices')}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom: Features */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('merchant.graad.featureApp')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('merchant.graad.featureTracking')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('merchant.graad.featureCustomers')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('merchant.graad.featureFirst')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
