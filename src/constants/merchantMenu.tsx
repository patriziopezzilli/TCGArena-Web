// Merchant menu items with SVG icons
import {
    DashboardIcon,
    InventoryIcon,
    ReservationsIcon,
    TournamentIcon,
    ClockIcon,
    ChatIcon,
    BellIcon,
    NewsIcon,
    SettingsIcon
} from '../components/Icons'

export const merchantMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/merchant/dashboard' },
    { id: 'inventory', label: 'Inventario', icon: <InventoryIcon />, path: '/merchant/inventory' },
    { id: 'reservations', label: 'Prenotazioni', icon: <ReservationsIcon />, path: '/merchant/reservations' },
    { id: 'tournaments', label: 'Tornei', icon: <TournamentIcon />, path: '/merchant/tournaments' },
    { id: 'tournament-requests', label: 'Richieste Tornei', icon: <ClockIcon />, path: '/merchant/tournament-requests' },
    { id: 'requests', label: 'Richieste Clienti', icon: <ChatIcon />, path: '/merchant/requests' },
    { id: 'subscribers', label: 'Iscritti', icon: <BellIcon />, path: '/merchant/subscribers' },
    { id: 'news', label: 'Notizie', icon: <NewsIcon />, path: '/merchant/news' },
    { id: 'settings', label: 'Impostazioni', icon: <SettingsIcon />, path: '/merchant/settings' },
]

// Get user info from localStorage
export const getMerchantUserData = () => {
    const merchantUser = localStorage.getItem('merchant_user')
    return merchantUser ? JSON.parse(merchantUser) : null
}
