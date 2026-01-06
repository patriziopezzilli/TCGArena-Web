import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import {
  ImportIcon, CubeIcon, DocumentIcon, CloudArrowUpIcon, CpuChipIcon
} from '../components/Icons'

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

interface MerchantInventoryProps {
  embedded?: boolean
}

export default function MerchantInventory({ embedded = false }: MerchantInventoryProps) {
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
  const [currentView, setCurrentView] = useState<'templates' | 'inventory' | 'import' | 'bulk'>('templates')
  const [templatePage, setTemplatePage] = useState(0)
  const [hasMoreTemplates, setHasMoreTemplates] = useState(true)

  // Multi-select state
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [showBulkAddModal, setShowBulkAddModal] = useState(false)

  // Bulk add by set/expansion state
  const [bulkSettings, setBulkSettings] = useState({
    selectedTcgType: '',
    selectedExpansionId: '',
    selectedSetCode: '',
    condition: 'NEAR_MINT',
    quantity: 1,
    price: 0,
    nationality: 'EN'
  })
  const [bulkLoading, setBulkLoading] = useState(false)

  // Search debounce timer
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null)

  // Filter options
  const [tcgTypes, setTcgTypes] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [setCodes, setSetCodes] = useState<string[]>([])
  const [expansions, setExpansions] = useState<any[]>([])

  // Import state
  const [importMode, setImportMode] = useState<'standard' | 'custom'>('standard')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [customNotes, setCustomNotes] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    successCount?: number
    errorCount?: number
    errors?: string[]
  } | null>(null)

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

  // Debounce search query for inventory
  useEffect(() => {
    if (!shopId) return

    // Clear previous timer
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    // Set new timer to call backend after 500ms of no typing
    const timer = setTimeout(() => {
      loadInventory(shopId, inventoryFilters)
    }, 500)

    setSearchTimer(timer)

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [inventoryFilters.searchQuery])

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

      console.log('Loaded card templates:', data.content?.map((t: any) => ({ id: t.id, name: t.name })))

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
    <div className={embedded ? "" : "min-h-screen bg-white"}>
      {/* Header - only show when not embedded */}
      {!embedded && (
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
          </div>
        </header>
      )}

      {/* View Tabs - always show */}
      <div className={embedded ? "mb-4" : "max-w-7xl mx-auto px-6 pt-4"}>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setCurrentView('templates')
              if (shopId) loadCardTemplates(0, false)
            }}
            className={`px-4 py-2 font-medium text-sm ${currentView === 'templates'
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
            className={`px-4 py-2 font-medium text-sm ${currentView === 'inventory'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Inventario ({inventory.length})
          </button>
          <button
            onClick={() => setCurrentView('import')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${currentView === 'import'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <ImportIcon className="w-4 h-4" /> Import
          </button>
          <button
            onClick={() => setCurrentView('bulk')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${currentView === 'bulk'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <CubeIcon className="w-4 h-4" /> Aggiungi Set
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={embedded ? "py-4" : "max-w-7xl mx-auto px-6 py-6"}>
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
                {/* Multi-select action bar */}
                {selectedTemplates.size > 0 && (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-blue-900">
                        {selectedTemplates.size} carte selezionate
                      </span>
                      <button
                        onClick={() => setSelectedTemplates(new Set())}
                        className="text-sm text-blue-700 hover:text-blue-900"
                      >
                        Deseleziona tutto
                      </button>
                    </div>
                    <button
                      onClick={() => setShowBulkAddModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      📦 Aggiungi {selectedTemplates.size} carte selezionate
                    </button>
                  </div>
                )}

                {/* Select all / none buttons */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => {
                      const allIds = new Set(cardTemplates.map(t => t.id))
                      setSelectedTemplates(allIds)
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ☑️ Seleziona tutto
                  </button>
                  <button
                    onClick={() => setSelectedTemplates(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ☐ Deseleziona tutto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cardTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${selectedTemplates.has(template.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedTemplates)
                            if (e.target.checked) {
                              newSelected.add(template.id)
                            } else {
                              newSelected.delete(template.id)
                            }
                            setSelectedTemplates(newSelected)
                          }}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
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

        ) : currentView === 'inventory' ? (
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
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${card.condition === 'MINT' ? 'bg-green-100 text-green-800' :
                              card.condition === 'NEAR_MINT' ? 'bg-blue-100 text-blue-800' :
                                card.condition === 'EXCELLENT' ? 'bg-yellow-100 text-yellow-800' :
                                  card.condition === 'GOOD' ? 'bg-orange-100 text-orange-800' :
                                    card.condition === 'LIGHT_PLAYED' ? 'bg-purple-100 text-purple-800' :
                                      card.condition === 'PLAYED' ? 'bg-pink-100 text-pink-800' :
                                        'bg-gray-100 text-gray-800'
                              }`}>
                              {card.condition.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                              QTY: {card.quantity}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${card.nationality === 'JPN' ? 'bg-red-100 text-red-800' :
                              card.nationality === 'ITA' ? 'bg-green-100 text-green-800' :
                                card.nationality === 'EN' ? 'bg-blue-100 text-blue-800' :
                                  card.nationality === 'COR' ? 'bg-yellow-100 text-yellow-800' :
                                    card.nationality === 'FRA' ? 'bg-purple-100 text-purple-800' :
                                      card.nationality === 'GER' ? 'bg-pink-100 text-pink-800' :
                                        card.nationality === 'SPA' ? 'bg-orange-100 text-orange-800' :
                                          card.nationality === 'POR' ? 'bg-teal-100 text-teal-800' :
                                            card.nationality === 'CHI' ? 'bg-indigo-100 text-indigo-800' :
                                              card.nationality === 'RUS' ? 'bg-gray-100 text-gray-800' :
                                                'bg-gray-100 text-gray-800'
                              }`}>
                              {card.nationality || 'EN'}
                            </span>
                          </div>
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
        ) : currentView === 'import' ? (
          /* Import View */
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Import Inventario</h2>

            {/* Import Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setImportMode('standard'); setImportResult(null) }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${importMode === 'standard'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                📊 Import Veloce (CSV)
              </button>
              <button
                onClick={() => { setImportMode('custom'); setImportResult(null) }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${importMode === 'custom'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                🤖 Import Personalizzato (AI)
              </button>
            </div>

            {importMode === 'standard' ? (
              /* Standard CSV Import */
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Come funziona</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Scarica il template CSV</li>
                    <li>Compila il file con i dati del tuo inventario</li>
                    <li>Carica il file compilato</li>
                    <li>Le carte verranno aggiunte automaticamente!</li>
                  </ol>
                </div>

                {/* Download Template Button */}
                <div>
                  <button
                    onClick={async () => {
                      try {
                        const blob = await merchantService.downloadInventoryTemplate()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'inventory_import_template.csv'
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                        showToast('Template scaricato!', 'success')
                      } catch (error) {
                        showToast('Errore durante il download del template', 'error')
                      }
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    ⬇️ Scarica Template CSV
                  </button>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setImportFile(file)
                    }}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {importFile ? (
                      <div className="text-gray-900 flex flex-col items-center">
                        <DocumentIcon className="w-8 h-8 text-gray-400" />
                        <p className="mt-2 font-medium">{importFile.name}</p>
                        <p className="text-sm text-gray-500">Clicca per cambiare file</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                        <p className="mt-2">Trascina qui il file CSV o clicca per selezionarlo</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Import Button */}
                {importFile && (
                  <button
                    onClick={async () => {
                      if (!importFile || !shopId) return
                      setImportLoading(true)
                      setImportResult(null)
                      try {
                        const result = await merchantService.bulkImportInventory(shopId, importFile)
                        setImportResult({
                          success: result.errorCount === 0,
                          message: result.message,
                          successCount: result.successCount,
                          errorCount: result.errorCount,
                          errors: result.errors
                        })
                        if (result.successCount > 0) {
                          showToast(`${result.successCount} carte importate con successo!`, 'success')
                        }
                      } catch (error) {
                        setImportResult({ success: false, message: 'Errore durante l\'import' })
                        showToast('Errore durante l\'import', 'error')
                      } finally {
                        setImportLoading(false)
                        setImportFile(null)
                      }
                    }}
                    disabled={importLoading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {importLoading ? 'Importazione in corso...' : (
                      <span className="flex items-center justify-center gap-2">
                        <ImportIcon className="w-5 h-5" /> Importa Inventario
                      </span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              /* Custom AI Import */
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <CpuChipIcon className="w-5 h-5" /> Import con AI
                  </h3>
                  <p className="text-sm text-purple-800">
                    Carica qualsiasi file (Excel, PDF, foto) e il nostro team lo elaborerà con l'aiuto dell'AI.
                    <br />Riceverai l'inventario aggiornato entro <strong>48 ore</strong>.
                  </p>
                </div>

                {/* Custom File Upload */}
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setImportFile(file)
                    }}
                    className="hidden"
                    id="custom-upload"
                  />
                  <label htmlFor="custom-upload" className="cursor-pointer">
                    {importFile ? (
                      <div className="text-purple-900 flex flex-col items-center">
                        <DocumentIcon className="w-8 h-8 text-purple-400" />
                        <p className="mt-2 font-medium">{importFile.name}</p>
                        <p className="text-sm text-purple-600">Clicca per cambiare file</p>
                      </div>
                    ) : (
                      <div className="text-purple-700 flex flex-col items-center">
                        <CpuChipIcon className="w-10 h-10 text-purple-400" />
                        <p className="mt-2">Carica Excel, PDF, o foto del tuo inventario</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Aggiungi dettagli o istruzioni per l'elaborazione..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                {importFile && (
                  <button
                    onClick={async () => {
                      if (!importFile || !shopId) return
                      setImportLoading(true)
                      setImportResult(null)
                      try {
                        const result = await merchantService.submitCustomImportRequest(shopId, importFile, customNotes)
                        setImportResult({
                          success: true,
                          message: result.message
                        })
                        showToast('Richiesta inviata! Riceverai aggiornamenti via email.', 'success')
                      } catch (error) {
                        setImportResult({ success: false, message: 'Errore durante l\'invio' })
                        showToast('Errore durante l\'invio della richiesta', 'error')
                      } finally {
                        setImportLoading(false)
                        setImportFile(null)
                        setCustomNotes('')
                      }
                    }}
                    disabled={importLoading}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {importLoading ? 'Invio in corso...' : '🚀 Invia Richiesta di Elaborazione'}
                  </button>
                )}
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className={`mt-6 p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                <p className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importResult.success ? '✅' : '❌'} {importResult.message}
                </p>
                {importResult.successCount !== undefined && (
                  <p className="text-sm text-gray-700 mt-1">
                    {importResult.successCount} carte importate, {importResult.errorCount} errori
                  </p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-800">Errori:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...e altri {importResult.errors.length - 5} errori</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : currentView === 'bulk' ? (
          /* Bulk Add Set/Expansion View */
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📦 Aggiungi Set o Espansione Intera</h2>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Come funziona</h3>
              <p className="text-sm text-blue-800">
                Seleziona un TCG, un'espansione e un set per aggiungere tutte le carte con le impostazioni scelte.
                Oppure seleziona solo espansione per aggiungere tutte le carte di tutti i set.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TCG Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.selectedTcgType}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, selectedTcgType: e.target.value, selectedExpansionId: '', selectedSetCode: '' })}
                  >
                    <option value="">Seleziona TCG...</option>
                    {tcgTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Espansione</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.selectedExpansionId}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, selectedExpansionId: e.target.value, selectedSetCode: '' })}
                    disabled={!bulkSettings.selectedTcgType}
                  >
                    <option value="">Seleziona Espansione...</option>
                    {expansions
                      .filter(exp => !bulkSettings.selectedTcgType || exp.tcgType === bulkSettings.selectedTcgType)
                      .map(expansion => (
                        <option key={expansion.id} value={expansion.id}>{expansion.title}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Set (opzionale)</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.selectedSetCode}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, selectedSetCode: e.target.value })}
                    disabled={!bulkSettings.selectedExpansionId}
                  >
                    <option value="">Tutti i set dell'espansione</option>
                    {setCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condizione Default</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.condition}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, condition: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantità Default</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.quantity}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, quantity: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo Default (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.price}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nazionalità</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={bulkSettings.nationality}
                    onChange={(e) => setBulkSettings({ ...bulkSettings, nationality: e.target.value })}
                  >
                    <option value="EN">English</option>
                    <option value="ITA">Italian</option>
                    <option value="JPN">Japanese</option>
                    <option value="COR">Korean</option>
                    <option value="FRA">French</option>
                    <option value="GER">German</option>
                    <option value="SPA">Spanish</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {bulkSettings.selectedSetCode && (
                <button
                  onClick={async () => {
                    if (!shopId || !bulkSettings.selectedSetCode) return
                    setBulkLoading(true)
                    try {
                      const result = await merchantService.bulkAddBySet({
                        shopId: parseInt(shopId),
                        setCode: bulkSettings.selectedSetCode,
                        condition: bulkSettings.condition,
                        quantity: bulkSettings.quantity,
                        price: bulkSettings.price,
                        nationality: bulkSettings.nationality
                      })
                      if (result.successCount > 0) {
                        showToast(`${result.successCount} carte aggiunte dal set ${bulkSettings.selectedSetCode}!`, 'success')
                      } else {
                        showToast(result.message, 'error')
                      }
                      setImportResult({
                        success: result.errorCount === 0,
                        message: result.message,
                        successCount: result.successCount,
                        errorCount: result.errorCount,
                        errors: result.errors
                      })
                    } catch (error) {
                      showToast('Errore durante l\'aggiunta bulk', 'error')
                    } finally {
                      setBulkLoading(false)
                    }
                  }}
                  disabled={bulkLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? 'Aggiunta in corso...' : `📦 Aggiungi Carte del Set ${bulkSettings.selectedSetCode}`}
                </button>
              )}

              {bulkSettings.selectedExpansionId && !bulkSettings.selectedSetCode && (
                <button
                  onClick={async () => {
                    if (!shopId || !bulkSettings.selectedExpansionId) return
                    setBulkLoading(true)
                    try {
                      const result = await merchantService.bulkAddByExpansion({
                        shopId: parseInt(shopId),
                        expansionId: parseInt(bulkSettings.selectedExpansionId),
                        condition: bulkSettings.condition,
                        quantity: bulkSettings.quantity,
                        price: bulkSettings.price,
                        nationality: bulkSettings.nationality
                      })
                      if (result.successCount > 0) {
                        showToast(`${result.successCount} carte aggiunte dall'espansione!`, 'success')
                      } else {
                        showToast(result.message, 'error')
                      }
                      setImportResult({
                        success: result.errorCount === 0,
                        message: result.message,
                        successCount: result.successCount,
                        errorCount: result.errorCount,
                        errors: result.errors
                      })
                    } catch (error) {
                      showToast('Errore durante l\'aggiunta bulk', 'error')
                    } finally {
                      setBulkLoading(false)
                    }
                  }}
                  disabled={bulkLoading}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? 'Aggiunta in corso...' : '📦 Aggiungi Tutte le Carte dell\'Espansione'}
                </button>
              )}

              {!bulkSettings.selectedExpansionId && (
                <p className="text-gray-500 text-center w-full py-4">
                  Seleziona un TCG e un'espansione per continuare
                </p>
              )}
            </div>

            {/* Import Result */}
            {importResult && (
              <div className={`mt-6 p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importResult.success ? '✅' : '❌'} {importResult.message}
                </p>
                {importResult.successCount !== undefined && (
                  <p className="text-sm text-gray-700 mt-1">
                    {importResult.successCount} carte aggiunte, {importResult.errorCount} errori
                  </p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-800">Errori:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside max-h-40 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>...e altri {importResult.errors.length - 10} errori</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

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

      {/* Bulk Add Selected Templates Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📦 Aggiungi {selectedTemplates.size} carte selezionate
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condizione</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkSettings.condition}
                  onChange={(e) => setBulkSettings({ ...bulkSettings, condition: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantità per carta</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkSettings.quantity}
                  onChange={(e) => setBulkSettings({ ...bulkSettings, quantity: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo per carta (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkSettings.price}
                  onChange={(e) => setBulkSettings({ ...bulkSettings, price: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nazionalità</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkSettings.nationality}
                  onChange={(e) => setBulkSettings({ ...bulkSettings, nationality: e.target.value })}
                >
                  <option value="EN">English</option>
                  <option value="ITA">Italian</option>
                  <option value="JPN">Japanese</option>
                  <option value="COR">Korean</option>
                  <option value="FRA">French</option>
                  <option value="GER">German</option>
                  <option value="SPA">Spanish</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowBulkAddModal(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={async () => {
                  if (!shopId || selectedTemplates.size === 0) return
                  setBulkLoading(true)
                  try {
                    const templateIds = Array.from(selectedTemplates).map(id => parseInt(id))
                    const result = await merchantService.bulkAddByTemplates({
                      shopId: parseInt(shopId),
                      templateIds,
                      condition: bulkSettings.condition,
                      quantity: bulkSettings.quantity,
                      price: bulkSettings.price,
                      nationality: bulkSettings.nationality
                    })
                    if (result.successCount > 0) {
                      showToast(`${result.successCount} carte aggiunte all'inventario!`, 'success')
                    } else {
                      showToast(result.message, 'error')
                    }
                    setShowBulkAddModal(false)
                    setSelectedTemplates(new Set())
                  } catch (error) {
                    showToast('Errore durante l\'aggiunta bulk', 'error')
                  } finally {
                    setBulkLoading(false)
                  }
                }}
                disabled={bulkLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {bulkLoading ? 'Aggiunta in corso...' : `Aggiungi ${selectedTemplates.size} carte`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
