import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface Partner {
    id: number
    name: string
    description: string
    logoUrl: string
    websiteUrl: string
    isActive: boolean
    createdAt: string
}

export default function PartnersManagement() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logoUrl: '',
        websiteUrl: '',
        isActive: true,
    })

    const { showToast } = useToast()

    useEffect(() => {
        loadPartners()
    }, [])

    const loadPartners = async () => {
        try {
            const data = await adminService.getAllPartners()
            setPartners(data)
        } catch (err) {
            showToast('Errore nel caricamento dei partner', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingPartner(null)
        setFormData({
            name: '',
            description: '',
            logoUrl: '',
            websiteUrl: '',
            isActive: true,
        })
        setShowModal(true)
    }

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner)
        setFormData({
            name: partner.name,
            description: partner.description,
            logoUrl: partner.logoUrl || '',
            websiteUrl: partner.websiteUrl || '',
            isActive: partner.isActive,
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const partnerData = {
                ...formData,
                id: editingPartner?.id
            }

            // Both create and update use the same endpoint in backend (savePartner)
            await adminService.createPartner(partnerData)

            showToast(editingPartner ? 'Partner aggiornato con successo' : 'Partner creato con successo', 'success')
            setShowModal(false)
            loadPartners()
        } catch (err: any) {
            showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
        }
    }

    const handleDelete = async (partner: Partner) => {
        if (!confirm(`Sei sicuro di voler eliminare "${partner.name}"?`)) return
        try {
            await adminService.deletePartner(partner.id)
            showToast('Partner eliminato con successo', 'success')
            loadPartners()
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
                    <h2 className="text-2xl font-semibold text-gray-900">Partners Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Gestisci i partner che offrono premi</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    + Nuovo Partner
                </button>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className={`border rounded-lg p-6 ${partner.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {partner.logoUrl ? (
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="w-16 h-16 object-contain rounded-lg border border-gray-100"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    No Logo
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                                {!partner.isActive && (
                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inattivo</span>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.description}</p>

                        {partner.websiteUrl && (
                            <a
                                href={partner.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline mb-4 block"
                            >
                                Visita sito web
                            </a>
                        )}

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleEdit(partner)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Modifica
                            </button>
                            <button
                                onClick={() => handleDelete(partner)}
                                className="flex-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Elimina
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {partners.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nessun partner presente. Creane uno nuovo!</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingPartner ? 'Modifica Partner' : 'Nuovo Partner'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
                                <input
                                    type="url"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sito Web</label>
                                <input
                                    type="url"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
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
                                    {editingPartner ? 'Salva' : 'Crea'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
