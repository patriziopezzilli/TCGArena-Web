import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface Achievement {
  id: number
  name: string
  description: string
  criteria: string
  pointsReward: number
  iconUrl: string
  isActive: boolean
  createdAt: string
}

export default function AchievementsManagement() {
  const { showToast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: '',
    pointsReward: 0,
    iconUrl: '',
    isActive: true,
  })

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const data = await adminService.getAllAchievements()
      setAchievements(data)
    } catch (err) {
      showToast('Errore nel caricamento degli achievements', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAchievement(null)
    setFormData({
      name: '',
      description: '',
      criteria: '',
      pointsReward: 0,
      iconUrl: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setFormData({
      name: achievement.name,
      description: achievement.description,
      criteria: achievement.criteria,
      pointsReward: achievement.pointsReward,
      iconUrl: achievement.iconUrl || '',
      isActive: achievement.isActive,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAchievement) {
        await adminService.updateAchievement(editingAchievement.id, formData)
        showToast('Achievement aggiornato con successo', 'success')
      } else {
        await adminService.createAchievement(formData)
        showToast('Achievement creato con successo', 'success')
      }
      setShowModal(false)
      loadAchievements()
    } catch (err: any) {
      showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  const handleDelete = async (achievement: Achievement) => {
    if (!confirm(`Sei sicuro di voler eliminare "${achievement.name}"?`)) return
    try {
      await adminService.deleteAchievement(achievement.id)
      showToast('Achievement eliminato con successo', 'success')
      loadAchievements()
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
          <h2 className="text-2xl font-semibold text-gray-900">Achievements Management</h2>
          <p className="text-sm text-gray-600 mt-1">Gestisci gli obiettivi e trofei del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nuovo Achievement
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`border rounded-lg p-6 ${
              achievement.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            {achievement.iconUrl && (
              <div className="flex items-center justify-center mb-4">
                <img
                  src={achievement.iconUrl}
                  alt={achievement.name}
                  className="w-20 h-20 object-contain"
                />
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
              {!achievement.isActive && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inattivo</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Criterio</p>
              <p className="text-sm font-mono text-gray-900">{achievement.criteria}</p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-green-600">+{achievement.pointsReward} punti</span>
              <span className="text-xs text-gray-500">
                {new Date(achievement.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(achievement)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(achievement)}
                className="flex-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun achievement presente. Creane uno nuovo!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingAchievement ? 'Modifica Achievement' : 'Nuovo Achievement'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criterio
                  <span className="text-xs text-gray-500 ml-2">(es: win_5_tournaments, collect_100_cards)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="win_5_tournaments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Punti Reward</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pointsReward}
                  onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Icona</label>
                <input
                  type="url"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
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
                  {editingAchievement ? 'Salva' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
