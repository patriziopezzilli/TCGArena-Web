import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface Partner {
  id: number
  name: string
}

interface Reward {
  id: number
  name: string
  description: string
  costPoints: number
  imageUrl: string
  isActive: boolean
  createdAt: string
  partner?: Partner
  type: 'PHYSICAL' | 'DIGITAL'
}

export default function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPoints: 0,
    imageUrl: '',
    isActive: true,
    partner: null as Partner | null,
    type: 'PHYSICAL' as 'PHYSICAL' | 'DIGITAL',
  })

  const { showToast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [rewardsData, partnersData] = await Promise.all([
        adminService.getAllRewards(),
        adminService.getAllPartners()
      ])
      setRewards(rewardsData)
      setPartners(partnersData)
    } catch (err) {
      showToast('Errore nel caricamento dei dati', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadRewards = async () => {
    try {
      const data = await adminService.getAllRewards()
      setRewards(data)
    } catch (err) {
      showToast('Errore nel caricamento dei rewards', 'error')
    }
  }

  const handleCreate = () => {
    setEditingReward(null)
    setFormData({
      name: '',
      description: '',
      costPoints: 0,
      imageUrl: '',
      isActive: true,
      partner: null,
      type: 'PHYSICAL',
    })
    setShowModal(true)
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name,
      description: reward.description,
      costPoints: reward.costPoints,
      imageUrl: reward.imageUrl || '',
      isActive: reward.isActive,
      partner: reward.partner || null,
      type: reward.type || 'PHYSICAL',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingReward) {
        await adminService.updateReward(editingReward.id, formData)
        showToast('Reward aggiornato con successo', 'success')
      } else {
        await adminService.createReward(formData)
        showToast('Reward creato con successo', 'success')
      }
      setShowModal(false)
      loadRewards()
    } catch (err: any) {
      showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  const handleDelete = async (reward: Reward) => {
    if (!confirm(`Sei sicuro di voler eliminare "${reward.name}"?`)) return
    try {
      await adminService.deleteReward(reward.id)
      showToast('Reward eliminato con successo', 'success')
      loadRewards()
    } catch (err: any) {
      showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Rewards Management</h2>
          <p className="text-sm text-gray-600 mt-1">Gestisci i premi disponibili nel sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nuovo Reward
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`border rounded-lg p-6 ${reward.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
          >
            {reward.imageUrl && (
              <img
                src={reward.imageUrl}
                alt={reward.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                <div className="flex gap-2 mt-1">
                  {reward.partner && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                      {reward.partner.name}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${reward.type === 'DIGITAL' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                    {reward.type === 'DIGITAL' ? 'Digitale' : 'Fisico'}
                  </span>
                </div>
              </div>
              {!reward.isActive && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inattivo</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{reward.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-900">{reward.costPoints} punti</span>
              <span className="text-xs text-gray-500">
                {new Date(reward.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(reward)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(reward)}
                className="flex-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun reward presente. Creane uno nuovo!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingReward ? 'Modifica Reward' : 'Nuovo Reward'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (punti)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.costPoints}
                    onChange={(e) => setFormData({ ...formData, costPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PHYSICAL' | 'DIGITAL' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="PHYSICAL">Fisico</option>
                    <option value="DIGITAL">Digitale</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner (Opzionale)</label>
                <select
                  value={formData.partner?.id || ''}
                  onChange={(e) => {
                    const partnerId = parseInt(e.target.value)
                    const partner = partners.find(p => p.id === partnerId) || null
                    setFormData({ ...formData, partner })
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Nessun Partner</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Immagine</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Attivo
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingReward ? 'Salva' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
