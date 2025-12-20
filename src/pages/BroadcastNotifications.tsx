
import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import { useToast } from '../contexts/ToastContext'
import {
  MegaphoneIcon, UsersIcon, PencilIcon, RocketLaunchIcon,
  ExclamationTriangleIcon, InformationCircleIcon, ChatIcon, NewspaperIcon
} from '../components/Icons'

type NewsType = 'ANNOUNCEMENT' | 'NEW_STOCK' | 'TOURNAMENT' | 'SALE' | 'EVENT' | 'GENERAL'

export default function BroadcastNotifications() {
  const { showToast } = useToast()
  const [mode, setMode] = useState<'push' | 'news'>('news') // Default to news mode
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [newsType, setNewsType] = useState<NewsType>('ANNOUNCEMENT')
  const [startDate, setStartDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [sendPush, setSendPush] = useState(false)
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

    if (mode === 'news') {
      // Send as broadcast news (saved in DB)
      const confirmMessage = `Stai per creare una notizia broadcast${sendPush ? ` e inviarla a ${recipientsCount} utenti` : ''}. Continuare?`
      if (!confirm(confirmMessage)) return

      setSending(true)
      try {
        const newsData = {
          title: title.trim(),
          content: message.trim(),
          newsType,
          startDate: startDate || null,
          expiryDate: expiryDate || null,
          imageUrl: null,
          isPinned
        }

        const response = await apiClient.post(
          `/admin/broadcast-news?sendPushNotification=${sendPush}`,
          newsData
        )

        if (sendPush && response.data.usersNotified) {
          showToast(`✅ News creata e push inviata a ${response.data.usersNotified} utenti!`, 'success')
        } else {
          showToast('✅ News broadcast creata con successo!', 'success')
        }
        
        setTitle('')
        setMessage('')
        setStartDate('')
        setExpiryDate('')
        setIsPinned(false)
        setSendPush(false)
      } catch (err: any) {
        console.error('Failed to create broadcast news:', err)
        showToast('Errore nella creazione della news: ' + (err.response?.data?.message || err.message), 'error')
      } finally {
        setSending(false)
      }
    } else {
      // Send as push notification only (not saved in DB)
      if (recipientsCount === 0) {
        showToast('Nessun destinatario disponibile', 'error')
        return
      }

      const confirmMessage = `Stai per inviare una notifica a ${recipientsCount} utenti. Continuare?`
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
              <div className="text-sm font-medium text-gray-500">Broadcast System</div>
              <div className="text-2xl font-bold text-gray-900">News & Notifiche</div>
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

      {/* Mode Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm inline-flex gap-2">
        <button
          onClick={() => setMode('news')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            mode === 'news'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <NewspaperIcon className="w-5 h-5" />
          News Broadcast
        </button>
        <button
          onClick={() => setMode('push')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            mode === 'push'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <RocketLaunchIcon className="w-5 h-5" />
          Solo Push
        </button>
      </div>

      {/* Compose Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-gray-700" />
            {mode === 'news' ? 'Crea News Broadcast' : 'Invia Notifica Push'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'news'
              ? 'La news verrà salvata e mostrata nella home di tutti gli utenti'
              : 'La notifica verrà inviata solo come push, senza salvare'}
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
              placeholder="Scrivi il messaggio..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</div>
          </div>

          {/* News-specific fields */}
          {mode === 'news' && (
            <>
              {/* News Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di News
                </label>
                <select
                  value={newsType}
                  onChange={(e) => setNewsType(e.target.value as NewsType)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="ANNOUNCEMENT">Annuncio</option>
                  <option value="NEW_STOCK">Nuovo Stock</option>
                  <option value="TOURNAMENT">Torneo</option>
                  <option value="SALE">Saldi</option>
                  <option value="EVENT">Evento</option>
                  <option value="GENERAL">Generale</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inizio
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="text-xs text-gray-400 mt-1">Lascia vuoto per iniziare ora</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Scadenza
                  </label>
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="text-xs text-gray-400 mt-1">Opzionale</div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    📌 Fissa in alto (apparirà per prima)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🔔 Invia anche notifica push a {recipientsCount ?? 0} utenti
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">Attenzione</div>
                <div className="text-sm text-amber-700 mt-1">
                  {mode === 'news' ? (
                    <>
                      Questa news verrà mostrata a <strong>tutti</strong> gli utenti nella home dell'app.
                      {sendPush && ' Verrà anche inviata una notifica push.'}
                    </>
                  ) : (
                    <>
                      Questa notifica push verrà inviata a <strong>tutti</strong> gli utenti con l'app installata.
                      Non verrà salvata come news persistente.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {mode === 'news' ? 'Creazione...' : 'Invio...'}
                </>
              ) : (
                <>
                  {mode === 'news' ? <NewspaperIcon className="w-5 h-5" /> : <RocketLaunchIcon className="w-5 h-5" />}
                  {mode === 'news' ? 'Crea News Broadcast' : `Invia Push a ${recipientsCount ?? 0} utenti`}
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
        {mode === 'news' ? (
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>La news broadcast viene salvata nel database e appare nel carousel della home</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Visibile a tutti gli utenti, inclusi quelli dei negozi sottoscritti</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Puoi programmare data di inizio e scadenza per automatizzare la visibilità</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Le news pinnate appaiono sempre per prime nel carousel</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Opzionalmente puoi inviare anche una notifica push per avvisare gli utenti</span>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>La notifica push viene inviata a tutti i dispositivi con l'app TCG Arena installata</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Non viene salvata come news persistente, è solo una notifica volatile</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Gli utenti con notifiche disabilitate sul dispositivo non riceveranno il push</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Usa con moderazione per non disturbare gli utenti</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}