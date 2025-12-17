import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import type { Tournament } from '../types/api'

export default function TournamentRequests() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Tournament | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await merchantService.getPendingTournamentRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading tournament requests:', error)
      showToast('Errore nel caricamento delle richieste', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (tournament: Tournament) => {
    if (!confirm(`Vuoi approvare la richiesta di torneo "${tournament.title}"?\n\nIl torneo diventerà visibile pubblicamente.`)) {
      return
    }

    setProcessing(true)
    try {
      await merchantService.approveTournament(parseInt(tournament.id))
      showToast('Torneo approvato con successo!', 'success')
      await loadRequests()
    } catch (error: any) {
      console.error('Error approving tournament:', error)
      showToast(error.response?.data?.error || 'Errore nell\'approvazione', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectClick = (tournament: Tournament) => {
    setSelectedRequest(tournament)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showToast('Inserisci un motivo per il rifiuto', 'warning')
      return
    }

    setProcessing(true)
    try {
      await merchantService.rejectTournament(parseInt(selectedRequest.id), rejectionReason)
      showToast('Richiesta rifiutata', 'success')
      setShowRejectModal(false)
      await loadRequests()
    } catch (error: any) {
      console.error('Error rejecting tournament:', error)
      showToast(error.response?.data?.error || 'Errore nel rifiuto', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/merchant/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Torna alla Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Richieste Tornei</h1>
        <p className="mt-2 text-gray-600">
          Gestisci le richieste di torneo ricevute dai giocatori
        </p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessuna Richiesta Pending
          </h3>
          <p className="text-gray-500">
            Quando i giocatori richiederanno tornei, appariranno qui per l'approvazione
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      In Attesa
                    </span>
                  </div>
                  {request.description && (
                    <p className="text-gray-600 mb-3">{request.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Richiesto da utente #{request.createdByUserId}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">TCG Type</div>
                  <div className="font-semibold text-gray-900">{request.tcgType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Data</div>
                  <div className="font-semibold text-gray-900">{formatDate(request.startDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Partecipanti</div>
                  <div className="font-semibold text-gray-900">{request.maxParticipants} giocatori</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Quota</div>
                  <div className="font-semibold text-gray-900">
                    {request.entryFee > 0 ? `€${request.entryFee}` : 'Gratuito'}
                  </div>
                </div>
              </div>

              {request.prizePool && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 font-medium mb-1">Montepremi</div>
                  <div className="text-sm text-blue-900">{request.prizePool}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(request)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approva Torneo
                </button>
                <button
                  onClick={() => handleRejectClick(request)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rifiuta Richiesta</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Stai rifiutando:</p>
              <p className="font-semibold text-gray-900">{selectedRequest.title}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rifiuto *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                rows={4}
                placeholder="Spiega perché questa richiesta non può essere accettata..."
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Il motivo sarà visibile all'utente che ha fatto la richiesta
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Rifiuto...' : 'Conferma Rifiuto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
