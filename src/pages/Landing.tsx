import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type ViewMode = 'choice' | 'player' | 'shop'

export default function Landing() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('choice')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    city: '',
    userType: 'PLAYER' as 'PLAYER' | 'MERCHANT'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const iosScreenshots = [
    '/images/ios/IMG_1980.PNG',
    '/images/ios/IMG_1981.PNG',
    '/images/ios/IMG_1982.PNG',
    '/images/ios/IMG_1983.PNG',
    '/images/ios/IMG_1984.PNG'
  ]
  const desktopScreenshots = [
    '/images/desktop/Screenshot 2025-12-18 alle 21.48.15.png',
    '/images/desktop/Screenshot 2025-12-18 alle 21.48.28.png'
  ]
  const [currentDesktopScreenshot, setCurrentDesktopScreenshot] = useState(0)

  // Auto-scroll carousel for iOS screenshots
  useEffect(() => {
    if (viewMode !== 'player') return
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % iosScreenshots.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [viewMode, iosScreenshots.length])

  // Auto-scroll carousel for desktop screenshots
  useEffect(() => {
    if (viewMode !== 'shop') return
    const interval = setInterval(() => {
      setCurrentDesktopScreenshot((prev) => (prev + 1) % desktopScreenshots.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [viewMode, desktopScreenshots.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'}/waiting-list/join`, formData)
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        setSubmitSuccess(false)
        setFormData({ email: '', city: '', userType: 'PLAYER' })
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante l\'iscrizione. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openWaitlistModal = (userType: 'PLAYER' | 'MERCHANT') => {
    setFormData({ ...formData, userType })
    setShowModal(true)
  }

  // Choice View - Entry Point
  if (viewMode === 'choice') {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">TCG Arena</span>
            </div>
            <button
              onClick={() => navigate('/merchant/login')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Accedi
            </button>
          </div>
        </nav>

        {/* Hero - Choice Section */}
        <section className="pt-20 md:pt-52 pb-6 md:pb-24 px-4 md:px-6 min-h-[85vh] md:min-h-0 flex flex-col justify-center md:block">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-20">
            {/* Mobile: GIANT slogan with typewriter */}
            <h1 className="md:hidden text-[4.5rem] sm:text-[5.5rem] font-bold text-gray-900 tracking-tighter leading-[0.95]">
              <span className="block animate-typewriter">Giocatori.</span>
              <span className="block animate-typewriter" style={{ animationDelay: '0.8s' }}>Negozi.</span>
              <span className="text-gray-400 block mt-2">Un'unica arena.</span>
            </h1>
            {/* Desktop: 2 lines as before */}
            <h1 className="hidden md:block text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-[1.25]">
              <span className="inline-block animate-typewriter">Giocatori. Negozi.</span>
              <br />
              <span className="text-gray-400 block mt-4">Un'unica arena.</span>
            </h1>
            <p className="text-xs md:text-xl text-gray-500 max-w-2xl mx-auto mt-3 md:mt-8 px-2 md:px-0">
              La prima piattaforma italiana che unisce giocatori e negozi TCG.
            </p>
          </div>

          {/* Choice Cards - smaller on mobile */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-20">
            {/* Player Card */}
            <button
              onClick={() => setViewMode('player')}
              className="group p-4 md:p-12 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl text-left 
                hover:border-gray-900 hover:shadow-2xl hover:-translate-y-2
                transition-all duration-500 ease-out
                animate-fade-in-up animation-delay-200"
            >
              <div className="flex items-center justify-between mb-3 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center 
                  group-hover:bg-gray-900 group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-300">
                  <PlayerIcon className="w-5 h-5 md:w-7 md:h-7 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-base md:text-2xl font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-gray-900">Giocatore</h3>
              <p className="text-gray-500 text-xs md:text-base hidden md:block group-hover:text-gray-600 transition-colors">
                Cerca carte, prenota, partecipa a tornei e gestisci la tua collezione
              </p>
            </button>

            {/* Shop Card */}
            <button
              onClick={() => setViewMode('shop')}
              className="group p-4 md:p-12 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl text-left 
                hover:border-gray-900 hover:shadow-2xl hover:-translate-y-2
                transition-all duration-500 ease-out
                animate-fade-in-up animation-delay-300"
            >
              <div className="flex items-center justify-between mb-3 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center 
                  group-hover:bg-gray-900 group-hover:scale-110 group-hover:-rotate-3
                  transition-all duration-300">
                  <ShopIcon className="w-5 h-5 md:w-7 md:h-7 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-base md:text-2xl font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-gray-900">Negozio</h3>
              <p className="text-gray-500 text-xs md:text-base hidden md:block group-hover:text-gray-600 transition-colors">
                Digitalizza il tuo negozio e raggiungi nuovi clienti. Gratis.
              </p>
            </button>
          </div>
        </section>

        {/* TCG Supported Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              I TCG piu popolari, tutti in un unico posto
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {['Pokemon', 'One Piece', 'Magic', 'Yu-Gi-Oh!', 'Digimon'].map((tcg, index) => (
                <div
                  key={tcg}
                  className="group p-6 bg-white rounded-xl border border-gray-100 text-center
                    hover:border-gray-300 hover:shadow-lg hover:-translate-y-1
                    transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center
                    group-hover:bg-gray-900 transition-colors duration-300">
                    <CardIcon className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <p className="font-medium text-gray-700 text-sm">{tcg}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">100+</p>
                <p className="text-gray-500">Negozi sulla piattaforma</p>
              </div>
              <div className="p-6">
                <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">5K+</p>
                <p className="text-gray-500">Carte disponibili</p>
              </div>
              <div className="p-6">
                <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">50+</p>
                <p className="text-gray-500">Tornei ogni mese</p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Features */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
              Una piattaforma, tante possibilita
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
              Che tu sia un giocatore appassionato o un negozio specializzato,
              TCG Arena ti offre gli strumenti giusti
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<SearchIcon className="w-6 h-6" />}
                title="Ricerca Intelligente"
                description="Trova carte per nome, set o rarita. Confronta prezzi tra negozi."
              />
              <FeatureCard
                icon={<TrophyIcon className="w-6 h-6" />}
                title="Tornei Locali"
                description="Scopri tornei nella tua zona. Iscriviti e gioca."
              />
              <FeatureCard
                icon={<BookmarkIcon className="w-6 h-6" />}
                title="Prenotazioni"
                description="Prenota carte e ritirala in negozio. Semplice e veloce."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Inizia oggi
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Scegli il tuo profilo e scopri cosa TCG Arena puo fare per te
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setViewMode('player')}
                className="px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-xl 
                  hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                  transition-all duration-300"
              >
                Sono un Giocatore
              </button>
              <button
                onClick={() => setViewMode('shop')}
                className="px-8 py-4 text-base font-medium text-gray-700 border border-gray-200 rounded-xl 
                  hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5
                  transition-all duration-300"
              >
                Sono un Negozio
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>© 2025 TCG Arena. Tutti i diritti riservati.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Player View
  if (viewMode === 'player') {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setViewMode('choice')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Indietro</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">TCG Arena</span>
            </div>
            <button
              onClick={() => openWaitlistModal('PLAYER')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Lista d'attesa
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">
                  <PlayerIcon className="w-4 h-4" />
                  <span>Per Giocatori e Collezionisti</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                  Tutto il TCG
                  <br />
                  in tasca
                </h1>
                <p className="text-lg text-gray-500 mb-8 max-w-lg">
                  Cerca carte nei negozi vicini, prenota con un tap, partecipa a tornei
                  e gestisci la tua collezione. Tutto da un'unica app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => openWaitlistModal('PLAYER')}
                    className="px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Unisciti alla lista d'attesa
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>iOS e Android</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Lancio 2026</span>
                  </div>
                </div>
              </div>

              {/* App Screenshots with iPhone Frame */}
              <div className="relative">
                {/* iPhone Frame */}
                <div className="relative mx-auto w-[280px] md:w-[320px]">
                  {/* Phone outer frame */}
                  <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10"></div>
                    {/* Screen */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
                      {iosScreenshots.map((src, index) => (
                        <img
                          key={src}
                          src={src}
                          alt={`TCG Arena App - Screen ${index + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${index === currentScreenshot ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-400 rounded-full"></div>
                </div>
                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {iosScreenshots.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreenshot(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentScreenshot
                        ? 'bg-gray-900 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>
                {/* Caption */}
                <p className="text-center text-gray-400 text-sm mt-4">Disponibile su iOS e Android</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Funzionalita per Giocatori
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<SearchIcon className="w-6 h-6" />}
                title="Cerca Carte"
                description="Trova carte nei negozi della tua zona. Confronta prezzi e disponibilita in tempo reale."
              />
              <FeatureCard
                icon={<BookmarkIcon className="w-6 h-6" />}
                title="Prenota e Ritira"
                description="Prenota le carte che vuoi e ritirala in negozio. Niente piu sorprese."
              />
              <FeatureCard
                icon={<TrophyIcon className="w-6 h-6" />}
                title="Tornei"
                description="Scopri tornei nella tua citta, iscriviti e traccia i tuoi risultati."
              />
              <FeatureCard
                icon={<MessageIcon className="w-6 h-6" />}
                title="Richieste Dirette"
                description="Contatta i negozi per valutazioni, disponibilita o proposte di acquisto."
              />
              <FeatureCard
                icon={<GiftIcon className="w-6 h-6" />}
                title="Sistema Premi"
                description="Guadagna punti partecipando a tornei e giocando. Piu giochi, piu vinci."
              />
              <FeatureCard
                icon={<CollectionIcon className="w-6 h-6" />}
                title="La Tua Collezione"
                description="Gestisci la tua collezione digitale e condividila con altri giocatori."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pronto a unirti?
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Iscriviti alla lista d'attesa e ricevi aggiornamenti esclusivi
            </p>
            <button
              onClick={() => openWaitlistModal('PLAYER')}
              className="px-10 py-4 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Iscriviti Ora
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>© 2025 TCG Arena. Tutti i diritti riservati.</p>
          </div>
        </footer>

        {/* Modal */}
        {showModal && <WaitlistModal
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitSuccess={submitSuccess}
          error={error}
          onClose={() => setShowModal(false)}
        />}
      </div>
    )
  }

  // Shop View
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setViewMode('choice')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Indietro</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">TCG Arena</span>
            <span className="text-gray-400 font-medium">Business</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/merchant/login')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Accedi
            </button>
            <button
              onClick={() => openWaitlistModal('MERCHANT')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Registrati Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 mb-6">
                <CheckIcon className="w-4 h-4" />
                <span className="font-medium">100% Gratuito - Per sempre</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Porta il tuo negozio
                <br />
                <span className="text-gray-400">nel futuro</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-lg">
                Digitalizza il tuo negozio TCG senza costi. Raggiungi migliaia di giocatori
                nella tua zona e fai crescere il tuo business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => openWaitlistModal('MERCHANT')}
                  className="px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-xl 
                    hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-300"
                >
                  Inizia Gratis
                </button>
                <button
                  onClick={() => navigate('/merchant/login')}
                  className="px-8 py-4 text-base font-medium text-gray-700 border border-gray-200 rounded-xl 
                    hover:bg-gray-50 hover:border-gray-300
                    transition-all duration-300"
                >
                  Sei gia registrato? Accedi
                </button>
              </div>
              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Nessuna carta di credito
                </span>
                <span className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Setup in 5 minuti
                </span>
              </div>
            </div>

            {/* Dashboard Screenshots with Safari Frame */}
            <div className="relative animate-fade-in-up animation-delay-200">
              {/* Safari Browser Frame */}
              <div className="bg-gray-200 rounded-xl shadow-2xl overflow-hidden">
                {/* Browser Top Bar */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                  {/* Traffic lights */}
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* URL Bar */}
                  <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 text-center">
                    dashboard.tcgarena.it
                  </div>
                </div>
                {/* Browser Content */}
                <div className="relative aspect-video bg-gray-50">
                  {desktopScreenshots.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`TCG Arena Dashboard - Screen ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${index === currentDesktopScreenshot ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                  ))}
                </div>
              </div>
              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {desktopScreenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDesktopScreenshot(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentDesktopScreenshot
                      ? 'bg-gray-900 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <p className="text-3xl font-bold mb-1">0€</p>
              <p className="text-gray-400 text-sm">Costo mensile</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold mb-1">0%</p>
              <p className="text-gray-400 text-sm">Commissioni vendita</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold mb-1">1000+</p>
              <p className="text-gray-400 text-sm">Giocatori attivi</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold mb-1">24/7</p>
              <p className="text-gray-400 text-sm">Visibilita online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why TCG Arena */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Perche scegliere TCG Arena?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            La piattaforma pensata per far crescere i negozi TCG in Italia
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
                <ChartIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visibilita Immediata</h3>
              <p className="text-gray-500">
                Appari nelle ricerche di migliaia di giocatori nella tua zona.
                Fatti trovare da chi cerca carte, tornei ed eventi.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
                <InventoryIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestione Semplificata</h3>
              <p className="text-gray-500">
                Dashboard intuitiva per gestire inventario, prenotazioni e tornei.
                Import bulk delle carte con un click.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
                <TrophyIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tornei Automatizzati</h3>
              <p className="text-gray-500">
                Crea tornei, gestisci iscrizioni e classifica partecipanti.
                Notifiche automatiche ai giocatori iscritti.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
                <MessageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comunicazione Diretta</h3>
              <p className="text-gray-500">
                Ricevi richieste dai clienti, pubblica news e aggiornamenti.
                Costruisci una community fedele attorno al tuo negozio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Tutto quello che ti serve
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<InventoryIcon className="w-6 h-6" />}
              title="Gestione Inventario"
              description="Carica carte singolarmente o in bulk. Aggiornamenti in tempo reale."
            />
            <FeatureCard
              icon={<TrophyIcon className="w-6 h-6" />}
              title="Organizza Tornei"
              description="Crea tornei ufficiali e locali. Gestione automatica iscrizioni."
            />
            <FeatureCard
              icon={<BookmarkIcon className="w-6 h-6" />}
              title="Sistema Prenotazioni"
              description="I clienti prenotano, tu confermi. Validazione QR in negozio."
            />
            <FeatureCard
              icon={<MessageIcon className="w-6 h-6" />}
              title="Richieste Clienti"
              description="Ricevi richieste di valutazione e disponibilita direttamente in app."
            />
            <FeatureCard
              icon={<NewsIcon className="w-6 h-6" />}
              title="Pubblica Notizie"
              description="Comunica novita, arrivi e promozioni ai tuoi follower."
            />
            <FeatureCard
              icon={<ChartIcon className="w-6 h-6" />}
              title="Statistiche"
              description="Monitora prenotazioni, visite e interesse per le tue carte."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Inizia oggi. E gratis.
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Nessun costo nascosto. Nessuna commissione. Solo crescita per il tuo negozio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openWaitlistModal('MERCHANT')}
              className="px-10 py-4 text-base font-medium text-gray-900 bg-white rounded-xl 
                hover:bg-gray-100 hover:shadow-lg
                transition-all duration-300"
            >
              Registrati Gratis
            </button>
            <button
              onClick={() => navigate('/merchant/login')}
              className="px-10 py-4 text-base font-medium text-white border border-gray-600 rounded-xl 
                hover:bg-gray-800 hover:border-gray-500
                transition-all duration-300"
            >
              Accedi
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Ti contatteremo entro 24h per completare la registrazione
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 TCG Arena. Tutti i diritti riservati.</p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && <WaitlistModal
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        error={error}
        onClose={() => setShowModal(false)}
      />}
    </div>
  )
}

// ============ Components ============

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}

interface WaitlistModalProps {
  formData: { email: string; city: string; userType: 'PLAYER' | 'MERCHANT' }
  setFormData: (data: { email: string; city: string; userType: 'PLAYER' | 'MERCHANT' }) => void
  handleSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  submitSuccess: boolean
  error: string
  onClose: () => void
}

function WaitlistModal({ formData, setFormData, handleSubmit, isSubmitting, submitSuccess, error, onClose }: WaitlistModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lista d'Attesa
            </h2>
            <p className="text-gray-500 text-sm">
              Ricevi aggiornamenti esclusivi sul lancio
            </p>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sei nella lista!</h3>
              <p className="text-gray-500">Ti contatteremo presto</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 transition-colors"
                  placeholder="tua.email@esempio.it"
                />
              </div>

              {/* City Input */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Citta
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 transition-colors"
                  placeholder="Milano"
                />
              </div>

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di utente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'PLAYER' })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${formData.userType === 'PLAYER'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <PlayerIcon className={`w-6 h-6 mx-auto mb-2 ${formData.userType === 'PLAYER' ? 'text-gray-900' : 'text-gray-400'}`} />
                    <div className={`font-medium text-sm ${formData.userType === 'PLAYER' ? 'text-gray-900' : 'text-gray-500'}`}>Giocatore</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'MERCHANT' })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${formData.userType === 'MERCHANT'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <ShopIcon className={`w-6 h-6 mx-auto mb-2 ${formData.userType === 'MERCHANT' ? 'text-gray-900' : 'text-gray-400'}`} />
                    <div className={`font-medium text-sm ${formData.userType === 'MERCHANT' ? 'text-gray-900' : 'text-gray-500'}`}>Negozio</div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Invio in corso...' : 'Unisciti alla Lista'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Nessuna email spam. Cancellazione in 1 click.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ Icons ============

function PlayerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function ShopIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  )
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function CardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function BookmarkIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )
}

function TrophyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  )
}

function MessageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}

function GiftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function CollectionIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
    </svg>
  )
}

function InventoryIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function ChartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function NewsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  )
}

function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  )
}

function DesktopIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  )
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
