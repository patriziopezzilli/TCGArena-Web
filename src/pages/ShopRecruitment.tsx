import { Link } from 'react-router-dom'

export default function ShopRecruitment() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            TCG Arena
                        </span>
                    </Link>
                    <Link
                        to="/merchant/register"
                        className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Registra Negozio
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-8 border border-white/10 animate-fade-in">
                        <span className="text-4xl">🏪</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        Porta il tuo Negozio <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Nel Futuro
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Unisciti a TCG Arena e trasforma il modo in cui gestisci tornei, vendite e la tua community.
                        Completamente gratuito, per sempre.
                    </p>

                    <Link
                        to="/merchant/register"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                        Inizia Ora
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
                    {/* Visibility */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Visibilità Totale</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Raggiungi migliaia di giocatori nella tua zona. Il tuo negozio apparirà sulla mappa e nelle ricerche di chi cerca tornei e carte.
                        </p>
                    </div>

                    {/* Management */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Gestione Semplificata</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Gestisci inventario, ordini e prenotazioni da un unico pannello di controllo intuitivo e moderno.
                        </p>
                    </div>

                    {/* Tournaments */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Tornei & Eventi</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Crea e gestisci tornei con facilità. Pairing automatici, calcolo classifiche e notifiche push ai partecipanti.
                        </p>
                    </div>
                </div>

                {/* Testimonial/Trust */}
                <div className="max-w-3xl mx-auto text-center p-12 rounded-4xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                    <h2 className="text-3xl font-bold mb-6">Gratuito. Davvero.</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Nessuna commissione, nessun abbonamento mensile. TCG Arena è nato per supportare la community e i negozi locali.
                    </p>
                    <Link
                        to="/merchant/register"
                        className="text-white font-semibold flex items-center justify-center gap-2 hover:gap-4 transition-all"
                    >
                        Registra il tuo negozio
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </main>
        </div>
    )
}
