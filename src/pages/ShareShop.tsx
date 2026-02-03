import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

interface Shop {
    id: number
    name: string
    description: string | null
    address: string
    latitude: number | null
    longitude: number | null
    phoneNumber: string | null
    email: string | null
    websiteUrl: string | null
    instagramUrl: string | null
    facebookUrl: string | null
    photoBase64: string | null
    photoUrl: string | null
    type: string
    isVerified: boolean
    active: boolean | null
    openingHours: string | null
    openingDays: string | null
    openingHoursStructured: any | null
    tcgTypes: string[] | null
    services: string[] | null
}

interface ShareData {
    shop: Shop
    shareUrl: string
    deepLink: string
}

const TCG_DISPLAY_NAMES: Record<string, string> = {
    'POKEMON': 'Pokémon',
    'ONE_PIECE': 'One Piece',
    'MAGIC': 'Magic: The Gathering',
    'YUGIOH': 'Yu-Gi-Oh!',
    'DIGIMON': 'Digimon',
    'LORCANA': 'Disney Lorcana',
    'RIFTBOUND': 'Riftbound',
    'DRAGON_BALL_SUPER_FUSION_WORLD': 'Dragon Ball Super Fusion World',
    'FLESH_AND_BLOOD': 'Flesh and Blood',
    'UNION_ARENA': 'Union Arena'
}

const SERVICE_DISPLAY_NAMES: Record<string, string> = {
    'CARD_SALES': 'Vendita Carte',
    'BUY_CARDS': 'Acquisto Carte',
    'TOURNAMENTS': 'Tornei',
    'PLAY_AREA': 'Area Gioco',
    'GRADING': 'Grading',
    'ACCESSORIES': 'Accessori',
    'PREORDERS': 'Preordini',
    'ONLINE_STORE': 'Store Online',
    'CARD_EVALUATION': 'Valutazione Carte',
    'TRADE_IN': 'Permuta'
}

