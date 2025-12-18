import { ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'

interface MenuItem {
    id: string
    label: string
    icon: ReactNode
    path?: string
    onClick?: () => void
    badge?: number
}

interface DashboardLayoutProps {
    children: ReactNode
    title: string
    subtitle?: string
    menuItems: MenuItem[]
    userName?: string
    shopName?: string
    isAdmin?: boolean
    activeTab?: string
    onTabChange?: (tabId: string) => void
}

// Logout icon SVG
const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
)

export default function DashboardLayout({
    children,
    title,
    subtitle,
    menuItems,
    userName,
    shopName,
    isAdmin = false,
    activeTab,
    onTabChange
}: DashboardLayoutProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('merchant_token')
        localStorage.removeItem('merchant_user')
        localStorage.removeItem('is_admin')
        navigate('/merchant/login')
    }

    const isActive = (item: MenuItem) => {
        if (activeTab && onTabChange) {
            return activeTab === item.id
        }
        return item.path ? location.pathname === item.path || location.pathname + location.search === item.path : false
    }

    const handleMenuClick = (item: MenuItem) => {
        if (onTabChange) {
            onTabChange(item.id)
        } else if (item.onClick) {
            item.onClick()
        } else if (item.path) {
            navigate(item.path)
        }
        setSidebarOpen(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
        transform transition-all duration-300 ease-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div>
                            <span className="font-bold text-gray-900">TCG Arena</span>
                            <span className="text-gray-400 font-medium ml-1">Business</span>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-white shadow">
                            <span className="text-indigo-600 font-semibold">
                                {userName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {userName || 'Utente'}
                            </p>
                            {shopName && (
                                <p className="text-xs text-gray-500 truncate">{shopName}</p>
                            )}
                            {isAdmin && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-gray-900 to-gray-700 text-white">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                transition-all duration-200 ease-out
                transform hover:translate-x-1
                ${isActive(item)
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }
              `}
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            <span className={`transition-transform duration-200 ${isActive(item) ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="flex-1 font-medium text-sm">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  transition-all duration-200
                  ${isActive(item)
                                        ? 'bg-white text-gray-900'
                                        : 'bg-red-100 text-red-600'
                                    }
                `}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                    >
                        <span className="group-hover:rotate-12 transition-transform duration-200">
                            <LogoutIcon />
                        </span>
                        <span className="font-medium text-sm">Esci</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 transition-all duration-300">
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Page Title */}
                        <div className="flex-1 min-w-0 lg:ml-0 ml-4">
                            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-gray-500 truncate hidden sm:block">{subtitle}</p>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <NotificationDropdown />

                            {/* User Avatar - Desktop */}
                            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-white shadow">
                                    <span className="text-indigo-600 font-medium text-sm">
                                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{userName}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content with fade-in animation */}
                <main className="p-4 lg:p-8 animate-fadeIn">
                    {children}
                </main>
            </div>

            {/* Add fadeIn animation */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}
