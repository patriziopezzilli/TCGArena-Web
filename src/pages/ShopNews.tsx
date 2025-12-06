import { useEffect, useState } from 'react'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface ShopNews {
    id: number
    shopId: number
    title: string
    content: string
    newsType: 'ANNOUNCEMENT' | 'NEW_STOCK' | 'TOURNAMENT' | 'SALE' | 'EVENT' | 'GENERAL'
    startDate: string
    expiryDate?: string
    imageUrl?: string
    isPinned: boolean
    createdAt: string
    updatedAt: string
}

type TabType = 'active' | 'future' | 'expired'

const NEWS_TYPES = [
    { value: 'ANNOUNCEMENT', label: 'Annuncio', color: 'bg-blue-100 text-blue-800' },
    { value: 'NEW_STOCK', label: 'Nuovo Arrivo', color: 'bg-green-100 text-green-800' },
    { value: 'TOURNAMENT', label: 'Torneo', color: 'bg-orange-100 text-orange-800' },
    { value: 'SALE', label: 'Offerta', color: 'bg-red-100 text-red-800' },
    { value: 'EVENT', label: 'Evento', color: 'bg-purple-100 text-purple-800' },
    { value: 'GENERAL', label: 'Generale', color: 'bg-gray-100 text-gray-800' },
]

export default function ShopNews() {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabType>('active')
    const [news, setNews] = useState<ShopNews[]>([])
    const [shopId, setShopId] = useState<string | null>(null)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editingNews, setEditingNews] = useState<ShopNews | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        newsType: 'ANNOUNCEMENT' as ShopNews['newsType'],
        startDate: '',
        expiryDate: '',
        imageUrl: '',
        isPinned: false,
    })

    useEffect(() => {
        loadShopId()
    }, [])

    useEffect(() => {
        if (shopId) {
            loadNews()
        }
    }, [shopId, activeTab])

    const loadShopId = async () => {
        try {
            const status = await merchantService.getShopStatus()
            if (status.shop?.id) {
                setShopId(String(status.shop.id))
            }
        } catch (error) {
            console.error('Error loading shop ID:', error)
            showToast('Errore nel caricamento dei dati del negozio', 'error')
        }
    }

    const loadNews = async () => {
        if (!shopId) return

        try {
            setLoading(true)
            let data: ShopNews[]

            switch (activeTab) {
                case 'active':
                    data = await merchantService.getActiveNews(shopId)
                    break
                case 'future':
                    data = await merchantService.getFutureNews(shopId)
                    break
                case 'expired':
                    data = await merchantService.getExpiredNews(shopId)
                    break
                default:
                    data = []
            }

            setNews(data)
        } catch (error) {
            console.error('Error loading news:', error)
            showToast('Errore nel caricamento delle notizie', 'error')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingNews(null)
        setFormData({
            title: '',
            content: '',
            newsType: 'ANNOUNCEMENT',
            startDate: new Date().toISOString().slice(0, 16),
            expiryDate: '',
            imageUrl: '',
            isPinned: false,
        })
        setShowModal(true)
    }

    const openEditModal = (item: ShopNews) => {
        setEditingNews(item)
        setFormData({
            title: item.title,
            content: item.content,
            newsType: item.newsType,
            startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 16) : '',
            imageUrl: item.imageUrl || '',
            isPinned: item.isPinned,
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shopId) return

        try {
            setSaving(true)

            const payload = {
                title: formData.title,
                content: formData.content,
                newsType: formData.newsType,
                startDate: formData.startDate || undefined,
                expiryDate: formData.expiryDate || undefined,
                imageUrl: formData.imageUrl || undefined,
                isPinned: formData.isPinned,
            }

            if (editingNews) {
                await merchantService.updateNews(shopId, String(editingNews.id), payload)
                showToast('Notizia aggiornata con successo!', 'success')
            } else {
                await merchantService.createNews(shopId, payload)
                showToast('Notizia creata con successo!', 'success')
            }

            setShowModal(false)
            loadNews()
        } catch (error: any) {
            console.error('Error saving news:', error)
            showToast(error.response?.data?.message || 'Errore nel salvataggio', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (newsId: number) => {
        if (!shopId) return

        if (!confirm('Sei sicuro di voler eliminare questa notizia?')) return

        try {
            await merchantService.deleteNews(shopId, String(newsId))
            showToast('Notizia eliminata con successo!', 'success')
            loadNews()
        } catch (error) {
            console.error('Error deleting news:', error)
            showToast('Errore nell\'eliminazione', 'error')
        }
    }

    const getNewsTypeBadge = (type: ShopNews['newsType']) => {
        const typeConfig = NEWS_TYPES.find(t => t.value === type)
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                {typeConfig?.label || type}
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const tabs = [
        { id: 'active' as TabType, label: 'Attive', count: activeTab === 'active' ? news.length : null },
        { id: 'future' as TabType, label: 'Future', count: activeTab === 'future' ? news.length : null },
        { id: 'expired' as TabType, label: 'Scadute', count: activeTab === 'expired' ? news.length : null },
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => window.history.back()}
                                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
                            >
                                ← Torna al Dashboard
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-900">Gestione Notizie</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Pubblica notizie e aggiornamenti per i tuoi clienti
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            ➕ Nuova Notizia
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== null && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                            {activeTab === 'active' && 'Nessuna notizia attiva'}
                            {activeTab === 'future' && 'Nessuna notizia programmata'}
                            {activeTab === 'expired' && 'Nessuna notizia scaduta'}
                        </p>
                        {activeTab === 'active' && (
                            <button
                                onClick={openCreateModal}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Crea la tua prima notizia →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {news.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getNewsTypeBadge(item.newsType)}
                                            {item.isPinned && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    📌 In evidenza
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{item.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>📅 Inizio: {formatDate(item.startDate)}</span>
                                            {item.expiryDate && (
                                                <span>⏰ Scadenza: {formatDate(item.expiryDate)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            Modifica
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Elimina
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            {editingNews ? 'Modifica Notizia' : 'Nuova Notizia'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titolo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Titolo della notizia"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contenuto *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Scrivi il contenuto della notizia..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* News Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo *
                                </label>
                                <select
                                    value={formData.newsType}
                                    onChange={(e) => setFormData({ ...formData, newsType: e.target.value as ShopNews['newsType'] })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {NEWS_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Inizio *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Scadenza
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lascia vuoto per non avere scadenza
                                    </p>
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Immagine (opzionale)
                                </label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://esempio.com/immagine.jpg"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Is Pinned */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPinned"
                                    checked={formData.isPinned}
                                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isPinned" className="text-sm text-gray-700">
                                    Metti in evidenza (la notizia apparirà per prima)
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Salvataggio...' : (editingNews ? 'Salva Modifiche' : 'Crea Notizia')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
