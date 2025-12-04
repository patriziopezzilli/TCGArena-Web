import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface InventoryCard {
  id: string
  card_template_id: number
  shop_id: number
  condition: 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'LIGHT_PLAYED' | 'PLAYED' | 'POOR'
  quantity: number
  price: number
  nationality?: 'JPN' | 'ITA' | 'EN' | 'COR' | 'FRA' | 'GER' | 'SPA' | 'POR' | 'CHI' | 'RUS'
  notes?: string
  created_at: string
  updated_at: string
  card_template: {
    id: number
    name: string
    tcgType: string
    setCode: string
    expansion: {
      id: number
      title: string
      tcgType: string
      imageUrl?: string
      sets: any[]
      cardCount: number
      releaseDate: string
    }
    rarity: string
    cardNumber: string
    description: string
    imageUrl?: string
    marketPrice?: number
    manaCost?: number
    dateCreated: string
  }
}

interface CardTemplate {
  id: string
  name: string
  tcgType: string
  expansionId: number
  expansionName: string
  setCode: string
  setName: string
  rarity: string
  imageUrl?: string
  cardNumber?: string
}

interface InventoryFilters {
  tcgType?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  searchQuery?: string
}

interface TemplateFilters {
  tcgType?: string
  expansionId?: number
  setCode?: string
  rarity?: string
  q?: string
}

