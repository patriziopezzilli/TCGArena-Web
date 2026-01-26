import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

interface Tournament {
    id: number
    title: string
    description: string | null
    tcgType: string
    type: string | null
    status: string
    startDate: string
    endDate: string | null
    maxParticipants: number | null
    currentParticipants: number | null
    entryFee: number | null
    prizePool: string | null
    isRanked: boolean | null
    externalRegistrationUrl: string | null
    location: {
        venueName: string
        address: string
        city: string
        country: string
        latitude: number | null
        longitude: number | null
    } | null
}

interface ShareData {
    tournament: Tournament
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
    'RIFTBOUND': 'Riftbound'
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
    'UPCOMING': { label: 'In arrivo', color: 'bg-blue-100 text-blue-700' },
    'REGISTRATION_OPEN': { label: 'Iscrizioni aperte', color: 'bg-green-100 text-green-700' },
    'REGISTRATION_CLOSED': { label: 'Iscrizioni chiuse', color: 'bg-yellow-100 text-yellow-700' },
    'IN_PROGRESS': { label: 'In corso', color: 'bg-orange-100 text-orange-700' },
    'COMPLETED': { label: 'Completato', color: 'bg-gray-100 text-gray-700' },
    'CANCELLED': { label: 'Annullato', color: 'bg-red-100 text-red-700' }
}

export default function ShareTournament() {
    const { id } = useParams<{ id: string }>()
    const [data, setData] = useState<ShareData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/public/tournaments/${id}`
                )
                setData(response.data)
            } catch (err) {
                setError('Torneo non trovato')
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
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Torneo non trovato</h1>
                <p className="text-gray-500 mb-8">Il torneo che stai cercando non esiste o è stato rimosso.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Torna alla Home
                </Link>
            </div>
        )
    }

    const { tournament } = data
    const status = STATUS_DISPLAY[tournament.status] || { label: tournament.status, color: 'bg-gray-100 text-gray-700' }

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
                    {/* Tournament Header */}
                    <div className="text-center mb-8 pt-8">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 bg-gray-100 flex items-center justify-center">
                            <span className="text-4xl">🏆</span>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${status.color}`}>
                            {status.label}
                        </span>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournament.title}</h1>

                        {/* TCG Type */}
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {TCG_DISPLAY_NAMES[tournament.tcgType] || tournament.tcgType}
                        </span>

                        {tournament.isRanked && (
                            <span className="inline-block ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                ⭐ Ufficiale
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
                                <p className="font-medium text-gray-900">{formatDate(tournament.startDate)}</p>
                                {tournament.endDate && tournament.endDate !== tournament.startDate && (
                                    <p className="text-sm text-gray-500">Fino a: {formatDate(tournament.endDate)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    {tournament.location && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Luogo</h2>
                            <a
                                href={tournament.location.latitude && tournament.location.longitude
                                    ? `https://maps.google.com/?q=${tournament.location.latitude},${tournament.location.longitude}`
                                    : `https://maps.google.com/?q=${encodeURIComponent(tournament.location.address + ', ' + tournament.location.city)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <p className="font-medium text-gray-900">{tournament.location.venueName}</p>
                                <p className="text-gray-500 text-sm">{tournament.location.address}</p>
                                <p className="text-gray-500 text-sm">{tournament.location.city}, {tournament.location.country}</p>
                            </a>
                        </div>
                    )}

                    {/* Participants */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Partecipanti</h2>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Iscritti</span>
                                <span className="font-semibold text-gray-900">
                                    {tournament.currentParticipants || 0}
                                    {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
                                </span>
                            </div>
                            {tournament.maxParticipants && (
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gray-900 rounded-full"
                                        style={{
                                            width: `${Math.min(100, ((tournament.currentParticipants || 0) / tournament.maxParticipants) * 100)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Entry Fee & Prize */}
                    {(tournament.entryFee !== null || tournament.prizePool) && (
                        <div className="mb-8 grid grid-cols-2 gap-4">
                            {tournament.entryFee !== null && (
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500 mb-1">Quota iscrizione</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {tournament.entryFee === 0 ? 'Gratis' : `€${tournament.entryFee}`}
                                    </p>
                                </div>
                            )}
                            {tournament.prizePool && (
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500 mb-1">Montepremi</p>
                                    <p className="text-xl font-bold text-gray-900">{tournament.prizePool}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {tournament.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrizione</h2>
                            <p className="text-gray-600 leading-relaxed">{tournament.description}</p>
                        </div>
                    )}

                    {/* External Registration */}
                    {tournament.externalRegistrationUrl && (
                        <div className="mb-8">
                            <a
                                href={tournament.externalRegistrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full p-4 bg-blue-50 text-blue-700 rounded-xl font-medium text-center hover:bg-blue-100 transition-colors"
                            >
                                Iscriviti sul sito ufficiale →
                            </a>
                        </div>
                    )}
                </div>
            </main>

            {/* Download CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-6 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">Partecipa ai tornei con TCG Arena</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Iscriviti, ricevi notifiche e traccia i tuoi risultati.
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
