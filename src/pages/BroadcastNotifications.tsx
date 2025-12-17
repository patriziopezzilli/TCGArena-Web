
import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import { useToast } from '../contexts/ToastContext'
import {
  MegaphoneIcon, UsersIcon, PencilIcon, RocketLaunchIcon,
  ExclamationTriangleIcon, InformationCircleIcon, ChatIcon
} from '../components/Icons'

export default function BroadcastNotifications() {
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [recipientsCount, setRecipientsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadRecipientsCount()
  }, [])

  const loadRecipientsCount = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/broadcast/recipients-count')
      setRecipientsCount(response.data.count)
    } catch (err: any) {
      console.error('Failed to load recipients count:', err)
      showToast('Errore nel caricamento dei destinatari', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!title.trim()) {
      showToast('Inserisci un titolo', 'error')
      return
    }
    if (!message.trim()) {
      showToast('Inserisci un messaggio', 'error')
      return
    }
    if (recipientsCount === 0) {
      showToast('Nessun destinatario disponibile', 'error')
      return
    }

    const confirmMessage = `Stai per inviare una notifica a ${recipientsCount} utenti.Continuare ? `
    if (!confirm(confirmMessage)) return

    setSending(true)
    try {
      const response = await apiClient.post('/admin/broadcast/send', {
        title: title.trim(),
        message: message.trim()
      })

      showToast(`✅ Notifica inviata a ${response.data.usersNotified} utenti!`, 'success')
      setTitle('')
      setMessage('')
    } catch (err: any) {
      console.error('Failed to send broadcast:', err)
      showToast('Errore nell\'invio della notifica: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center border border-gray-100">
              <MegaphoneIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Notifiche Broadcast</div>
              <div className="text-2xl font-bold text-gray-900">Invia a tutti gli utenti</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center border border-gray-100">
              <UsersIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Utenti Raggiungibili</div>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  recipientsCount ?? 0
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">Con device token registrato</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Notification */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-gray-700" /> Componi Notifica
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            La notifica verrà inviata a tutti gli utenti con l'app installata
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: Nuovo aggiornamento disponibile! 🎉"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Messaggio *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi il messaggio della notifica..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</div>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
                Anteprima Notifica
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChatIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {title || 'Titolo notifica'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message || 'Messaggio della notifica...'}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">TCG Arena • Adesso</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">Attenzione</div>
                <div className="text-sm text-amber-700 mt-1">
                  Questa notifica verrà inviata a <strong>tutti</strong> gli utenti con l'app installata.
                  Assicurati che il contenuto sia appropriato e rilevante.
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim() || recipientsCount === 0}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Invio in corso...
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-5 h-5" />
                  Invia Notifica a {recipientsCount ?? 0} utenti
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
          <InformationCircleIcon className="w-5 h-5" /> Come funziona
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>La notifica push viene inviata a tutti i dispositivi con l'app TCG Arena installata</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Viene anche creata una notifica in-app visibile nella sezione notifiche dell'utente</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Gli utenti con notifiche disabilitate sul dispositivo non riceveranno il push</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Usa questa funzione con moderazione per evitare di disturbare gli utenti</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
