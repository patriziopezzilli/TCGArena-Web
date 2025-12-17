import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { TournamentIcon } from '../components/Icons'

// Merchant menu items
const merchantMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/merchant/dashboard' },
  { id: 'inventory', label: 'Inventario', icon: '📦', path: '/merchant/inventory' },
  { id: 'reservations', label: 'Prenotazioni', icon: '🎫', path: '/merchant/reservations' },
  { id: 'tournaments', label: 'Tornei', icon: '🏆', path: '/merchant/tournaments' },
  { id: 'tournament-requests', label: 'Richieste Tornei', icon: '⏱️', path: '/merchant/tournament-requests' },
  { id: 'requests', label: 'Richieste Clienti', icon: '💬', path: '/merchant/requests' },
  { id: 'subscribers', label: 'Iscritti', icon: '🔔', path: '/merchant/subscribers' },
  { id: 'news', label: 'Notizie', icon: '📰', path: '/merchant/news' },
  { id: 'settings', label: 'Impostazioni', icon: '⚙️', path: '/merchant/settings' },
]

interface Tournament {
  id: string
  title: string
  tcgType: string
  type: 'CASUAL' | 'COMPETITIVE' | 'CHAMPIONSHIP'
  description: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  location: TournamentLocation
  organizerId: number
  isRanked?: boolean
  externalRegistrationUrl?: string
}

interface TournamentLocation {
  venueName: string
  address: string
  city: string
  country: string
}

interface MerchantTournamentsProps {
  embedded?: boolean
}

