import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

interface CommunityEvent {
    id: number
    title: string
    description: string | null
    eventDate: string
    locationType: string
    locationName: string
    shopId: number | null
    latitude: number | null
    longitude: number | null
    maxParticipants: number
    currentParticipants: number
    tcgType: string | null
    status: string
    creatorUsername: string
    creatorDisplayName: string | null
    creatorId: number
    isFull: boolean
}

interface ShareData {
    event: CommunityEvent
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

export default function ShareEvent() {
    const { id } = useParams<{ id: string }>()
    const [data, setData] = useState<ShareData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/public/community-events/${id}`
                )
                setData(response.data)
            } catch (err) {
                setError('Evento non trovato')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateStr
        }
    }

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
                <div className="text-6xl mb-4">👥</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Evento non trovato</h1>
                <p className="text-gray-500 mb-8">L'evento che stai cercando non esiste o è stato rimosso.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Torna alla Home
                </Link>
            </div>
        )
    }

    const { event } = data
    const spotsRemaining = Math.max(0, event.maxParticipants - event.currentParticipants)

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
                    {/* Event Header */}
                    <div className="text-center mb-8 pt-8">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 bg-gray-100 flex items-center justify-center">
                            <span className="text-4xl">👥</span>
                        </div>

                        {/* Status */}
                        {event.isFull ? (
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                                Completo
                            </span>
                        ) : event.status === 'ACTIVE' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                                Aperto
                            </span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4">
                                {event.status}
                            </span>
                        )}

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>

                        {/* TCG Type */}
                        {event.tcgType && (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {TCG_DISPLAY_NAMES[event.tcgType] || event.tcgType}
                            </span>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Luogo</h2>
                        {event.latitude && event.longitude ? (
                            <a
                                href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">{event.locationName}</p>
                                        <p className="text-sm text-gray-500">
                                            {event.locationType === 'SHOP' ? '📍 Presso negozio' : '📍 Luogo personalizzato'}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">{event.locationName}</p>
                                        <p className="text-sm text-gray-500">
                                            {event.locationType === 'SHOP' ? '📍 Presso negozio' : '📍 Luogo personalizzato'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Organizer */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Organizzatore</h2>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {event.creatorDisplayName || event.creatorUsername}
                                    </p>
                                    <p className="text-sm text-gray-500">@{event.creatorUsername}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Partecipanti</h2>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-700">Iscritti</span>
                                <span className="font-semibold text-gray-900">
                                    {event.currentParticipants} / {event.maxParticipants}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full ${event.isFull ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{
                                        width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%`
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                {event.isFull ? 'Nessun posto disponibile' : `${spotsRemaining} post${spotsRemaining === 1 ? 'o' : 'i'} disponibil${spotsRemaining === 1 ? 'e' : 'i'}`}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrizione</h2>
                            <p className="text-gray-600 leading-relaxed">{event.description}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Download CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-6 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">Unisciti alla community</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Crea eventi, trova giocatori e partecipa a meetup nella tua zona.
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
