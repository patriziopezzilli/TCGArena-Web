import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('merchant_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types
interface ShopReward {
  id: number
  name: string
  description: string
  costPoints: number
  type: 'DISCOUNT' | 'BOOSTER_PACK' | 'ETB' | 'PRODUCT' | 'EVENT_ENTRY' | 'STORE_CREDIT'
  discountValue?: number
  isPercentage?: boolean
  productName?: string
  stockQuantity?: number
  claimedCount: number
  isActive: boolean
  createdAt: string
  expiresAt?: string
}

interface ShopRewardRedemption {
  id: number
  shopReward: ShopReward
  user: {
    id: number
    displayName: string
    email: string
  }
  pointsSpent: number
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED'
  redemptionCode: string
  trackingCode?: string
  voucherCode?: string
  merchantNotes?: string
  redeemedAt: string
  fulfilledAt?: string
}

// Points criteria data (same as iOS app)
const pointsCriteria = {
  tournaments: [
    { title: 'Vittoria 1° Posto', points: '+100', type: 'bonus' },
    { title: '2° Posto', points: '+50', type: 'bonus' },
    { title: '3° Posto', points: '+25', type: 'bonus' },
    { title: 'Check-in', points: '+25', type: 'bonus' },
    { title: 'Registrazione', points: '+15', type: 'bonus' },
    { title: 'Ritiro Iscrizione', points: '-10', type: 'malus' },
  ],
  collection: [
    { title: 'Crea Primo Deck', points: '+50', type: 'bonus' },
    { title: 'Nuovi Deck', points: '+10', type: 'bonus' },
  ],
  shops: [
    { title: 'Prenotazione Prodotto', points: '+10', type: 'bonus' },
  ],
  trades: [
    { title: 'Scambio Concluso', points: '+50', type: 'bonus' },
  ],
}

const rewardTypes = [
  { value: 'DISCOUNT', label: 'Sconto', icon: '💰' },
  { value: 'BOOSTER_PACK', label: 'Bustina', icon: '🎴' },
  { value: 'ETB', label: 'Elite Trainer Box', icon: '📦' },
  { value: 'PRODUCT', label: 'Prodotto', icon: '🎁' },
  { value: 'EVENT_ENTRY', label: 'Ingresso Evento', icon: '🎟️' },
  { value: 'STORE_CREDIT', label: 'Credito Negozio', icon: '💳' },
]

interface MerchantRewardsProps {
  embedded?: boolean
}

export default function MerchantRewards({ embedded = false }: MerchantRewardsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rewards, setRewards] = useState<ShopReward[]>([])
  const [redemptions, setRedemptions] = useState<ShopRewardRedemption[]>([])
  const [activeTab, setActiveTab] = useState<'rewards' | 'redemptions' | 'criteria'>('rewards')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFulfillModal, setShowFulfillModal] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState<ShopRewardRedemption | null>(null)
  const [editingReward, setEditingReward] = useState<ShopReward | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPoints: 100,
    type: 'DISCOUNT' as ShopReward['type'],
    discountValue: 10,
    isPercentage: true,
    productName: '',
    stockQuantity: null as number | null,
    expiresAt: '',
  })

  // Fulfill form state
  const [fulfillData, setFulfillData] = useState({
    voucherCode: '',
    trackingCode: '',
    notes: '',
  })

  useEffect(() => {
    if (!embedded) {
      const token = localStorage.getItem('merchant_token')
      if (!token) {
        navigate('/merchant/login')
        return
      }
    }
    loadData()
  }, [navigate, embedded])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadRewards(), loadRedemptions()])
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRewards = async () => {
    try {
      const response = await apiClient.get('/merchant/rewards')
      setRewards(response.data)
    } catch (err) {
      console.error('Error loading rewards:', err)
    }
  }

  const loadRedemptions = async () => {
    try {
      const response = await apiClient.get('/merchant/redemptions')
      setRedemptions(response.data)
    } catch (err) {
      console.error('Error loading redemptions:', err)
    }
  }

  const handleCreateReward = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        costPoints: formData.costPoints,
        type: formData.type,
        discountValue: formData.type === 'DISCOUNT' || formData.type === 'STORE_CREDIT' ? formData.discountValue : null,
        isPercentage: formData.type === 'DISCOUNT' ? formData.isPercentage : null,
        productName: ['BOOSTER_PACK', 'ETB', 'PRODUCT'].includes(formData.type) ? formData.productName : null,
        stockQuantity: formData.stockQuantity,
        expiresAt: formData.expiresAt ? `${formData.expiresAt}T23:59:59` : null,
      }

      if (editingReward) {
        await apiClient.put(`/merchant/rewards/${editingReward.id}`, payload)
      } else {
        await apiClient.post('/merchant/rewards', payload)
      }

      showToast(editingReward ? 'Premio aggiornato!' : 'Premio creato! Il tuo negozio è ora Partner.', 'success')
      setShowCreateModal(false)
      resetForm()
      loadRewards()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Errore di connessione', 'error')
    }
  }

  const handleToggleActive = async (reward: ShopReward) => {
    try {
      await apiClient.patch(`/merchant/rewards/${reward.id}/toggle`, { active: !reward.isActive })
      showToast(reward.isActive ? 'Premio disattivato' : 'Premio attivato', 'success')
      loadRewards()
    } catch (err) {
      showToast('Errore', 'error')
    }
  }

  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo premio?')) return

    try {
      await apiClient.delete(`/merchant/rewards/${rewardId}`)
      showToast('Premio eliminato', 'success')
      loadRewards()
    } catch (err) {
      showToast('Errore', 'error')
    }
  }

  const handleFulfillRedemption = async () => {
    if (!selectedRedemption) return

    try {
      await apiClient.post(`/merchant/redemptions/${selectedRedemption.id}/fulfill`, fulfillData)
      showToast('Riscatto completato!', 'success')
      setShowFulfillModal(false)
      setSelectedRedemption(null)
      setFulfillData({ voucherCode: '', trackingCode: '', notes: '' })
      loadRedemptions()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Errore di connessione', 'error')
    }
  }

  const handleCancelRedemption = async (redemptionId: number) => {
    if (!confirm('Sei sicuro? I punti verranno rimborsati all\'utente.')) return

    try {
      await apiClient.post(`/merchant/redemptions/${redemptionId}/cancel`)
      showToast('Riscatto annullato e punti rimborsati', 'success')
      loadRedemptions()
    } catch (err) {
      showToast('Errore', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      costPoints: 100,
      type: 'DISCOUNT',
      discountValue: 10,
      isPercentage: true,
      productName: '',
      stockQuantity: null,
      expiresAt: '',
    })
    setEditingReward(null)
  }

  const openEditModal = (reward: ShopReward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name,
      description: reward.description || '',
      costPoints: reward.costPoints,
      type: reward.type,
      discountValue: reward.discountValue || 10,
      isPercentage: reward.isPercentage ?? true,
      productName: reward.productName || '',
      stockQuantity: reward.stockQuantity || null,
      expiresAt: reward.expiresAt?.split('T')[0] || '',
    })
    setShowCreateModal(true)
  }

  const pendingCount = redemptions.filter(r => r.status === 'PENDING').length

  const content = (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'rewards'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎁 Premi ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
            activeTab === 'redemptions'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📋 Riscatti
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'criteria'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Criteri Punti
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
        </div>
      ) : (
        <>
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              {/* Create Button */}
              <button
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="font-medium">Aggiungi Premio</span>
              </button>

              {/* Info Banner for first-time */}
              {rewards.length === 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex gap-4">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">Diventa Partner TCG Arena</h3>
                      <p className="text-amber-700 text-sm">
                        Crea il tuo primo premio e il tuo negozio diventerà automaticamente un Partner ufficiale!
                        Gli utenti potranno usare i loro punti fedeltà per riscattare premi nel tuo negozio.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards List */}
              {rewards.map(reward => (
                <div
                  key={reward.id}
                  className={`bg-white border rounded-xl p-4 ${!reward.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {rewardTypes.find(t => t.value === reward.type)?.icon || '🎁'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                        <p className="text-sm text-gray-500">{reward.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {reward.costPoints} punti
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {rewardTypes.find(t => t.value === reward.type)?.label}
                          </span>
                          {reward.stockQuantity && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                              {reward.stockQuantity - reward.claimedCount} / {reward.stockQuantity} disponibili
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(reward)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                        title="Modifica"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(reward)}
                        className={`p-2 transition-colors ${reward.isActive ? 'text-green-500' : 'text-gray-400'}`}
                        title={reward.isActive ? 'Disattiva' : 'Attiva'}
                      >
                        {reward.isActive ? '✅' : '⭕'}
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Elimina"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'redemptions' && (
            <div className="space-y-4">
              {redemptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl block mb-4">📭</span>
                  <p>Nessun riscatto ancora</p>
                </div>
              ) : (
                redemptions.map(redemption => (
                  <div
                    key={redemption.id}
                    className={`bg-white border rounded-xl p-4 ${
                      redemption.status === 'PENDING' ? 'border-amber-300 bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {redemption.shopReward.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            redemption.status === 'PENDING' ? 'bg-amber-200 text-amber-800' :
                            redemption.status === 'FULFILLED' ? 'bg-green-200 text-green-800' :
                            redemption.status === 'CANCELLED' ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {redemption.status === 'PENDING' ? '⏳ In Attesa' :
                             redemption.status === 'FULFILLED' ? '✅ Completato' :
                             redemption.status === 'CANCELLED' ? '❌ Annullato' : redemption.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Utente: <span className="font-medium">{redemption.user.displayName}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Codice: <code className="bg-gray-100 px-2 py-0.5 rounded">{redemption.redemptionCode}</code>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(redemption.redeemedAt).toLocaleString('it-IT')}
                        </p>
                        {redemption.voucherCode && (
                          <p className="text-sm text-green-600 mt-1">
                            Voucher: {redemption.voucherCode}
                          </p>
                        )}
                      </div>
                      {redemption.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRedemption(redemption)
                              setShowFulfillModal(true)
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            ✓ Completa
                          </button>
                          <button
                            onClick={() => handleCancelRedemption(redemption.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            ✕ Annulla
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Criteri di Assegnazione Punti</h3>
                <p className="text-blue-700 text-sm">
                  Ecco come gli utenti guadagnano punti nell'app TCG Arena. 
                  Queste informazioni ti aiutano a calibrare il costo dei tuoi premi.
                </p>
              </div>

              {/* Tournaments */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <span>🏆</span>
                  <h4 className="font-semibold">Tornei</h4>
                </div>
                <div className="divide-y">
                  {pointsCriteria.tournaments.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center">
                      <span className="text-gray-700">{item.title}</span>
                      <span className={`font-mono font-semibold px-2 py-1 rounded ${
                        item.type === 'bonus' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <span>📚</span>
                  <h4 className="font-semibold">Collezione</h4>
                </div>
                <div className="divide-y">
                  {pointsCriteria.collection.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center">
                      <span className="text-gray-700">{item.title}</span>
                      <span className="font-mono font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shops */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <span>🏪</span>
                  <h4 className="font-semibold">Negozi</h4>
                </div>
                <div className="divide-y">
                  {pointsCriteria.shops.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center">
                      <span className="text-gray-700">{item.title}</span>
                      <span className="font-mono font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trades */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <span>🔄</span>
                  <h4 className="font-semibold">Scambi</h4>
                </div>
                <div className="divide-y">
                  {pointsCriteria.trades.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center">
                      <span className="text-gray-700">{item.title}</span>
                      <span className="font-mono font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingReward ? 'Modifica Premio' : 'Nuovo Premio'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="es. Sconto 10% sul prossimo acquisto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="Descrivi il premio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Premio *</label>
                <div className="grid grid-cols-3 gap-2">
                  {rewardTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value as ShopReward['type'] })}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        formData.type === type.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo in Punti *</label>
                <input
                  type="number"
                  value={formData.costPoints}
                  onChange={e => setFormData({ ...formData, costPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  min={1}
                />
              </div>

              {(formData.type === 'DISCOUNT' || formData.type === 'STORE_CREDIT') && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valore</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  {formData.type === 'DISCOUNT' && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={formData.isPercentage ? 'percent' : 'fixed'}
                        onChange={e => setFormData({ ...formData, isPercentage: e.target.value === 'percent' })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="percent">Percentuale %</option>
                        <option value="fixed">Fisso €</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {['BOOSTER_PACK', 'ETB', 'PRODUCT'].includes(formData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Prodotto</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="es. Booster Pack Scarlet & Violet"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantità Disponibile
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={e => setFormData({ ...formData, stockQuantity: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Illimitata"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateReward}
                disabled={!formData.name || !formData.costPoints}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {editingReward ? 'Salva Modifiche' : 'Crea Premio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill Modal */}
      {showFulfillModal && selectedRedemption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Completa Riscatto</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{selectedRedemption.shopReward.name}</p>
                <p className="text-sm text-gray-600">Utente: {selectedRedemption.user.displayName}</p>
                <p className="text-sm text-gray-500">Codice: {selectedRedemption.redemptionCode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codice Voucher (opzionale)
                </label>
                <input
                  type="text"
                  value={fulfillData.voucherCode}
                  onChange={e => setFulfillData({ ...fulfillData, voucherCode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="es. DISCOUNT-ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Code (opzionale)
                </label>
                <input
                  type="text"
                  value={fulfillData.trackingCode}
                  onChange={e => setFulfillData({ ...fulfillData, trackingCode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Per spedizioni"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (opzionale)
                </label>
                <textarea
                  value={fulfillData.notes}
                  onChange={e => setFulfillData({ ...fulfillData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Note interne..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFulfillModal(false)
                  setSelectedRedemption(null)
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleFulfillRedemption}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✓ Conferma Completamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/merchant/dashboard')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Torna alla Dashboard
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🎁 Premi Partner</h1>
        {content}
      </div>
    </div>
  )
}
