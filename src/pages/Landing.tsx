import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">TCG Arena</div>
          <div className="flex items-center gap-4">
            <Link
              to="/waiting-list"
              className="group px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Unisciti alla lista d'attesa
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-in-up">
            Dove collezionisti
            <br />
            e negozi
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
              si incontrano
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            L'unica piattaforma che unisce giocatori, collezionisti e negozi TCG. 
            Trova carte, prenota, partecipa a tornei. Tutti premiati, tutti connessi.
          </p>
          <div className="flex flex-col items-center gap-6 animate-fade-in-up animation-delay-400">
            <Link
              to="/waiting-list"
              className="group px-12 py-5 text-lg font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <span className="flex items-center gap-3">
                🚀 Unisciti alla lista d'attesa
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 animate-pulse">
              Sii tra i primi • Coming 2026
            </p>
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              Scopri di più
              <span>↓</span>
            </a>
          </div>
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
            <Link
              to="/waiting-list"
              className="group inline-block px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Iscriviti alla lista d'attesa
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </Link>
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
