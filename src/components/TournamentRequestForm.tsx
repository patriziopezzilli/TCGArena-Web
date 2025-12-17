import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface TournamentRequestFormProps {
  shopId: number
  shopName: string
  onSuccess?: () => void
}

export default function TournamentRequestForm({ shopId, shopName, onSuccess }: TournamentRequestFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tcgType: 'POKEMON',
    type: 'CASUAL',
    startDate: '',
    maxParticipants: 16,
    entryFee: 0,
    prizePool: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || formData.title.length < 3) {
      showToast('Il titolo deve essere di almeno 3 caratteri', 'error')
      return
    }

    if (!formData.startDate) {
      showToast('Seleziona una data per il torneo', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        ...formData,
        shopId,
        description: formData.description || undefined,
        prizePool: formData.prizePool || undefined,
      }

      await merchantService.requestTournament(requestData)
      showToast('Richiesta inviata con successo! Attendi l\'approvazione del negozio.', 'success')
      
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(-1)
      }
    } catch (error: any) {
      console.error('Error requesting tournament:', error)
      showToast(error.response?.data?.error || 'Errore nell\'invio della richiesta', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-100 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Richiedi un Torneo</h2>
              <p className="text-sm text-gray-600">
                Il negozio riceverà la tua richiesta e dovrà approvarla prima che il torneo sia visibile pubblicamente.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium text-gray-900">{shopName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informazioni Base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo Torneo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="es. Torneo Pokémon Domenicale"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  rows={3}
                  placeholder="Dettagli aggiuntivi sul torneo..."
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Impostazioni Gioco</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo TCG *
                </label>
                <select
                  value={formData.tcgType}
                  onChange={(e) => handleInputChange('tcgType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                >
                  <option value="POKEMON">Pokémon</option>
                  <option value="MAGIC">Magic: The Gathering</option>
                  <option value="YUGIOH">Yu-Gi-Oh!</option>
                  <option value="ONE_PIECE">One Piece</option>
                  <option value="DIGIMON">Digimon</option>
                  <option value="DRAGON_BALL">Dragon Ball</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Torneo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                >
                  <option value="CASUAL">Casual</option>
                  <option value="COMPETITIVE">Competitive</option>
                  <option value="CHAMPIONSHIP">Championship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule & Participants */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Data e Partecipanti</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Torneo *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero Massimo Partecipanti *
                </label>
                <select
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                >
                  <option value={8}>8 Giocatori</option>
                  <option value={16}>16 Giocatori</option>
                  <option value={32}>32 Giocatori</option>
                  <option value={64}>64 Giocatori</option>
                </select>
              </div>
            </div>
          </div>

          {/* Entry & Prizes */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quota e Premi</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quota d'Iscrizione (€)
                </label>
                <input
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => handleInputChange('entryFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montepremi <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <input
                  type="text"
                  value={formData.prizePool}
                  onChange={(e) => handleInputChange('prizePool', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="es. Booster box + promo"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.startDate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Invio in corso...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Invia Richiesta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
