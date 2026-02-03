import {
    TournamentIcon,
    MapPinIcon,
    GiftIcon,
    GooglePlayIcon
} from '../components/Icons'

export default function QrCodeLanding() {

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
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-full text-sm text-white mb-8 animate-fade-in-up shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span className="font-bold tracking-wide">DISPONIBILE ORA</span>
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
                <div className="max-w-lg mx-auto">
                    <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">I tuoi giochi preferiti</p>
                    <div className="flex flex-wrap justify-center items-center gap-4 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
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
                        {/* Dragon Ball Super Fusion World */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/dragonball.png" alt="Dragon Ball" className="w-full h-full object-contain" />
                        </div>
                        {/* Lorcana */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/lorcana.png" alt="Lorcana" className="w-full h-full object-contain" />
                        </div>
                        {/* Flesh and Blood */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/flesh_and_blood.png" alt="Flesh and Blood" className="w-full h-full object-contain" />
                        </div>
                        {/* Union Arena */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/union_arena.png" alt="Union Arena" className="w-full h-full object-contain" />
                        </div>
                        {/* Riftbound */}
                        <div className="w-10 h-10 object-contain">
                            <img src="/images/tcg/riftbound.png" alt="Riftbound" className="w-full h-full object-contain" />
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

            {/* Download App Section */}
            <section className="py-16 px-6">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Scarica l'app ora</h2>
                        <p className="text-gray-500">
                            Disponibile su iOS. Scarica l'app e inizia subito a scoprire negozi, carte e tornei vicino a te.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-700 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                        {/* iOS Badge */}
                        <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            DISPONIBILE ORA
                        </div>

                        <div className="relative space-y-6 text-center">
                            {/* App Icon */}
                            <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-gray-900">TCG</span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">TCG Arena</h3>
                                <p className="text-gray-400 text-sm mb-6">La tua app per il mondo TCG</p>
                            </div>

                            {/* Download Button */}
                            <a
                                href="https://apps.apple.com/it/app/tcg-arena/id6757301894"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <AppleIcon className="w-6 h-6" />
                                Scarica su App Store
                            </a>

                            <a
                                href="https://play.google.com/store/apps/details?id=it.tcgarena.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 mt-4"
                            >
                                <GooglePlayIcon className="w-6 h-6" />
                                Scarica su Google Play
                            </a>

                            <p className="text-xs text-gray-400 mt-4">
                                Disponibile ora su iOS e Android
                            </p>
                        </div>
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

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
    )
}
