import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

interface Card {
    id: number
    name: string
    tcgType: string
    setCode: string | null
    cardNumber: string | null
    rarity: string | null
    imageUrl: string | null
    description: string | null
    marketPrice: number | null
    expansion: {
        id: number
        name: string
        code: string
        releaseDate: string | null
    } | null
}

interface ShareData {
    card: Card
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

const RARITY_COLORS: Record<string, { bg: string; text: string }> = {
    'COMMON': { bg: 'bg-gray-100', text: 'text-gray-700' },
    'UNCOMMON': { bg: 'bg-green-100', text: 'text-green-700' },
    'RARE': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'HOLO_RARE': { bg: 'bg-blue-200', text: 'text-blue-800' },
    'ULTRA_RARE': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'SECRET_RARE': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'SPECIAL_ART_RARE': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'ILLUSTRATION_RARE': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    'MYTHIC': { bg: 'bg-orange-100', text: 'text-orange-700' }
}

export default function ShareCard() {
    const { id } = useParams<{ id: string }>()
    const [data, setData] = useState<ShareData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/public/cards/${id}`
                )
                setData(response.data)
            } catch (err) {
                setError('Carta non trovata')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const getCardImageUrl = (card: Card) => {
        if (!card.imageUrl) return null
        // If URL contains tcgplayer, use directly
        if (card.imageUrl.toLowerCase().includes('tcgplayer')) {
            return card.imageUrl
        }
        // If already has quality suffix, use as is
        if (card.imageUrl.includes('/high.webp')) {
            return card.imageUrl
        }
        // Otherwise add high quality suffix
        return `${card.imageUrl}/high.webp`
    }

    const formatRarity = (rarity: string): string => {
        return rarity
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
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
                <div className="text-6xl mb-4">🃏</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Carta non trovata</h1>
                <p className="text-gray-500 mb-8">La carta che stai cercando non esiste o è stata rimossa.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Torna alla Home
                </Link>
            </div>
        )
    }

    const { card } = data
    const imageUrl = getCardImageUrl(card)
    const rarityStyle = RARITY_COLORS[card.rarity || ''] || RARITY_COLORS['COMMON']

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
                    {/* Card Image */}
                    <div className="text-center mb-8 pt-8">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={card.name}
                                className="max-w-[280px] w-full mx-auto rounded-xl shadow-2xl"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        ) : (
                            <div className="w-[200px] h-[280px] mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                                <span className="text-6xl">🃏</span>
                            </div>
                        )}
                    </div>

                    {/* Card Name & TCG */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">{card.name}</h1>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {TCG_DISPLAY_NAMES[card.tcgType] || card.tcgType}
                            </span>
                            {card.rarity && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${rarityStyle.bg} ${rarityStyle.text}`}>
                                    {formatRarity(card.rarity)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-4 mb-8">
                        {/* Set & Number */}
                        {(card.setCode || card.cardNumber) && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Set / Numero</span>
                                    <span className="font-medium text-gray-900">
                                        {card.setCode || ''}{card.setCode && card.cardNumber ? ' • ' : ''}{card.cardNumber || ''}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Expansion */}
                        {card.expansion && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Espansione</span>
                                    <span className="font-medium text-gray-900">{card.expansion.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Market Price */}
                        {card.marketPrice !== null && card.marketPrice > 0 && (
                            <div className="p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-green-700">Prezzo di mercato</span>
                                    <span className="font-bold text-green-700 text-xl">
                                        €{card.marketPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {card.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrizione</h2>
                            <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Download CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-6 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">Gestisci la tua collezione</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Aggiungi carte, traccia il valore e trova dove acquistarle.
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
