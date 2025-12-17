import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { merchantMenuItems, getMerchantUserData } from '../constants/merchantMenu'
import type { Tournament } from '../types/api'
import { ClockIcon } from '../components/Icons'

interface TournamentRequestsProps {
  embedded?: boolean
}

export default function TournamentRequests({ embedded = false }: TournamentRequestsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Tournament | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const userData = getMerchantUserData()

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    if (!token) {
      showToast('Devi effettuare il login', 'error')
      navigate('/merchant/login', { replace: true })
      return
    }
    loadRequests()
  }, [navigate, showToast])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await merchantService.getPendingTournamentRequests()
      setRequests(data)
    } catch (error: any) {
      console.error('Error loading tournament requests:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast('Sessione scaduta. Effettua nuovamente il login', 'error')
        localStorage.removeItem('merchant_token')
        navigate('/merchant/login')
        return
      }
      showToast(error.response?.data?.error || 'Errore nel caricamento', 'error')
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

  const content = (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nessuna richiesta in attesa</p>
          <p className="text-gray-500 text-sm mt-1">Le richieste di torneo dei giocatori appariranno qui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" /> In Attesa
                    </span>
                  </div>
                  {request.description && (
                    <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    👤 Richiesto da utente #{request.createdByUserId}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-1">TCG</p>
                  <p className="font-medium text-gray-900">{request.tcgType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data</p>
                  <p className="font-medium text-gray-900">{formatDate(request.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Partecipanti</p>
                  <p className="font-medium text-gray-900">{request.maxParticipants} max</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quota</p>
                  <p className="font-medium text-gray-900">
                    {request.entryFee > 0 ? `€${request.entryFee}` : 'Gratuito'}
                  </p>
                </div>
              </div>

              {request.prizePool && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-medium mb-1">🏆 Montepremi</p>
                  <p className="text-sm text-indigo-900">{request.prizePool}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(request)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  ✓ Approva
                </button>
                <button
                  onClick={() => handleRejectClick(request)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  ✕ Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rifiuta Richiesta</h3>
            <p className="text-gray-600 mb-4">Stai rifiutando: <strong>{selectedRequest.title}</strong></p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rifiuto *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 resize-none"
                rows={4}
                placeholder="Spiega perché questa richiesta non può essere accettata..."
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Il motivo sarà visibile all'utente
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {processing ? 'Rifiuto...' : 'Conferma Rifiuto'}
              </button>
            </div>
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
      title="Richieste Tornei"
      subtitle={`${requests.length} richieste in attesa`}
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}
