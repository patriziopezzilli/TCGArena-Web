import { useState } from 'react'
import axios from 'axios'

export default function WaitingList() {
  const [formData, setFormData] = useState({
    email: '',
    city: '',
    userType: 'PLAYER' as 'PLAYER' | 'MERCHANT'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6 p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <h1 className="text-4xl font-bold text-white">TCG Arena</h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stiamo arrivando! 🚀
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Unisciti alla lista d'attesa e sii tra i primi a scoprire la piattaforma che
              rivoluzionerà il mondo dei TCG in Italia.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-sm bg-opacity-90 transform hover:scale-[1.02] transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Sono un:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'PLAYER' })}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${formData.userType === 'PLAYER'
                        ? 'border-gray-900 bg-gray-900 shadow-xl'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                      }`}
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                      {formData.userType === 'PLAYER' ? '🎮' : '👤'}
                    </div>
                    <div className={`font-semibold transition-colors ${formData.userType === 'PLAYER' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Giocatore
                    </div>
                    <div className={`text-sm mt-1 transition-colors ${formData.userType === 'PLAYER' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Collezionista
                    </div>
                    {formData.userType === 'PLAYER' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'MERCHANT' })}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${formData.userType === 'MERCHANT'
                        ? 'border-gray-900 bg-gray-900 shadow-xl'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                      }`}
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                      {formData.userType === 'MERCHANT' ? '🏪' : '🏬'}
                    </div>
                    <div className={`font-semibold transition-colors ${formData.userType === 'MERCHANT' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Negoziante
                    </div>
                    <div className={`text-sm mt-1 transition-colors ${formData.userType === 'MERCHANT' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Proprietario
                    </div>
                    {formData.userType === 'MERCHANT' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
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
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white ${focusedField === 'email'
                        ? 'border-gray-900 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    placeholder="mario.rossi@email.com"
                  />
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'email' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                    <span className="text-2xl">📧</span>
                  </div>
                </div>
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-semibold text-gray-900">
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
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white ${focusedField === 'city'
                        ? 'border-gray-900 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    placeholder="Roma, Milano, Napoli..."
                  />
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'city' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                    <span className="text-2xl">📍</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-5 px-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <span>Unisciti alla lista d'attesa</span>
                      <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-xl animate-slide-up ${message.type === 'success'
                    ? 'bg-green-50 border-2 border-green-200 text-green-800'
                    : 'bg-red-50 border-2 border-red-200 text-red-800'
                  }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {message.type === 'success' ? '✅' : '❌'}
                    </span>
                    <p className="flex-1 font-medium">{message.text}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center space-y-4 animate-fade-in animation-delay-300">
            <p className="text-sm text-gray-500">
              Nessun impegno • Ti contatteremo appena saremo pronti
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                In sviluppo
              </span>
              <span>•</span>
              <span>Coming 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