export default function MerchantInventory() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryCard[]>([])
  const [cardTemplates, setCardTemplates] = useState<CardTemplate[]>([])
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>({})
  const [templateFilters, setTemplateFilters] = useState<TemplateFilters>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCard, setEditingCard] = useState<InventoryCard | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null)
  const [shopId, setShopId] = useState<string>('')
  const [currentView, setCurrentView] = useState<'templates' | 'inventory'>('templates')
  const [templatePage, setTemplatePage] = useState(0)
  const [hasMoreTemplates, setHasMoreTemplates] = useState(true)
  
  // Filter options
  const [tcgTypes, setTcgTypes] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [setCodes, setSetCodes] = useState<string[]>([])
  const [expansions, setExpansions] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    cardId: '',
    cardName: '',
    tcgType: 'POKEMON',
    setName: '',
    rarity: 'COMMON',
    condition: 'NEAR_MINT',
    quantity: 1,
    price: 0,
    nationality: 'EN' as 'JPN' | 'ITA' | 'EN' | 'COR' | 'FRA' | 'GER' | 'SPA' | 'POR' | 'CHI' | 'RUS',
    notes: ''
  })

  // Helper function to manipulate image URL like in iOS
  const getFullImageUrl = (baseUrl?: string) => {
    if (!baseUrl) return null;
    if (baseUrl.includes('/high.webp')) {
      return baseUrl;
    }
    return `${baseUrl}/high.webp`;
  }

  useEffect(() => {
    const user = localStorage.getItem('merchant_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.shopId) {
        setShopId(userData.shopId)
        loadInventory(userData.shopId)
        loadFilterOptions()
        loadCardTemplates()
      }
    }
  }, [])

  const loadFilterOptions = async () => {
    try {
      const [tcgTypesData, raritiesData, setCodesData, expansionsData] = await Promise.all([
        merchantService.getTCGTypes(),
        merchantService.getRarities(),
        merchantService.getSetCodes(),
        merchantService.getExpansions()
      ])
      setTcgTypes(tcgTypesData)
      setRarities(raritiesData)
      setSetCodes(setCodesData)
      setExpansions(expansionsData)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const loadCardTemplates = async (page: number = 0, append: boolean = false) => {
    try {
      setLoading(true)
      const data = await merchantService.searchCardTemplates({
        ...templateFilters,
        page,
        size: 20
      })
      
      console.log('Loaded card templates:', data.content?.map(t => ({ id: t.id, name: t.name })))
      
      if (append) {
        setCardTemplates(prev => [...prev, ...data.content])
      } else {
        setCardTemplates(data.content)
      }
      
      setHasMoreTemplates(!data.last)
      setTemplatePage(page)
    } catch (error) {
      console.error('Error loading card templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInventory = async (shopId: string, customFilters?: InventoryFilters) => {
    try {
      setLoading(true)
      const data = await merchantService.getInventory(shopId, customFilters || inventoryFilters)
      setInventory(data.inventory || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplateFilters = () => {
    loadCardTemplates(0, false)
  }

  const loadMoreTemplates = () => {
    if (hasMoreTemplates && !loading) {
      loadCardTemplates(templatePage + 1, true)
    }
  }

  const applyInventoryFilters = () => {
    loadInventory(shopId, inventoryFilters)
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const requestData = {
        card_template_id: parseInt(formData.cardId),
        shop_id: parseInt(shopId),
        condition: formData.condition,
        price: formData.price,
        quantity: formData.quantity,
        notes: formData.notes,
        nationality: formData.nationality
      }
      await merchantService.createInventoryCard(requestData)
      showToast('Carta aggiunta con successo', 'success')
      setShowAddModal(false)
      setSelectedTemplate(null)
      resetForm()
      loadInventory(shopId)
      // Rimuovi il jump automatico all'inventory per permettere aggiunte consecutive
    } catch (error) {
      console.error('Error adding card:', error)
      showToast('Errore durante l\'aggiunta della carta', 'error')
    }
  }

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCard) return
    
    try {
      const requestData = {
        condition: formData.condition,
        price: formData.price,
        quantity: formData.quantity,
        notes: formData.notes,
        nationality: formData.nationality
      }
      await merchantService.updateInventoryCard(editingCard.id, requestData)
      showToast('Carta aggiornata con successo', 'success')
      setEditingCard(null)
      setSelectedTemplate(null)
      resetForm()
      loadInventory(shopId)
    } catch (error) {
      console.error('Error updating card:', error)
      showToast('Errore durante l\'aggiornamento della carta', 'error')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa carta?')) return
    
    try {
      await merchantService.deleteInventoryCard(cardId)
      showToast('Carta eliminata con successo', 'success')
      loadInventory(shopId)
    } catch (error) {
      console.error('Error deleting card:', error)
      showToast('Errore durante l\'eliminazione della carta', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      cardId: '',
      cardName: '',
      tcgType: 'POKEMON',
      setName: '',
      rarity: 'COMMON',
      condition: 'NEAR_MINT',
      quantity: 1,
      price: 0,
      nationality: 'EN',
      notes: ''
    })
  }

  const openEditModal = (card: InventoryCard) => {
    setEditingCard(card)
    setFormData({
      cardId: card.card_template.id.toString(),
      cardName: card.card_template.name,
      tcgType: card.card_template.tcgType,
      setName: card.card_template.setCode,
      rarity: card.card_template.rarity,
      condition: card.condition,
      quantity: card.quantity,
      price: card.price,
      nationality: card.nationality || 'EN',
      notes: card.notes || ''
    })
  }

  const openAddFromTemplateModal = (template: CardTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      cardId: template.id,
      cardName: template.name,
      tcgType: template.tcgType,
      setName: template.setCode || template.setName || '', // Usa setCode come fallback
      rarity: template.rarity,
      condition: 'NEAR_MINT',
      quantity: 1,
      price: 0,
      nationality: 'EN',
      notes: ''
    })
    setShowAddModal(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/merchant/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Torna alla Dashboard
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Gestione Inventario</h1>
            </div>
          </div>
          
          {/* View Tabs */}
          <div className="flex mt-4 border-b border-gray-200">
            <button
              onClick={() => {
                setCurrentView('templates')
                if (shopId) loadCardTemplates(0, false)
              }}
              className={`px-4 py-2 font-medium text-sm ${
                currentView === 'templates'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sfoglia Carte
            </button>
            <button
              onClick={() => {
                setCurrentView('inventory')
                if (shopId) loadInventory(shopId)
              }}
              className={`px-4 py-2 font-medium text-sm ${
                currentView === 'inventory'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inventario ({inventory.length})
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {currentView === 'templates' ? (
          /* Template Filters */
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtri Ricerca Carte</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Cerca per nome..."
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={templateFilters.q || ''}
                onChange={(e) => setTemplateFilters({ ...templateFilters, q: e.target.value })}
              />
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={templateFilters.tcgType || ''}
                onChange={(e) => setTemplateFilters({ ...templateFilters, tcgType: e.target.value || undefined })}
              >
                <option value="">Tutti i TCG</option>
                {tcgTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={templateFilters.expansionId || ''}
                onChange={(e) => setTemplateFilters({ ...templateFilters, expansionId: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">Tutte le Espansioni</option>
                {expansions.map(expansion => (
                  <option key={expansion.id} value={expansion.id}>{expansion.title}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={templateFilters.setCode || ''}
                onChange={(e) => setTemplateFilters({ ...templateFilters, setCode: e.target.value || undefined })}
              >
                <option value="">Tutti i Set</option>
                {setCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={templateFilters.rarity || ''}
                onChange={(e) => setTemplateFilters({ ...templateFilters, rarity: e.target.value || undefined })}
              >
                <option value="">Tutte le Rarità</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
              <button
                onClick={applyTemplateFilters}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        ) : (
          /* Inventory Filters */
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtri Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Cerca per nome..."
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={inventoryFilters.searchQuery || ''}
                onChange={(e) => setInventoryFilters({ ...inventoryFilters, searchQuery: e.target.value })}
              />
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={inventoryFilters.tcgType || ''}
                onChange={(e) => setInventoryFilters({ ...inventoryFilters, tcgType: e.target.value })}
              >
                <option value="">Tutti i TCG</option>
                <option value="POKEMON">Pokémon</option>
                <option value="ONEPIECE">One Piece</option>
                <option value="MAGIC">Magic</option>
                <option value="YUGIOH">Yu-Gi-Oh!</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={inventoryFilters.condition || ''}
                onChange={(e) => setInventoryFilters({ ...inventoryFilters, condition: e.target.value })}
              >
                <option value="">Tutte le condizioni</option>
                <option value="MINT">Mint</option>
                <option value="NEAR_MINT">Near Mint</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
              </select>
              <input
                type="number"
                placeholder="Prezzo min"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={inventoryFilters.minPrice || ''}
                onChange={(e) => setInventoryFilters({ ...inventoryFilters, minPrice: Number(e.target.value) })}
              />
              <button
                onClick={applyInventoryFilters}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === 'templates' ? (
          /* Card Templates Grid */
          <>
            {loading && cardTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : cardTemplates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Nessuna carta trovata</p>
                <p className="text-sm text-gray-500 mt-2">Prova a modificare i filtri di ricerca</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cardTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-3">
                          {getFullImageUrl(template.imageUrl) ? (
                            <img
                              src={getFullImageUrl(template.imageUrl)!}
                              alt={template.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder = parent.querySelector('.card-placeholder') as HTMLElement;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-16 h-16 bg-gray-100 border-2 border-gray-200 rounded flex-shrink-0 flex items-center justify-center card-placeholder ${template.imageUrl ? 'hidden' : 'flex'}`}>
                            <div className="text-gray-400 text-xs text-center">
                              <div className="text-lg">🃏</div>
                              <div>CARD</div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {template.tcgType} • {template.setName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {template.rarity} • {template.cardNumber}
                          </p>
                          <button
                            onClick={() => openAddFromTemplateModal(template)}
                            className="mt-3 w-full px-3 py-2 bg-blue-200 text-blue-800 text-xs rounded font-medium hover:bg-blue-300 transition-colors"
                          >
                            Aggiungi all'Inventario
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMoreTemplates && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMoreTemplates}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Caricamento...' : 'Carica Altre Carte'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Inventory List */
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Nessuna carta in inventario</p>
                <button
                  onClick={() => setCurrentView('templates')}
                  className="mt-4 text-primary hover:underline"
                >
                  Sfoglia carte da aggiungere
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inventory.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getFullImageUrl(card.card_template.imageUrl) ? (
                          <img
                            src={getFullImageUrl(card.card_template.imageUrl)!}
                            alt={card.card_template.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const placeholder = parent.querySelector('.card-placeholder') as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center card-placeholder ${card.card_template.imageUrl ? 'hidden' : 'flex'}`}>
                          <div className="text-gray-400 text-xs text-center">
                            <div className="text-lg">🃏</div>
                            <div>CARD</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{card.card_template.name}</h3>
                          <p className="text-sm text-gray-600">
                            {card.card_template.tcgType} • {card.card_template.expansion.title} • {card.card_template.rarity}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Condizione: {card.condition} • Quantità: {card.quantity} • Nazionalità: {card.nationality || 'EN'}
                          </p>
                          {card.notes && (
                            <p className="text-sm text-gray-500 mt-1">Note: {card.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">€{card.price.toFixed(2)}</p>
                          <p className={`text-sm ${card.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {card.quantity > 0 ? '✓ Disponibile' : '✗ Esaurito'}
                          </p>
                        </div>
                        <button
                          onClick={() => openEditModal(card)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCard) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingCard ? 'Modifica Carta' : selectedTemplate ? `Aggiungi "${selectedTemplate.name}"` : 'Aggiungi Carta'}
            </h2>
            <form onSubmit={editingCard ? handleUpdateCard : handleAddCard}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Carta
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    disabled={!!selectedTemplate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TCG
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.tcgType}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Code
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.setName}
                    disabled={!!selectedTemplate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rarità
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.rarity}
                    disabled={!!selectedTemplate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condizione
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  >
                    <option value="MINT">Mint</option>
                    <option value="NEAR_MINT">Near Mint</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="LIGHT_PLAYED">Light Played</option>
                    <option value="PLAYED">Played</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazionalità
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value as any })}
                  >
                    <option value="EN">English</option>
                    <option value="ITA">Italian</option>
                    <option value="JPN">Japanese</option>
                    <option value="COR">Korean</option>
                    <option value="FRA">French</option>
                    <option value="GER">German</option>
                    <option value="SPA">Spanish</option>
                    <option value="POR">Portuguese</option>
                    <option value="CHI">Chinese</option>
                    <option value="RUS">Russian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo (€)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="Inserisci prezzo manualmente"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 cursor-not-allowed text-xs font-medium hover:from-blue-100 hover:to-indigo-100 transition-colors relative"
                        title="Funzionalità in arrivo"
                      >
                        <span className="flex items-center gap-1">
                          📈
                          <span>Auto</span>
                        </span>
                        <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs px-1 rounded-full font-bold">
                          SOON
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-600 mt-1 font-medium">
                    💡 Inserisci manualmente o usa la quotazione automatica (prossimamente)
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Note aggiuntive sulla carta..."
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCard(null)
                    setSelectedTemplate(null)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingCard ? 'Salva Modifiche' : 'Aggiungi Carta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
