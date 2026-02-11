import { useEffect, useState } from 'react'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import DashboardLayout from '../components/DashboardLayout'
import { merchantMenuItems, getMerchantUserData } from '../constants/merchantMenu'
import { NewsIcon } from '../components/Icons'

interface ShopNewsItem {
    id: number
    shopId: number
    title: string
    content: string
    newsType: 'ANNOUNCEMENT' | 'NEW_STOCK' | 'TOURNAMENT' | 'SALE' | 'EVENT' | 'GENERAL'
    startDate: string
    expiryDate?: string
    imageUrl?: string
    isPinned: boolean
    tcgType?: string
    externalUrl?: string
    createdAt: string
    updatedAt: string
}

type TabType = 'active' | 'future' | 'expired'

const NEWS_TYPES = [
    { value: 'ANNOUNCEMENT', label: 'Annuncio', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'NEW_STOCK', label: 'Nuovo Arrivo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'TOURNAMENT', label: 'Torneo', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'SALE', label: 'Offerta', color: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'EVENT', label: 'Evento', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'GENERAL', label: 'Generale', color: 'bg-gray-100 text-gray-700 border-gray-200' },
]

interface ShopNewsProps {
    embedded?: boolean
}

export default function ShopNews({ embedded = false }: ShopNewsProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabType>('active')
    const [news, setNews] = useState<ShopNewsItem[]>([])
    const [shopId, setShopId] = useState<string | null>(null)

    const [showModal, setShowModal] = useState(false)
    const [editingNews, setEditingNews] = useState<ShopNewsItem | null>(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        newsType: 'ANNOUNCEMENT' as ShopNewsItem['newsType'],
        startDate: '',
        expiryDate: '',
        imageUrl: '',
        isPinned: false,
        tcgType: 'ALL',
        externalUrl: '',
    })

    const userData = getMerchantUserData()

    useEffect(() => {
        loadShopId()
    }, [])

    useEffect(() => {
        if (shopId) loadNews()
    }, [shopId, activeTab])

    const loadShopId = async () => {
        try {
            const status = await merchantService.getShopStatus()
            if (status.shop?.id) setShopId(String(status.shop.id))
        } catch (error) {
            console.error('Error loading shop ID:', error)
            showToast('Errore nel caricamento', 'error')
        }
    }

    const loadNews = async () => {
        if (!shopId) return
        try {
            setLoading(true)
            let data: ShopNewsItem[]
            switch (activeTab) {
                case 'active': data = await merchantService.getActiveNews(shopId); break
                case 'future': data = await merchantService.getFutureNews(shopId); break
                case 'expired': data = await merchantService.getExpiredNews(shopId); break
                default: data = []
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
            tcgType: 'ALL',
            externalUrl: '',
        })
        setShowModal(true)
    }

    const openEditModal = (item: ShopNewsItem) => {
        setEditingNews(item)
        setFormData({
            title: item.title,
            content: item.content,
            newsType: item.newsType,
            startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 16) : '',
            imageUrl: item.imageUrl || '',
            isPinned: item.isPinned,
            tcgType: item.tcgType || 'ALL',
            externalUrl: item.externalUrl || '',
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
                tcgType: formData.tcgType === 'ALL' ? null : formData.tcgType,
                externalUrl: formData.externalUrl.trim() || undefined,
            }
            if (editingNews) {
                await merchantService.updateNews(shopId, String(editingNews.id), payload)
                showToast('Notizia aggiornata!', 'success')
            } else {
                await merchantService.createNews(shopId, payload)
                showToast('Notizia creata!', 'success')
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
        if (!shopId || !confirm('Sei sicuro di voler eliminare questa notizia?')) return
        try {
            await merchantService.deleteNews(shopId, String(newsId))
            showToast('Notizia eliminata!', 'success')
            loadNews()
        } catch (error) {
            console.error('Error deleting news:', error)
            showToast('Errore nell\'eliminazione', 'error')
        }
    }

    const getNewsTypeBadge = (type: ShopNewsItem['newsType']) => {
        const typeConfig = NEWS_TYPES.find(t => t.value === type)
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${typeConfig?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
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

    const content = (
        <>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 -mt-2">
                <div className="flex gap-1 overflow-x-auto">
                    {(['active', 'future', 'expired'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {tab === 'active' ? 'Attive' : tab === 'future' ? 'Future' : 'Scadute'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <span>+</span> Nuova Notizia
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <NewsIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                        {activeTab === 'active' && 'Nessuna notizia attiva'}
                        {activeTab === 'future' && 'Nessuna notizia programmata'}
                        {activeTab === 'expired' && 'Nessuna notizia scaduta'}
                    </p>
                    {activeTab === 'active' && (
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-5 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Crea la prima notizia
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {news.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getNewsTypeBadge(item.newsType)}
                                        {item.isPinned && (
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                            </span>
                                        )}
                                        {item.tcgType && (
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                                🃏 {item.tcgType}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>📅 {formatDate(item.startDate)}</span>
                                        {item.expiryDate && <span>⏰ Scade: {formatDate(item.expiryDate)}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Modifica
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingNews ? 'Modifica Notizia' : 'Nuova Notizia'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Titolo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Titolo della notizia"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contenuto *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Scrivi il contenuto..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                <select
                                    value={formData.newsType}
                                    onChange={(e) => setFormData({ ...formData, newsType: e.target.value as ShopNewsItem['newsType'] })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    {NEWS_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">TCG Specifico (Opzionale)</label>
                                    <select
                                        value={formData.tcgType}
                                        onChange={(e) => setFormData({ ...formData, tcgType: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    >
                                        <option value="ALL">Tutti</option>
                                        <option value="POKEMON">Pokémon</option>
                                        <option value="POKEMON_JAPAN">Pokémon Japan</option>
                                        <option value="MAGIC">Magic: The Gathering</option>
                                        <option value="YUGIOH">Yu-Gi-Oh!</option>
                                        <option value="ONE_PIECE">One Piece</option>
                                        <option value="DIGIMON">Digimon</option>
                                        <option value="LORCANA">Disney Lorcana</option>
                                        <option value="RIFTBOUND">Riftbound</option>
                                        <option value="DRAGON_BALL_SUPER_FUSION_WORLD">Dragon Ball Super</option>
                                        <option value="FLESH_AND_BLOOD">Flesh and Blood</option>
                                        <option value="UNION_ARENA">Union Arena</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Esterno</label>
                                    <input
                                        type="url"
                                        value={formData.externalUrl}
                                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Scadenza</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL Immagine</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPinned"
                                    checked={formData.isPinned}
                                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                    className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <label htmlFor="isPinned" className="text-sm text-gray-700">📌 Metti in evidenza</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Salvataggio...' : (editingNews ? 'Salva' : 'Crea')}
                                </button>
                            </div>
                        </form>
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
            title="Notizie"
            subtitle={`${news.length} notizie ${activeTab === 'active' ? 'attive' : activeTab === 'future' ? 'programmate' : 'scadute'}`}
            menuItems={merchantMenuItems}
            userName={userData?.displayName || userData?.username}
            shopName={userData?.shopName}
        >
            {content}
        </DashboardLayout>
    )
}
