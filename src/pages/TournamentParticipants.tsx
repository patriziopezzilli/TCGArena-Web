import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import type { TournamentParticipant } from '../types/api'

export default function TournamentParticipants() {
  const navigate = useNavigate()
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<TournamentParticipant[]>([])
  const [tournament, setTournament] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [userIdentifier, setUserIdentifier] = useState('')
  const [addingParticipant, setAddingParticipant] = useState(false)
  const [addMode, setAddMode] = useState<'existing' | 'manual'>('existing')
  const [manualFirstName, setManualFirstName] = useState('')
  const [manualLastName, setManualLastName] = useState('')
  const [manualEmail, setManualEmail] = useState('')

  // Tournament start state
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [startingTournament, setStartingTournament] = useState(false)

  // Remove participant state
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(null)

  // Complete tournament state
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completingTournament, setCompletingTournament] = useState(false)
  const [placements, setPlacements] = useState<{ first: string | null, second: string | null, third: string | null }>({
    first: null,
    second: null,
    third: null
  })

  useEffect(() => {
    if (tournamentId) {
      loadTournamentAndParticipants()
    }
  }, [tournamentId])

  const loadTournamentAndParticipants = async () => {
    if (!tournamentId) {
      return
    }

    try {
      setLoading(true)

      // Load tournament details
      const tournaments = await merchantService.getTournaments()
      const currentTournament = tournaments.find((t: any) => String(t.id) === tournamentId)

      if (!currentTournament) {
        showToast('Torneo non trovato', 'error')
        return
      }

      setTournament(currentTournament)

      // Load participants with user details
      const participantsData = await merchantService.getTournamentParticipants(tournamentId)
      setParticipants(participantsData)
    } catch (error) {
      console.error('Error loading tournament participants:', error)
      showToast('Errore nel caricamento dei partecipanti', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentId) {
      return
    }

    try {
      setAddingParticipant(true)

      if (addMode === 'existing') {
        if (!userIdentifier.trim()) {
          return
        }
        await merchantService.addTournamentParticipant(tournamentId, userIdentifier.trim())
        showToast('Partecipante aggiunto con successo!', 'success')
      } else {
        if (!manualFirstName.trim() || !manualLastName.trim()) {
          return
        }
        await merchantService.registerManualParticipant(tournamentId, {
          firstName: manualFirstName.trim(),
          lastName: manualLastName.trim(),
          email: manualEmail.trim() || undefined
        })
        showToast('Partecipante manuale aggiunto con successo!', 'success')
      }

      setShowAddModal(false)
      setUserIdentifier('')
      setManualFirstName('')
      setManualLastName('')
      setManualEmail('')
      loadTournamentAndParticipants()
    } catch (error: any) {
      console.error('Error adding participant:', error)
      showToast(error.response?.data?.message || 'Errore nell\'aggiunta del partecipante', 'error')
    } finally {
      setAddingParticipant(false)
    }
  }

  const handleStartTournament = async () => {
    if (!tournamentId) return

    try {
      setStartingTournament(true)
      await merchantService.startTournament(tournamentId)
      showToast('Torneo avviato con successo! 🎉', 'success')
      setShowStartConfirm(false)
      loadTournamentAndParticipants()
    } catch (error: any) {
      console.error('Error starting tournament:', error)
      showToast(error.response?.data || 'Errore nell\'avvio del torneo', 'error')
    } finally {
      setStartingTournament(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!tournamentId) return
    if (!confirm('Sei sicuro di voler rimuovere questo partecipante? Riceverà una notifica.')) return

    try {
      setRemovingParticipant(participantId)
      await merchantService.removeParticipant(tournamentId, participantId)
      showToast('Partecipante rimosso con successo', 'success')
      loadTournamentAndParticipants()
    } catch (error: any) {
      console.error('Error removing participant:', error)
      showToast(error.response?.data || 'Errore nella rimozione del partecipante', 'error')
    } finally {
      setRemovingParticipant(null)
    }
  }

  const handleCompleteTournament = async () => {
    if (!tournamentId) return

    // Build placements array
    const placementsList: { participantId: number, placement: number }[] = []
    if (placements.first) placementsList.push({ participantId: Number(placements.first), placement: 1 })
    if (placements.second) placementsList.push({ participantId: Number(placements.second), placement: 2 })
    if (placements.third) placementsList.push({ participantId: Number(placements.third), placement: 3 })

    if (placementsList.length === 0) {
      showToast('Seleziona almeno il vincitore (1° posto)', 'error')
      return
    }

    try {
      setCompletingTournament(true)
      await merchantService.completeTournament(tournamentId, placementsList)
      showToast('Torneo completato con successo! 🏆', 'success')
      setShowCompleteModal(false)
      setPlacements({ first: null, second: null, third: null })
      loadTournamentAndParticipants()
    } catch (error: any) {
      console.error('Error completing tournament:', error)
      showToast(error.response?.data || 'Errore nel completamento del torneo', 'error')
    } finally {
      setCompletingTournament(false)
    }
  }

  const getPlacementBadge = (placement: number | null | undefined) => {
    if (!placement) return null
    const badges: Record<number, { emoji: string, color: string }> = {
      1: { emoji: '🥇', color: 'bg-yellow-100 text-yellow-800' },
      2: { emoji: '🥈', color: 'bg-gray-100 text-gray-800' },
      3: { emoji: '🥉', color: 'bg-orange-100 text-orange-800' },
    }
    const badge = badges[placement]
    if (!badge) return null
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.emoji} {placement === 1 ? '1°' : placement === 2 ? '2°' : '3°'}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      REGISTERED: 'bg-green-100 text-green-800',
      WAITING_LIST: 'bg-yellow-100 text-yellow-800',
      CHECKED_IN: 'bg-blue-100 text-blue-800',
    }
    const labels: Record<string, string> = {
      REGISTERED: 'Iscritto',
      WAITING_LIST: 'Lista d\'Attesa',
      CHECKED_IN: 'Check-in Effettuato',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getTournamentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      REGISTRATION_OPEN: 'bg-green-100 text-green-800',
      REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 animate-pulse',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      UPCOMING: 'In Arrivo',
      REGISTRATION_OPEN: 'Iscrizioni Aperte',
      REGISTRATION_CLOSED: 'Iscrizioni Chiuse',
      IN_PROGRESS: '🔴 In Corso',
      COMPLETED: 'Completato',
      CANCELLED: 'Cancellato',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Check if tournament is locked (no more changes allowed)
  const isTournamentLocked = tournament?.status === 'IN_PROGRESS' || tournament?.status === 'COMPLETED' || tournament?.status === 'CANCELLED'

  const getStats = () => {
    const registered = participants.filter(p => p.status === 'REGISTERED').length
    const waitingList = participants.filter(p => p.status === 'WAITING_LIST').length
    const checkedIn = participants.filter(p => p.status === 'CHECKED_IN').length
    return { registered, waitingList, checkedIn, total: participants.length }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate('/merchant/tournaments')}
                  className="text-sm text-gray-600 hover:text-gray-900 mb-2"
                >
                  ← Torna ai Tornei
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Torneo Non Trovato</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Il torneo richiesto non è stato trovato.</p>
            <button
              onClick={() => navigate('/merchant/tournaments')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Torna ai Tornei
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/merchant/tournaments')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Torna ai Tornei
              </button>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Partecipanti: {tournament?.title || 'Torneo'}
                </h1>
                {tournament && getTournamentStatusBadge(tournament.status)}
              </div>
              {tournament && (
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(tournament.startDate).toLocaleDateString('it-IT')} - {tournament.location.venueName}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {/* Complete Tournament Button - only show if tournament is IN_PROGRESS */}
              {tournament && tournament.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  🏆 Concludi Torneo
                </button>
              )}
              {/* Start Tournament Button - only show if tournament can be started */}
              {tournament && !isTournamentLocked && tournament.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => setShowStartConfirm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  🚀 Avvia Torneo
                </button>
              )}
              {!isTournamentLocked && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  ➕ Aggiungi Partecipante
                </button>
              )}
              <button
                onClick={loadTournamentAndParticipants}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">Iscritti</p>
            <p className="text-3xl font-bold text-green-900">{stats.registered}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-yellow-600 font-medium mb-1">Lista d'Attesa</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.waitingList}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-medium mb-1">Check-in Effettuati</p>
            <p className="text-3xl font-bold text-blue-900">{stats.checkedIn}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 font-medium mb-1">Totale</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Participants List */}
        {participants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nessun partecipante iscritto</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista Partecipanti</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Iscritto il
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Codice Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {participant.displayName || participant.username}
                            </div>
                            {participant.displayName && (
                              <div className="text-xs text-gray-400">
                                @{participant.username}
                              </div>
                            )}
                          </div>
                          {getPlacementBadge((participant as any).placement)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(participant.registrationDate).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.checkedInAt ? (
                          <div>
                            <div className="text-green-600 font-medium">✓ Effettuato</div>
                            <div className="text-xs text-gray-500">
                              {new Date(participant.checkedInAt).toLocaleString('it-IT')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {participant.checkInCode}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isTournamentLocked && (
                          <button
                            onClick={() => handleRemoveParticipant(String(participant.id))}
                            disabled={removingParticipant === String(participant.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {removingParticipant === String(participant.id) ? 'Rimozione...' : '🗑️ Rimuovi'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Aggiungi Partecipante
            </h2>

            {/* Mode Selection */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAddMode('existing')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${addMode === 'existing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Utente Esistente
              </button>
              <button
                type="button"
                onClick={() => setAddMode('manual')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${addMode === 'manual'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Partecipante Manuale
              </button>
            </div>

            <form onSubmit={handleAddParticipant}>
              {addMode === 'existing' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email o Username dell'utente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es: user@example.com o username"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userIdentifier}
                    onChange={(e) => setUserIdentifier(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Inserisci l'email o il nome utente di un giocatore registrato
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome del partecipante"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={manualFirstName}
                      onChange={(e) => setManualFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cognome del partecipante"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={manualLastName}
                      onChange={(e) => setManualLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (opzionale)
                    </label>
                    <input
                      type="email"
                      placeholder="email@esempio.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Verrà creato un account ospite temporaneo per questo partecipante
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setUserIdentifier('')
                    setManualFirstName('')
                    setManualLastName('')
                    setManualEmail('')
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={addingParticipant}
                  className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${addMode === 'existing' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {addingParticipant ? 'Aggiungendo...' : 'Aggiungi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Tournament Confirmation Modal */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Avvia Torneo
              </h2>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler avviare il torneo <strong>{tournament?.title}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Attenzione:</strong> Una volta avviato il torneo:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  <li>Non saranno più possibili nuove iscrizioni</li>
                  <li>I partecipanti non potranno più fare check-in</li>
                  <li>I partecipanti non potranno più cancellarsi</li>
                  <li>Verrà inviata una notifica a tutti i partecipanti</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowStartConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleStartTournament}
                  disabled={startingTournament}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {startingTournament ? 'Avvio in corso...' : '🚀 Avvia Torneo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Tournament Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Concludi Torneo
              </h2>
              <p className="text-gray-600 mb-6">
                Seleziona i vincitori del torneo <strong>{tournament?.title}</strong>
              </p>

              <div className="space-y-4 text-left mb-6">
                {/* 1st Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🥇 1° Posto (+100 punti) *
                  </label>
                  <select
                    value={placements.first || ''}
                    onChange={(e) => setPlacements(prev => ({ ...prev, first: e.target.value || null }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Seleziona vincitore...</option>
                    {participants.filter(p => p.status === 'CHECKED_IN' || p.status === 'REGISTERED').map(p => (
                      <option key={p.id} value={p.id} disabled={p.id.toString() === placements.second || p.id.toString() === placements.third}>
                        {p.displayName || p.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2nd Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🥈 2° Posto (+50 punti)
                  </label>
                  <select
                    value={placements.second || ''}
                    onChange={(e) => setPlacements(prev => ({ ...prev, second: e.target.value || null }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Seleziona (opzionale)...</option>
                    {participants.filter(p => p.status === 'CHECKED_IN' || p.status === 'REGISTERED').map(p => (
                      <option key={p.id} value={p.id} disabled={p.id.toString() === placements.first || p.id.toString() === placements.third}>
                        {p.displayName || p.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3rd Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🥉 3° Posto (+25 punti)
                  </label>
                  <select
                    value={placements.third || ''}
                    onChange={(e) => setPlacements(prev => ({ ...prev, third: e.target.value || null }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Seleziona (opzionale)...</option>
                    {participants.filter(p => p.status === 'CHECKED_IN' || p.status === 'REGISTERED').map(p => (
                      <option key={p.id} value={p.id} disabled={p.id.toString() === placements.first || p.id.toString() === placements.second}>
                        {p.displayName || p.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> I punti saranno assegnati automaticamente ai vincitori e influenzeranno la leaderboard.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setPlacements({ first: null, second: null, third: null })
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCompleteTournament}
                  disabled={completingTournament || !placements.first}
                  className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {completingTournament ? 'Salvataggio...' : '🏆 Completa Torneo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}