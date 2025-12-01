import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'

interface InventoryCard {
  id: string
  shopId: string
  cardId: string
  cardName: string
  tcgType: string
  setName: string
  rarity: string
  condition: 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'LIGHT_PLAYED' | 'PLAYED' | 'POOR'
  quantity: number
  price: number
  inStock: boolean
  imageUrl?: string
}

interface InventoryFilters {
  tcgType?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  searchQuery?: string
}

export default function MerchantInventory() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryCard[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCard, setEditingCard] = useState<InventoryCard | null>(null)
  const [shopId, setShopId] = useState<string>('')
  
  // Form state
  const [formData, setFormData] = useState({
    cardId: '',
    cardName: '',
    tcgType: 'POKEMON',
    setName: '',
    rarity: 'COMMON',
    condition: 'NEAR_MINT',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    const user = localStorage.getItem('merchant_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.shopId) {
        setShopId(userData.shopId)
        loadInventory(userData.shopId)
      }
    }
  }, [])

  const loadInventory = async (shopId: string, customFilters?: InventoryFilters) => {
    try {
      setLoading(true)
      const data = await merchantService.getInventory(shopId, customFilters || filters)
      setInventory(data.cards || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await merchantService.createInventoryCard({ ...formData, shopId })
      setShowAddModal(false)
      resetForm()
      loadInventory(shopId)
    } catch (error) {
      console.error('Error adding card:', error)
      alert('Errore durante l\'aggiunta della carta')
    }
  }

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCard) return
    
    try {
      await merchantService.updateInventoryCard(editingCard.id, formData)
      setEditingCard(null)
      resetForm()
      loadInventory(shopId)
    } catch (error) {
      console.error('Error updating card:', error)
      alert('Errore durante l\'aggiornamento della carta')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa carta?')) return
    
    try {
      await merchantService.deleteInventoryCard(cardId)
      loadInventory(shopId)
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Errore durante l\'eliminazione della carta')
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
      price: 0
    })
  }

  const openEditModal = (card: InventoryCard) => {
    setEditingCard(card)
    setFormData({
      cardId: card.cardId,
      cardName: card.cardName,
      tcgType: card.tcgType,
      setName: card.setName,
      rarity: card.rarity,
      condition: card.condition,
      quantity: card.quantity,
      price: card.price
    })
  }

  const applyFilters = () => {
    loadInventory(shopId, filters)
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Aggiungi Carta
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtri</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Cerca per nome..."
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.tcgType || ''}
              onChange={(e) => setFilters({ ...filters, tcgType: e.target.value })}
            >
              <option value="">Tutti i TCG</option>
              <option value="POKEMON">Pokémon</option>
              <option value="ONEPIECE">One Piece</option>
              <option value="MAGIC">Magic</option>
              <option value="YUGIOH">Yu-Gi-Oh!</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.condition || ''}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
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
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
            />
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Applica Filtri
            </button>
          </div>
        </div>

        {/* Inventory List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nessuna carta in inventario</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary hover:underline"
            >
              Aggiungi la prima carta
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
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl}
                        alt={card.cardName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.cardName}</h3>
                      <p className="text-sm text-gray-600">
                        {card.tcgType} • {card.setName} • {card.rarity}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Condizione: {card.condition} • Quantità: {card.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">€{card.price.toFixed(2)}</p>
                      <p className={`text-sm ${card.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {card.inStock ? '✓ Disponibile' : '✗ Esaurito'}
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
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCard) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingCard ? 'Modifica Carta' : 'Aggiungi Carta'}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TCG
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.tcgType}
                    onChange={(e) => setFormData({ ...formData, tcgType: e.target.value })}
                  >
                    <option value="POKEMON">Pokémon</option>
                    <option value="ONEPIECE">One Piece</option>
                    <option value="MAGIC">Magic</option>
                    <option value="YUGIOH">Yu-Gi-Oh!</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.setName}
                    onChange={(e) => setFormData({ ...formData, setName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rarità
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                  >
                    <option value="COMMON">Common</option>
                    <option value="UNCOMMON">Uncommon</option>
                    <option value="RARE">Rare</option>
                    <option value="ULTRA_RARE">Ultra Rare</option>
                    <option value="SECRET_RARE">Secret Rare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condizione
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
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
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCard(null)
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
