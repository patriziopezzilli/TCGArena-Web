import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'

interface Tournament {
  id: string
  name: string
  tcgType: string
  format: string
  description: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: string
  startDate: string
  endDate: string
  registrationDeadline: string
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  location: string
  organizer: string
}

export default function MerchantTournaments() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    tcgType: 'POKEMON',
    format: 'STANDARD',
    description: '',
    maxParticipants: 32,
    entryFee: 0,
    prizePool: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: ''
  })

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      setLoading(true)
      const data = await merchantService.getTournaments()
      setTournaments(data || [])
    } catch (error) {
      console.error('Error loading tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTournament) {
        await merchantService.updateTournament(editingTournament.id, formData)
      } else {
        await merchantService.createTournament(formData)
      }
      setShowModal(false)
      setEditingTournament(null)
      resetForm()
      loadTournaments()
    } catch (error) {
      console.error('Error saving tournament:', error)
      alert('Errore durante il salvataggio del torneo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo torneo?')) return
    
    try {
      await merchantService.deleteTournament(id)
      loadTournaments()
    } catch (error) {
      console.error('Error deleting tournament:', error)
      alert('Errore durante l\'eliminazione del torneo')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      tcgType: 'POKEMON',
      format: 'STANDARD',
      description: '',
      maxParticipants: 32,
      entryFee: 0,
      prizePool: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: ''
    })
  }

  const openEditModal = (tournament: Tournament) => {
    setEditingTournament(tournament)
    setFormData({
      name: tournament.name,
      tcgType: tournament.tcgType,
      format: tournament.format,
      description: tournament.description,
      maxParticipants: tournament.maxParticipants,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0],
      registrationDeadline: tournament.registrationDeadline.split('T')[0],
      location: tournament.location
    })
    setShowModal(true)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      REGISTRATION_OPEN: 'bg-green-100 text-green-800',
      REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      UPCOMING: 'In Arrivo',
      REGISTRATION_OPEN: 'Iscrizioni Aperte',
      REGISTRATION_CLOSED: 'Iscrizioni Chiuse',
      IN_PROGRESS: 'In Corso',
      COMPLETED: 'Completato',
      CANCELLED: 'Cancellato',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStats = () => {
    const upcoming = tournaments.filter(t => t.status === 'UPCOMING' || t.status === 'REGISTRATION_OPEN').length
    const inProgress = tournaments.filter(t => t.status === 'IN_PROGRESS').length
    const completed = tournaments.filter(t => t.status === 'COMPLETED').length
    const totalParticipants = tournaments.reduce((sum, t) => sum + (t.currentParticipants || 0), 0)
    return { upcoming, inProgress, completed, totalParticipants }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/merchant/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Torna alla Dashboard
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Gestione Tornei</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Crea Torneo
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-medium mb-1">In Programma</p>
            <p className="text-3xl font-bold text-blue-900">{stats.upcoming}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-sm text-purple-600 font-medium mb-1">In Corso</p>
            <p className="text-3xl font-bold text-purple-900">{stats.inProgress}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 font-medium mb-1">Completati</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Partecipanti Totali</p>
            <p className="text-3xl font-bold text-green-900">{stats.totalParticipants}</p>
          </div>
        </div>

        {/* Tournaments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nessun torneo creato</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary hover:underline"
            >
              Crea il primo torneo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{tournament.name}</h3>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tournament.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">TCG</p>
                        <p className="text-gray-900 font-medium">{tournament.tcgType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Formato</p>
                        <p className="text-gray-900 font-medium">{tournament.format}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Partecipanti</p>
                        <p className="text-gray-900 font-medium">
                          {tournament.currentParticipants || 0}/{tournament.maxParticipants}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quota</p>
                        <p className="text-gray-900 font-medium">€{tournament.entryFee.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                      <p>📍 {tournament.location}</p>
                      <p className="mt-1">
                        📅 {new Date(tournament.startDate).toLocaleDateString('it-IT')} - {new Date(tournament.endDate).toLocaleDateString('it-IT')}
                      </p>
                      <p className="mt-1">
                        ⏰ Iscrizioni fino al {new Date(tournament.registrationDeadline).toLocaleDateString('it-IT')}
                      </p>
                      {tournament.prizePool && (
                        <p className="mt-1">🏆 Montepremi: {tournament.prizePool}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(tournament)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.id)}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingTournament ? 'Modifica Torneo' : 'Crea Nuovo Torneo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Torneo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TCG
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.tcgType}
                    onChange={(e) => setFormData({ ...formData, tcgType: e.target.value })}
                  >
                    <option value="POKEMON">Pokémon</option>
                    <option value="ONEPIECE">One Piece</option>
                    <option value="MAGIC">Magic</option>
                    <option value="YUGIOH">Yu-Gi-Oh!</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPANDED">Expanded</option>
                    <option value="UNLIMITED">Unlimited</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SEALED">Sealed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partecipanti Max
                  </label>
                  <input
                    type="number"
                    required
                    min="4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Iscrizione (€)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montepremi
                  </label>
                  <input
                    type="text"
                    placeholder="es: 1° premio: 3 buste, 2° premio: 2 buste"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scadenza Iscrizioni
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luogo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Indirizzo del torneo"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTournament(null)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingTournament ? 'Salva Modifiche' : 'Crea Torneo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
