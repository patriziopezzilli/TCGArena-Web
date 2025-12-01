import { useState } from 'react'
import axios from 'axios'

export default function Landing() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    city: '',
    userType: 'PLAYER' as 'PLAYER' | 'MERCHANT'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await axios.post('http://localhost:8080/api/waiting-list/join', formData)
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-bold text-gray-900">TCG Arena</div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#tcg" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              TCG Supportati
            </a>
            <a href="#mission" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Mission
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="group px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Iscriviti
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="md:hidden px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg"
          >
            Lista d'attesa
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 leading-tight animate-fade-in-up">
            Dove collezionisti
            <br />
            e negozi
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
              si incontrano
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            L'unica piattaforma che unisce giocatori, collezionisti e negozi TCG. 
            Trova carte, prenota, partecipa a tornei.
          </p>
          <div className="flex flex-col items-center gap-4 animate-fade-in-up animation-delay-400">
            <button
              onClick={() => setShowModal(true)}
              className="group px-8 md:px-12 py-4 md:py-5 text-base md:text-lg font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Unisciti alla lista d'attesa
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </button>
            <p className="text-xs md:text-sm text-gray-500">
              📱 iOS & Android • 🚀 Lancio 2026
            </p>
          </div>
        </div>
      </section>

      {/* TCG Supported Section */}
      <section id="tcg" className="py-16 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tutti i TCG che ami, in un unico posto
            </h2>
            <p className="text-lg text-gray-600">
              Supporto completo per i giochi di carte collezionabili più popolari
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <TCGCard name="Pokémon TCG" icon="⚡" color="from-yellow-400 to-red-500" />
            <TCGCard name="One Piece TCG" icon="🏴‍☠️" color="from-orange-400 to-red-600" />
            <TCGCard name="Magic: The Gathering" icon="🔮" color="from-purple-500 to-pink-600" />
            <TCGCard name="Yu-Gi-Oh!" icon="🎴" color="from-blue-500 to-purple-600" />
            <TCGCard name="Digimon TCG" icon="🦖" color="from-green-400 to-blue-500" />
          </div>
          <p className="text-center mt-8 text-gray-500 text-sm font-medium">
            e molto altro...
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Una piattaforma, infinite possibilità
            </h2>
            <p className="text-lg text-gray-600">
              Per giocatori, collezionisti e negozi. Finalmente insieme.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔍"
              title="Trova le tue carte"
              description="Cerca tra migliaia di carte nei negozi della tua zona. Confronta prezzi e condizioni in tempo reale."
            />
            <FeatureCard
              icon="📲"
              title="Prenota e ritira"
              description="Prenota le carte che ti interessano e ritirala in negozio. Niente più chiamate o carte già vendute."
            />
            <FeatureCard
              icon="🏆"
              title="Tornei vicino a te"
              description="Scopri tornei nella tua città, registrati con un tap e tieni traccia dei tuoi risultati."
            />
            <FeatureCard
              icon="💬"
              title="Richieste dirette"
              description="Cerca una carta rara? Vuoi una valutazione? Contatta i negozi direttamente dall'app."
            />
            <FeatureCard
              icon="🎁"
              title="Sistema a premi"
              description="Guadagna punti partecipando a tornei e completando collezioni. Più giochi, più vinci."
            />
            <FeatureCard
              icon="📊"
              title="La tua collezione"
              description="Gestisci la tua collezione digitale, monitora il valore delle tue carte e condividila con amici."
            />
          </div>
        </div>
      </section>

      {/* For Merchants Section */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sei un negoziante?
            </h2>
            <p className="text-xl text-gray-600">
              Gestisci il tuo negozio, raggiungi più clienti, organizza tornei. 
              Tutto da un'unica piattaforma.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📦 Inventario sempre aggiornato
              </h3>
              <p className="text-gray-600">
                Gestisci le scorte facilmente con aggiornamenti in tempo reale
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎯 Più visibilità locale
              </h3>
              <p className="text-gray-600">
                Appari nelle ricerche dei giocatori della tua zona
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🏆 Gestione tornei semplificata
              </h3>
              <p className="text-gray-600">
                Organizza tornei e gestisci iscrizioni automaticamente
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💰 Vendite garantite
              </h3>
              <p className="text-gray-600">
                Le prenotazioni bloccano le carte, niente più vendite perse
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="group inline-block px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Iscriviti alla lista d'attesa
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </button>
            <p className="mt-6 text-sm text-gray-500">
              Ti contatteremo appena saremo pronti • Nessun impegno
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>© 2025 TCG Arena. All rights reserved.</p>
        </div>
      </footer>

      {/* Mission Section */}
      <section id="mission" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            La Nostra Mission
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Vogliamo <span className="text-white font-semibold">rivoluzionare</span> il mondo dei Trading Card Games in Italia, 
            creando un <span className="text-white font-semibold">ecosistema digitale</span> che unisca giocatori, collezionisti e negozi.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <MissionCard 
              icon="🎯"
              title="Accessibilità"
              description="Rendere il TCG accessibile a tutti, ovunque tu sia"
            />
            <MissionCard 
              icon="🤝"
              title="Comunità"
              description="Connettere giocatori e negozi locali per far crescere la community"
            />
            <MissionCard 
              icon="🚀"
              title="Innovazione"
              description="Portare tecnologia all'avanguardia nel mondo delle carte collezionabili"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full text-sm font-semibold">
            🚀 Lancio 2026 • iOS & Android
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pronto a entrare nell'Arena?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Unisciti alla lista d'attesa e ricevi aggiornamenti esclusivi sul lancio
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-block px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <span className="flex items-center gap-3">
              🚀 Iscriviti Ora
              <span className="transform group-hover:translate-x-2 transition-transform">→</span>
            </span>
          </button>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              100% Gratuito
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Nessuna Email Spam
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Cancellazione in 1 Click
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>© 2025 TCG Arena. All rights reserved.</p>
        </div>
      </footer>

      {/* Waiting List Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block mb-4 p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Unisciti alla Lista d'Attesa
                </h2>
                <p className="text-gray-600">
                  Ricevi aggiornamenti esclusivi sul lancio 2026
                </p>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="mb-4 text-6xl">✅</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sei nella lista!</h3>
                  <p className="text-gray-600">Ti contatteremo presto con aggiornamenti esclusivi</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 transition-colors"
                      placeholder="tua.email@esempio.it"
                    />
                  </div>

                  {/* City Input */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Città
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 transition-colors"
                      placeholder="Milano"
                    />
                  </div>

                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo di utente
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: 'PLAYER' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.userType === 'PLAYER'
                            ? 'border-gray-900 bg-gray-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">🎮</div>
                        <div className="font-semibold text-gray-900">Giocatore</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: 'MERCHANT' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.userType === 'MERCHANT'
                            ? 'border-gray-900 bg-gray-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">🏪</div>
                        <div className="font-semibold text-gray-900">Negozio</div>
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Invio in corso...' : 'Unisciti alla Lista'}
                  </button>

                  {/* Privacy Info */}
                  <p className="text-xs text-gray-500 text-center">
                    100% gratuito • Nessuna email spam • Cancellazione in 1 click
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TCGCardProps {
  name: string
  icon: string
  color: string
}

function TCGCard({ name, icon, color }: TCGCardProps) {
  return (
    <div className="group relative p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative text-center">
        <div className="text-5xl mb-3 transform group-hover:scale-125 transition-transform duration-300">{icon}</div>
        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
      </div>
    </div>
  )
}

interface MissionCardProps {
  icon: string
  title: string
  description: string
}

function MissionCard({ icon, title, description }: MissionCardProps) {
  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-900 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
      <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-primary">{title}</h3>
      <p className="text-gray-600 transition-colors group-hover:text-gray-900">{description}</p>
    </div>
  )
}
