import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { merchantService } from '../services/api'

interface NotificationItem {
    id: string
    type: 'TOURNAMENT_TODAY' | 'TOURNAMENT_UPCOMING' | 'PENDING_REQUEST' | 'ACTIVE_RESERVATION' | 'UNREAD_MESSAGE'
    title: string
    message: string
    link: string
    timestamp: string
    urgent: boolean
}

interface NotificationDropdownProps {
    className?: string
}

const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
        case 'TOURNAMENT_TODAY':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        case 'TOURNAMENT_UPCOMING':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        case 'PENDING_REQUEST':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        case 'ACTIVE_RESERVATION':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        case 'UNREAD_MESSAGE':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        default:
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
    }
}

const getTypeColor = (type: NotificationItem['type'], urgent: boolean) => {
    if (urgent) {
        return 'bg-red-100 text-red-600'
    }
    switch (type) {
        case 'TOURNAMENT_TODAY':
        case 'TOURNAMENT_UPCOMING':
            return 'bg-blue-100 text-blue-600'
        case 'PENDING_REQUEST':
            return 'bg-amber-100 text-amber-600'
        case 'ACTIVE_RESERVATION':
            return 'bg-green-100 text-green-600'
        case 'UNREAD_MESSAGE':
            return 'bg-purple-100 text-purple-600'
        default:
            return 'bg-gray-100 text-gray-600'
    }
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const data = await merchantService.getMerchantNotifications()
            setNotifications(data.items || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Fetch on mount
        fetchNotifications()

        // Refresh every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleNotificationClick = (notification: NotificationItem) => {
        setIsOpen(false)
        if (notification.link) {
            navigate(notification.link)
        }
    }

    const urgentCount = notifications.filter(n => n.urgent).length

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Notification Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) fetchNotifications()
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 relative"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                    <span className={`absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full ${urgentCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-500 text-white'}`}>
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{t('merchant.notifications.title')}</h3>
                            {notifications.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    {urgentCount > 0
                                        ? t('merchant.notifications.urgent', { count: urgentCount })
                                        : t('merchant.notifications.total', { count: notifications.length })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm text-gray-500">{t('merchant.notifications.empty')}</p>
                                <p className="text-xs text-gray-400 mt-1">{t('merchant.notifications.allClear')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${notification.urgent ? 'bg-red-50/50' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(notification.type, notification.urgent)}`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${notification.urgent ? 'text-red-900' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <p className={`text-xs mt-0.5 truncate ${notification.urgent ? 'text-red-700' : 'text-gray-500'}`}>
                                                {notification.message}
                                            </p>
                                        </div>

                                        {/* Urgent indicator */}
                                        {notification.urgent && (
                                            <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    navigate('/merchant/dashboard')
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                                {t('merchant.notifications.goDashboard')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
