import { useState } from 'react'

interface PricingPlan {
    name: string
    price: string
    requestsPerDay: string
    batchSize: number
    features: string[]
    highlighted?: boolean
    comingSoon?: boolean
}

const pricingPlans: PricingPlan[] = [
    {
        name: 'Free',
        price: '$0',
        requestsPerDay: '100',
        batchSize: 20,
        features: [
            '100 API requests/day',
            '20 cards per batch lookup',
            'All games & sets',
            'Real-time pricing data',
            'Community support'
        ]
    },
    {
        name: 'Starter',
        price: '$29',
        requestsPerDay: '1,000',
        batchSize: 100,
        features: [
            '1,000 API requests/day',
            '100 cards per batch lookup',
            'All games & sets',
            'Real-time pricing data',
            'Price history access',
            'Email support'
        ]
    },
    {
        name: 'Pro',
        price: '$99',
        requestsPerDay: '10,000',
        batchSize: 200,
        highlighted: true,
        features: [
            '10,000 API requests/day',
            '200 cards per batch lookup',
            'All games & sets',
            'Real-time pricing data',
            'Price history & analytics',
            'Priority support',
            'Webhooks (coming soon)'
        ]
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        requestsPerDay: 'Unlimited',
        batchSize: 200,
        features: [
            'Unlimited API requests',
            '200 cards per batch lookup',
            'All games & sets',
            'Real-time pricing data',
            'Full analytics suite',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantee'
        ]
    }
]

const supportedGames = [
    { name: 'Pokémon', id: 'pokemon', color: '#FFCB05' },
    { name: 'Magic: The Gathering', id: 'mtg', color: '#9B5DE5' },
    { name: 'Yu-Gi-Oh!', id: 'yugioh', color: '#E53935' },
    { name: 'Disney Lorcana', id: 'lorcana', color: '#00B4D8' },
    { name: 'One Piece TCG', id: 'onepiece', color: '#F72585' },
    { name: 'Digimon', id: 'digimon', color: '#4CC9F0' }
]

const endpoints = [
    { method: 'GET', path: '/api/arena/games', description: 'List all supported games' },
    { method: 'GET', path: '/api/arena/sets?game={id}', description: 'List sets for a game' },
    { method: 'GET', path: '/api/arena/cards?q={name}', description: 'Search cards by name' },
    { method: 'GET', path: '/api/arena/cards/{id}', description: 'Get card with all variants' },
    { method: 'POST', path: '/api/arena/cards/batch', description: 'Batch lookup by IDs' },
    { method: 'GET', path: '/api/arena/cards/tcgplayer/{id}', description: 'Lookup by TCGPlayer ID' }
]

export default function ApiSdk() {
    const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'pricing'>('overview')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">Arena API</h1>
                            <p className="text-white/60 text-xs">by TCG Arena</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`text-sm font-medium transition-colors ${activeTab === 'docs' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            Documentation
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            Pricing
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            {activeTab === 'overview' && (
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                            <span className="text-purple-200 text-sm">Coming Soon</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Real-Time TCG
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Pricing API</span>
                        </h1>

                        <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                            Access real-time pricing data for Pokémon, Magic: The Gathering, Yu-Gi-Oh!,
                            and more. Build powerful applications with our comprehensive TCG database.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-16">
                            <button
                                disabled
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg opacity-50 cursor-not-allowed"
                            >
                                Get API Key (Coming Soon)
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-lg transition-all"
                            >
                                View Documentation
                            </button>
                        </div>

                        {/* Supported Games */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {supportedGames.map(game => (
                                <div
                                    key={game.id}
                                    className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                                >
                                    <span className="text-white/80 text-sm">{game.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            {activeTab === 'overview' && (
                <section className="py-20 px-6 bg-black/20">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">Why Arena API?</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Prices</h3>
                                <p className="text-white/60">Updated pricing data from TCGPlayer with condition-specific variants (NM, LP, MP, HP).</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Data</h3>
                                <p className="text-white/60">Full card database with images, rarity, set info, and cross-references to TCGPlayer, Scryfall, and more.</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Batch Lookups</h3>
                                <p className="text-white/60">Efficiently fetch up to 200 cards per request for high-volume applications.</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Documentation */}
            {activeTab === 'docs' && (
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-8">API Documentation</h2>

                        {/* Quick Start */}
                        <div className="mb-12">
                            <h3 className="text-xl font-semibold text-white mb-4">Quick Start</h3>
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                                <p className="text-white/70 mb-4">All requests require an API key in the header:</p>
                                <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto">
                                    <code className="text-green-400">
                                        {`curl -X GET "https://api.tcgarena.com/api/arena/games" \\
  -H "X-Arena-Api-Key: your_api_key_here"`}
                                    </code>
                                </pre>
                            </div>
                        </div>

                        {/* Endpoints */}
                        <div className="mb-12">
                            <h3 className="text-xl font-semibold text-white mb-4">Endpoints</h3>
                            <div className="space-y-3">
                                {endpoints.map((endpoint, i) => (
                                    <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-white/80 font-mono text-sm flex-1">{endpoint.path}</code>
                                        <span className="text-white/50 text-sm">{endpoint.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Response Example */}
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Response Example</h3>
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                                <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code className="text-white/80">
                                        {`{
  "id": "pokemon-sv-charizard-ex-125",
  "name": "Charizard ex",
  "gameId": "pokemon",
  "setId": "scarlet-violet-pokemon",
  "setName": "Scarlet & Violet",
  "rarity": "Double Rare",
  "tcgplayerId": "497569",
  "imageUrl": "https://...",
  "variants": [
    {
      "id": "..._near-mint",
      "condition": "Near Mint",
      "printing": "Normal",
      "price": 42.99,
      "lastUpdatedEpoch": 1703100261
    },
    {
      "id": "..._near-mint_foil",
      "condition": "Near Mint", 
      "printing": "Foil",
      "price": 89.99,
      "lastUpdatedEpoch": 1703100261
    }
  ]
}`}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Pricing */}
            {activeTab === 'pricing' && (
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
                            <p className="text-white/60">Choose the plan that fits your needs</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {pricingPlans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`rounded-2xl p-6 border ${plan.highlighted
                                            ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50'
                                            : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    {plan.highlighted && (
                                        <div className="text-xs font-semibold text-purple-300 mb-2">MOST POPULAR</div>
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="text-white/60">/month</span>}
                                    </div>

                                    <div className="text-sm text-white/60 mb-4">
                                        <div>{plan.requestsPerDay} requests/day</div>
                                        <div>{plan.batchSize} cards/batch</div>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        disabled
                                        className={`w-full py-3 rounded-xl font-semibold text-sm opacity-50 cursor-not-allowed ${plan.highlighted
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-white/10 text-white border border-white/20'
                                            }`}
                                    >
                                        Coming Soon
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="text-white/40 text-sm">
                        © {new Date().getFullYear()} TCG Arena. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">Home</a>
                        <a href="mailto:api@tcgarena.com" className="text-white/60 hover:text-white text-sm transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
