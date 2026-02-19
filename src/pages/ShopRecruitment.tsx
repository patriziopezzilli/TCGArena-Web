import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ShopRecruitment() {
    const { t } = useTranslation()

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
                        {t('shopRecruitment.header.register')}
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Custom Floating Animation */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        33% { transform: translateY(-20px) rotate(2deg); }
                        66% { transform: translateY(10px) rotate(-1deg); }
                    }
                    .animate-float {
                        animation: float 15s ease-in-out infinite;
                    }
                `}} />

                {/* Animated TCG Background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 select-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-black z-10" />
                    {[
                        { src: '/images/tcg/pokemon.png', size: 'w-24', top: '10%', left: '5%', delay: '0s', duration: '20s' },
                        { src: '/images/tcg/onepiece.png', size: 'w-20', top: '30%', right: '10%', delay: '2s', duration: '18s' },
                        { src: '/images/tcg/magic.png', size: 'w-28', bottom: '20%', left: '15%', delay: '5s', duration: '25s' },
                        { src: '/images/tcg/yugioh.png', size: 'w-24', top: '60%', right: '20%', delay: '1s', duration: '22s' },
                        { src: '/images/tcg/lorcana.png', size: 'w-20', top: '15%', left: '45%', delay: '8s', duration: '28s' },
                        { src: '/images/tcg/dragonball.png', size: 'w-24', bottom: '40%', right: '5%', delay: '3s', duration: '21s' },
                        { src: '/images/tcg/digimon.png', size: 'w-16', top: '50%', left: '10%', delay: '10s', duration: '19s' },
                        { src: '/images/tcg/union_arena.png', size: 'w-20', bottom: '10%', right: '40%', delay: '6s', duration: '23s' },
                    ].map((logo, i) => (
                        <div
                            key={i}
                            className={`absolute ${logo.size} opacity-10 hover:opacity-50 transition-opacity duration-1000`}
                            style={{
                                top: logo.top,
                                left: logo.left,
                                right: logo.right,
                                bottom: logo.bottom,
                                animation: `float ${logo.duration} ease-in-out infinite`,
                                animationDelay: logo.delay
                            }}
                        >
                            <img src={logo.src} alt="" className="w-full h-full object-contain filter grayscale brightness-200 contrast-125" />
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
                    <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
                        {t('shopRecruitment.hero.title1')} <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            {t('shopRecruitment.hero.title2')}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        {t('shopRecruitment.hero.description')}
                    </p>

                    {/* Marketing Message - Community Want You */}
                    <div className="max-w-2xl mx-auto mb-12 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 text-center animate-bounce-subtle shadow-2xl shadow-blue-500/10">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-3xl">❤️</span>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                                {t('shopRecruitment.marketing.title')}
                            </h3>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {t('shopRecruitment.marketing.message')}
                        </p>
                    </div>

                    <Link
                        to="/merchant/register"
                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    >
                        {t('shopRecruitment.hero.cta')}
                        <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                        <h3 className="text-xl font-bold mb-3">{t('shopRecruitment.features.visibility.title')}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {t('shopRecruitment.features.visibility.desc')}
                        </p>
                    </div>

                    {/* Management */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('shopRecruitment.features.management.title')}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {t('shopRecruitment.features.management.desc')}
                        </p>
                    </div>

                    {/* Tournaments */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('shopRecruitment.features.tournaments.title')}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {t('shopRecruitment.features.tournaments.desc')}
                        </p>
                    </div>
                </div>

                {/* Testimonial/Trust */}
                <div className="max-w-3xl mx-auto text-center p-12 rounded-4xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                    <h2 className="text-3xl font-bold mb-6">{t('shopRecruitment.trust.title')}</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        {t('shopRecruitment.trust.desc')}
                    </p>
                    <Link
                        to="/merchant/register"
                        className="text-white font-semibold flex items-center justify-center gap-2 hover:gap-4 transition-all"
                    >
                        {t('shopRecruitment.trust.cta')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </main>
        </div>
    )
}