export default function MerchantTournaments({ embedded = false }: MerchantTournamentsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [shopData, setShopData] = useState<{ name: string; address: string; city: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    tcgType: 'POKEMON',
    type: 'CASUAL' as Tournament['type'],
    description: '',
    maxParticipants: 8,
    entryFee: 0,
    prizePool: '',
    startDate: '',
    endDate: '',
    status: 'REGISTRATION_OPEN' as Tournament['status'],
    location: {
      venueName: '',
      address: '',
      city: '',
      country: 'Italia'
    },
    isRanked: false,
    externalRegistrationUrl: ''
  })

  useEffect(() => {
    loadUserAndTournaments()
  }, [])

  const loadUserAndTournaments = async () => {
    try {
      setLoading(true)
      // Get current user profile first
      const userProfile = await merchantService.getProfile()
      setCurrentUserId(userProfile.id)

      // Load shop data for pre-filling location
      try {
        const shopStatus = await merchantService.getShopStatus()
        if (shopStatus.shop) {
          const shop = shopStatus.shop
          setShopData({
            name: shop.name || '',
            address: shop.address || '',
            city: shop.city || ''
          })
        }
      } catch (error) {
        console.error('Error loading shop data:', error)
      }

      // Then load tournaments
      await loadTournaments(userProfile.id)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTournaments = async (userId?: number) => {
    try {
      const data = await merchantService.getTournaments()
      // Filter tournaments by current user's organizerId
      const userIdToFilter = userId || currentUserId
      if (userIdToFilter) {
        const filteredTournaments = data.filter((t: Tournament) => t.organizerId === userIdToFilter)
        setTournaments(filteredTournaments || [])
      } else {
        setTournaments(data || [])
      }
    } catch (error) {
      console.error('Error loading tournaments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Send dates directly without UTC conversion to preserve local timezone
      const tournamentData = {
        ...formData,
        startDate: formData.startDate || '',
        endDate: formData.endDate || ''
      }

      if (editingTournament) {
        await merchantService.updateTournament(editingTournament.id, tournamentData)
        showToast('Torneo aggiornato con successo', 'success')
      } else {
        await merchantService.createTournament(tournamentData)
        showToast('Torneo creato con successo', 'success')
      }
      setShowModal(false)
      setEditingTournament(null)
      resetForm()
      loadTournaments()
    } catch (error) {
      console.error('Error saving tournament:', error)
      showToast('Errore durante il salvataggio del torneo', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo torneo?')) return

    try {
      await merchantService.deleteTournament(id)
      showToast('Torneo eliminato con successo', 'success')
      loadTournaments()
    } catch (error) {
      console.error('Error deleting tournament:', error)
      showToast('Errore durante l\'eliminazione del torneo', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      tcgType: 'POKEMON',
      type: 'CASUAL' as Tournament['type'],
      description: '',
      maxParticipants: 8,
      entryFee: 0,
      prizePool: '',
      startDate: '',
      endDate: '',
      status: 'REGISTRATION_OPEN' as Tournament['status'],
      location: {
        venueName: shopData?.name || '',
        address: shopData?.address || '',
        city: shopData?.city || '',
        country: 'Italia'
      },
      isRanked: false,
      externalRegistrationUrl: ''
    })
  }

  const openEditModal = (tournament: Tournament) => {
    setEditingTournament(tournament)
    const startDateTime = tournament.startDate.substring(0, 16)
    const endDateTime = tournament.endDate.substring(0, 16)
    setFormData({
      title: tournament.title,
      tcgType: tournament.tcgType,
      type: tournament.type,
      description: tournament.description,
      maxParticipants: tournament.maxParticipants,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      startDate: startDateTime,
      endDate: endDateTime,
      status: tournament.status,
      location: tournament.location,
      isRanked: tournament.isRanked || false,
      externalRegistrationUrl: tournament.externalRegistrationUrl || ''
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

  // Get user info for layout
  const merchantUser = localStorage.getItem('merchant_user')
  const userData = merchantUser ? JSON.parse(merchantUser) : null

  const content = (
    <>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 -mt-2">
        <div></div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>+</span> Crea Torneo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">In Programma</p>
          <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">In Corso</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Completati</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Partecipanti Totali</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</p>
        </div>
      </div>

      {/* Tournaments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TournamentIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nessun torneo creato</p>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="mt-4 px-5 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
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
                    <h3 className="text-xl font-semibold text-gray-900">{tournament.title}</h3>
                    {tournament.isRanked && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
                        🏆 Ufficiale
                      </span>
                    )}
                    {getStatusBadge(tournament.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tournament.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">TCG</p>
                      <p className="text-gray-900 font-medium">{tournament.tcgType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="text-gray-900 font-medium">{tournament.type}</p>
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
                    <p>📍 {tournament.location.venueName}, {tournament.location.city}</p>
                    <p className="mt-1">
                      📅 {new Date(tournament.startDate).toLocaleDateString('it-IT')} - {new Date(tournament.endDate).toLocaleDateString('it-IT')}
                    </p>
                    {tournament.prizePool && (
                      <p className="mt-1">🏆 {tournament.prizePool}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/merchant/tournaments/${tournament.id}/participants`)}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    Gestisci Partecipanti
                  </button>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingTournament ? 'Modifica Torneo' : 'Crea Nuovo Torneo'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Tournament Type Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo di Torneo
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${!formData.isRanked ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="tournamentCategory"
                      checked={!formData.isRanked}
                      onChange={() => setFormData({ ...formData, isRanked: false, externalRegistrationUrl: '' })}
                      className="sr-only"
                    />
                    <span className="text-lg">🏠</span>
                    <span className="font-medium">Torneo Locale</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.isRanked ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="tournamentCategory"
                      checked={formData.isRanked}
                      onChange={() => setFormData({ ...formData, isRanked: true })}
                      className="sr-only"
                    />
                    <span className="text-lg">🏆</span>
                    <span className="font-medium">Torneo Ufficiale</span>
                  </label>
                </div>
                {formData.isRanked && (
                  <p className="mt-2 text-sm text-gray-500">
                    I tornei ufficiali richiedono l'iscrizione tramite app esterna (es. Pokemon TCG Live)
                  </p>
                )}
              </div>

              {/* External URL for Ranked Tournaments */}
              {formData.isRanked && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Iscrizione Esterna *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.externalRegistrationUrl}
                    onChange={(e) => setFormData({ ...formData, externalRegistrationUrl: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Torneo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    Data e Ora Inizio
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                {/* Fields only for Local Tournaments */}
                {!formData.isRanked && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo Torneo
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Tournament['type'] })}
                      >
                        <option value="CASUAL">Casual</option>
                        <option value="COMPETITIVE">Competitivo</option>
                        <option value="CHAMPIONSHIP">Campionato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stato
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Tournament['status'] })}
                      >
                        <option value="UPCOMING">In Arrivo</option>
                        <option value="REGISTRATION_OPEN">Iscrizioni Aperte</option>
                        <option value="REGISTRATION_CLOSED">Iscrizioni Chiuse</option>
                        <option value="IN_PROGRESS">In Corso</option>
                        <option value="COMPLETED">Completato</option>
                        <option value="CANCELLED">Cancellato</option>
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
                        min="2"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montepremi
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="es: Booster Box, 50€ in buoni, etc."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data e Ora Fine
                      </label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Location fields - always visible but pre-filled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Luogo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es: Negozio TCG Arena"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.location.venueName}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, venueName: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Via, numero civico"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.location.address}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Città
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es: Milano"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
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
    </>
  )

  if (embedded) {
    return content
  }

  return (
    <DashboardLayout
      title="Gestione Tornei"
      subtitle={`${tournaments.length} tornei totali`}
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}
