import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { merchantService } from '../services/api'

export default function MerchantLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login
      const response = await merchantService.login(formData.username, formData.password)

      // Save token
      localStorage.setItem('merchant_token', response.token)
      localStorage.setItem('merchant_user', JSON.stringify(response.user))

      // Check if user is admin
      if (response.user.isAdmin) {
        localStorage.setItem('is_admin', 'true')
      } else {
        localStorage.removeItem('is_admin')
      }

      // Redirect to dashboard
      navigate('/merchant/dashboard')
    } catch (err: any) {
      setError(err.response?.data || 'Errore durante il login. Verifica le credenziali.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      <div className="max-w-md w-full relative animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="group inline-block">
            <h1 className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
              TCG Arena
            </h1>
            <div className="h-1 bg-gray-900 rounded-full mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bentornato</h2>
            <p className="text-sm text-gray-600">
              Accedi per gestire il tuo negozio
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-shake">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className={`block text-sm font-medium transition-colors duration-200 ${focusedField === 'username' ? 'text-gray-900' : 'text-gray-600'
                  }`}
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-gray-900 transition-all duration-300 outline-none placeholder:text-gray-400"
                  placeholder="Il tuo username"
                  required
                />
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${focusedField === 'username' ? 'w-full' : 'w-0'
                  }`}></div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className={`block text-sm font-medium transition-colors duration-200 ${focusedField === 'password' ? 'text-gray-900' : 'text-gray-600'
                  }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-gray-900 transition-all duration-300 outline-none placeholder:text-gray-400"
                  placeholder="••••••••••"
                  required
                />
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${focusedField === 'password' ? 'w-full' : 'w-0'
                  }`}></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 px-4 bg-gray-900 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    Accedi
                    <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </form>

          {/* Registration disabled for now */}
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Non hai un account?{' '}
              <Link 
                to="/merchant/register" 
                className="font-semibold text-gray-900 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                Registrati
                <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </p>
          </div> */}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-1 group"
          >
            <span className="transform transition-transform duration-200 group-hover:-translate-x-1">←</span>
            Torna alla homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