export default function ShareShop() {
    const { id } = useParams<{ id: string }>()
    const [data, setData] = useState<ShareData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/public/shops/${id}`
                )
                setData(response.data)
            } catch (err) {
                setError('Negozio non trovato')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
                <div className="text-6xl mb-4">🏪</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Negozio non trovato</h1>
                <p className="text-gray-500 mb-8">Il negozio che stai cercando non esiste o è stato rimosso.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Torna alla Home
                </Link>
            </div>
        )
    }

    const { shop } = data

    const getIsOpenStatus = (shop: Shop) => {
        const now = new Date()
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes()
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

        if (shop.openingHoursStructured) {
            const dayName = days[now.getDay()]
            const schedule = shop.openingHoursStructured[dayName]

            if (!schedule || schedule.closed) {
                return { isOpen: false, status: 'Chiuso', todayHours: 'Chiuso' }
            }

            const [openH, openM] = schedule.open.split(':').map(Number)
            const [closeH, closeM] = schedule.close.split(':').map(Number)
            const openTime = openH * 60 + openM
            const closeTime = closeH * 60 + closeM

            const isOpen = currentTimeMinutes >= openTime && currentTimeMinutes <= closeTime
            return {
                isOpen,
                status: isOpen ? 'Aperto ora' : 'Chiuso',
                todayHours: `${schedule.open} - ${schedule.close}`
            }
        }

        if (shop.openingHours) {
            const hoursMatch = shop.openingHours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
            if (hoursMatch) {
                const [_, openStr, closeStr] = hoursMatch
                const [openH, openM] = openStr.split(':').map(Number)
                const [closeH, closeM] = closeStr.split(':').map(Number)
                const openTime = openH * 60 + openM
                const closeTime = closeH * 60 + closeM

                const isOpen = currentTimeMinutes >= openTime && currentTimeMinutes <= closeTime
                return {
                    isOpen,
                    status: isOpen ? 'Aperto ora' : 'Chiuso',
                    todayHours: shop.openingHours
                }
            }
            return { isOpen: true, status: 'Aperto', todayHours: shop.openingHours }
        }

        return { isOpen: true, status: 'Orari non disponibili', todayHours: 'Non specificato' }
    }

    const status = getIsOpenStatus(shop)
    const itDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
    const enDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">TCG Arena</span>
                    </Link>
                    <button
                        onClick={() => {
                            if (data.deepLink) {
                                window.location.href = data.deepLink
                                setTimeout(() => {
                                    window.location.href = 'https://apps.apple.com/it/app/tcg-arena/id6757301894'
                                }, 1500)
                            }
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Apri nell'app
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="pt-20 pb-32 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Shop Header */}
                    <div className="text-center mb-8 pt-8">
                        {(shop.photoUrl || shop.photoBase64) ? (
                            <img
                                src={shop.photoUrl || `data:image/jpeg;base64,${shop.photoBase64}`}
                                alt={shop.name}
                                className="w-32 h-32 rounded-2xl mx-auto mb-6 object-cover shadow-lg"
                                onError={(e) => {
                                    // If image fails to load, replace with placeholder
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.parentElement?.querySelector('.placeholder-icon')?.classList.remove('hidden')
                                }}
                            />
                        ) : null}
                        <div className={`w-32 h-32 rounded-2xl mx-auto mb-6 bg-gray-100 flex items-center justify-center placeholder-icon ${(shop.photoUrl || shop.photoBase64) ? 'hidden' : ''}`}>
                            <span className="text-4xl">🏪</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                            {shop.isVerified && (
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </div>

                        <p className="text-gray-500 flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {shop.address}
                        </p>
                    </div>

                    {/* Description */}
                    {shop.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrizione</h2>
                            <p className="text-gray-600 leading-relaxed">{shop.description}</p>
                        </div>
                    )}

                    {/* TCG Types */}
                    {shop.tcgTypes && shop.tcgTypes.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Giochi Supportati</h2>
                            <div className="flex flex-wrap gap-2">
                                {shop.tcgTypes.map((tcg) => (
                                    <span
                                        key={tcg}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                    >
                                        {TCG_DISPLAY_NAMES[tcg] || tcg}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {shop.services && shop.services.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Servizi</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {shop.services.map((service) => (
                                    <div
                                        key={service}
                                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{SERVICE_DISPLAY_NAMES[service] || service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Opening Hours */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">Orari di Apertura</h2>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {status.status}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Oggi</span>
                                </div>
                                <span className={`text-sm font-semibold ${status.isOpen ? 'text-gray-900' : 'text-orange-600'}`}>
                                    {status.todayHours}
                                </span>
                            </div>

                            {shop.openingHoursStructured ? (
                                <div className="space-y-3">
                                    {enDays.map((day, index) => {
                                        const schedule = shop.openingHoursStructured[day];
                                        if (!schedule) return null;
                                        return (
                                            <div key={day} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{itDays[index]}</span>
                                                <span className={schedule.closed ? 'text-orange-400' : 'text-gray-700'}>
                                                    {schedule.closed ? 'Chiuso' : `${schedule.open} - ${schedule.close}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                shop.openingHours && (
                                    <div className="text-sm text-gray-600">
                                        <p>{shop.openingHours}</p>
                                        {shop.openingDays && <p className="text-xs text-gray-400 mt-1">{shop.openingDays}</p>}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Contatti</h2>
                        <div className="space-y-2">
                            {shop.phoneNumber && (
                                <a
                                    href={`tel:${shop.phoneNumber}`}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-gray-700">{shop.phoneNumber}</span>
                                </a>
                            )}
                            {shop.email && (
                                <a
                                    href={`mailto:${shop.email}`}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">{shop.email}</span>
                                </a>
                            )}
                            {shop.websiteUrl && (
                                <a
                                    href={shop.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <span className="text-gray-700">Sito Web</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Map */}
                    {shop.latitude && shop.longitude && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Posizione</h2>
                            <a
                                href={`https://maps.google.com/?q=${shop.latitude},${shop.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">Apri in Google Maps</span>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            </main>

            {/* Download CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-6 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">Scopri di più su TCG Arena</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Prenota carte, partecipa a tornei e trova negozi vicino a te.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="https://apps.apple.com/it/app/tcg-arena/id6757301894"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                Scarica su App Store
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=it.tcgarena.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.009l-2.302 2.302-8.634-8.653z" />
                                </svg>
                                Scarica su Google Play
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
