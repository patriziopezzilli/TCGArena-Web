import { useState } from 'react'
import axios from 'axios'
import {
    TournamentIcon,
    MapPinIcon,
    GiftIcon,
    CheckCircleIcon
} from '../components/Icons'

export default function QrCodeLanding() {
    const [formData, setFormData] = useState({
        email: '',
        city: '',
        userType: 'PLAYER'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/waiting-list/join`, formData)
            setMessage({ text: response.data.message, type: 'success' })
            setFormData({ email: '', city: '', userType: 'PLAYER' })
        } catch (error: any) {
            setMessage({
                text: error.response?.data?.message || 'Errore durante la registrazione. Riprova.',
                type: 'error'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navbar Minimal */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center">
                    <span className="text-xl font-bold text-gray-900">TCG Arena</span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -z-10 animate-blob"></div>

                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-sm text-white mb-8 animate-fade-in-up shadow-lg">
                        <span className="font-bold tracking-wide">LANCIO 2026</span>
                    </div>

                    <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] animate-fade-in-up animation-delay-200">
                        Nato da appassionati, <br />
                        <span className="text-gray-400">
                            per appassionati.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-600 mb-8 animate-fade-in-up animation-delay-300">
                        Unisciti alla rivoluzione del TCG in Italia.
                        Tutto ciò che ti serve per giocare, scambiare e vincere.
                    </p>
                </div>
            </section>

            {/* TCG Supported Section - Compact Version */}
            <section className="py-8 px-6 bg-white border-b border-gray-50">
                <div className="max-w-md mx-auto">
                    <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">I tuoi giochi preferiti</p>
                    <div className="flex justify-between items-center gap-4 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Pokemon */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/pokemon.png" alt="Pokemon" className="w-full h-full object-contain" />
                        </div>
                        {/* One Piece */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/onepiece.png" alt="One Piece" className="w-full h-full object-contain" />
                        </div>
                        {/* Magic */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/magic.png" alt="Magic" className="w-full h-full object-contain" />
                        </div>
                        {/* Yu-Gi-Oh */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/yugioh.png" alt="Yu-Gi-Oh!" className="w-full h-full object-contain" />
                        </div>
                        {/* Digimon */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/digimon.png" alt="Digimon" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Stacking Cards */}
            <section className="py-12 px-6 bg-gray-50">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Tournaments Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                            <TournamentIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Tornei Locali</h3>
                        <p className="text-gray-500">
                            Iscriviti ai tornei nella tua città con un click.
                            Decklist digitali, pairings live e risultati in tempo reale.
                        </p>
                    </div>

                    {/* Radar Card */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl"></div>
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4 border border-gray-700">
                            <MapPinIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Trade Radar</h3>
                        <p className="text-gray-400">
                            Trova le carte che ti servono dai giocatori vicino a te.
                            Il radar ti notifica quando appare una carta della tua wishlist.
                        </p>
                    </div>

                    {/* Rewards Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <GiftIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Punti & Premi</h3>
                        <p className="text-gray-500">
                            Gioca, scambia e guadagna punti.
                            Riscatta bustine, accessori e sconti nei tuoi negozi preferiti.
                        </p>
                    </div>
                </div>
            </section>

            {/* Waiting List Form Section */}
            <section className="py-16 px-6">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Non rimanere indietro</h2>
                        <p className="text-gray-500">
                            Iscriviti ora alla lista d'attesa per ottenere l'accesso anticipato e un badge esclusivo "Founder".
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative">
                        {/* Founder Badge Decoration */}
                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                            FOUNDER BADGE INCLUDED
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white ${focusedField === 'email'
                                            ? 'border-gray-900 shadow-lg'
                                            : 'border-gray-100 hover:border-gray-300'
                                            }`}
                                        placeholder="mario@esempio.it"
                                    />
                                </div>
                            </div>

                            {/* City Field */}
                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                                    Città
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        onFocus={() => setFocusedField('city')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white ${focusedField === 'city'
                                            ? 'border-gray-900 shadow-lg'
                                            : 'border-gray-100 hover:border-gray-300'
                                            }`}
                                        placeholder="Milano"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Invio...
                                    </span>
                                ) : (
                                    'Entra in Lista d\'Attesa'
                                )}
                            </button>

                            {/* Success/Error Message */}
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-100'
                                    : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {message.type === 'success' && <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />}
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-center text-gray-400 mt-4">
                                *Iscrivendoti accetti di ricevere aggiornamenti sul lancio. No spam, promesso.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            <footer className="py-8 text-center text-sm space-y-2">
                <p className="text-gray-400">© 2025 TCG Arena</p>
                <p>
                    <a href="https://www.tcgarena.it" className="text-gray-500 hover:text-gray-900 font-medium underline decoration-gray-300 underline-offset-4 transition-colors">
                        Visita il sito ufficiale per maggiori info
                    </a>
                </p>
            </footer>
        </div>
    )
}
