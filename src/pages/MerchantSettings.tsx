import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService, adminService } from '../services/api'

const TCG_TYPES = [
  { value: 'POKEMON', label: 'Pokémon', icon: '⚡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'MAGIC', label: 'Magic: The Gathering', icon: '🔮', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', icon: '🎴', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'ONE_PIECE', label: 'One Piece', icon: '🏴‍☠️', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'DIGIMON', label: 'Digimon', icon: '🦖', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'DRAGON_BALL', label: 'Dragon Ball', icon: '🐉', color: 'bg-amber-100 text-amber-800 border-amber-300' },
]

const SERVICES = [
  { value: 'CARD_SALES', label: 'Vendita Carte', icon: '🛒', description: 'Vendita di singole e sealed product' },
  { value: 'BUY_CARDS', label: 'Acquisto Carte', icon: '💰', description: 'Acquisto carte dai clienti' },
  { value: 'TOURNAMENTS', label: 'Tornei', icon: '🏆', description: 'Organizzazione tornei ufficiali e amatoriali' },
  { value: 'PLAY_AREA', label: 'Area Gioco', icon: '🎮', description: 'Tavoli disponibili per giocare' },
  { value: 'GRADING', label: 'Grading', icon: '⭐', description: 'Servizio di valutazione e grading' },
  { value: 'ACCESSORIES', label: 'Accessori', icon: '🎒', description: 'Bustine, deck box, playmat, ecc.' },
  { value: 'PREORDERS', label: 'Preordini', icon: '📅', description: 'Preordini nuovi set' },
  { value: 'ONLINE_STORE', label: 'Store Online', icon: '🌐', description: 'Vendita online con spedizione' },
  { value: 'CARD_EVALUATION', label: 'Valutazione Carte', icon: '🔍', description: 'Valutazione gratuita collezioni' },
  { value: 'TRADE_IN', label: 'Permuta', icon: '🔄', description: 'Permuta carte con store credit' },
]

export default function MerchantSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    phoneNumber: '',
    email: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    openingHours: '',
    openingDays: '',
    type: 'PHYSICAL_STORE',
    tcgTypes: [] as string[],
    services: [] as string[],
  })

  useEffect(() => {
    loadShopData()
  }, [])

  const loadShopData = async () => {
    try {
      const status = await merchantService.getShopStatus()
      setShop(status.shop)
      
      // Parse tcgTypes and services from comma-separated strings
      const tcgTypesArray = status.shop.tcgTypes 
        ? status.shop.tcgTypes.split(',').filter((t: string) => t.trim()) 
        : []
      const servicesArray = status.shop.services 
        ? status.shop.services.split(',').filter((s: string) => s.trim()) 
        : []
      
      setFormData({
        name: status.shop.name || '',
        description: status.shop.description || '',
        address: status.shop.address || '',
        latitude: status.shop.latitude || null,
        longitude: status.shop.longitude || null,
        phoneNumber: status.shop.phoneNumber || '',
        email: status.shop.email || '',
        websiteUrl: status.shop.websiteUrl || '',
        instagramUrl: status.shop.instagramUrl || '',
        facebookUrl: status.shop.facebookUrl || '',
        twitterUrl: status.shop.twitterUrl || '',
        openingHours: status.shop.openingHours || '',
        openingDays: status.shop.openingDays || '',
        type: status.shop.type || 'PHYSICAL_STORE',
        tcgTypes: tcgTypesArray,
        services: servicesArray,
      })
    } catch (err) {
      alert('Errore nel caricamento dei dati')
      navigate('/merchant/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Convert arrays to comma-separated strings for backend
      const payload = {
        ...formData,
        tcgTypes: formData.tcgTypes.join(','),
        services: formData.services.join(','),
      }
      await adminService.updateShop(shop.id, payload)
      alert('✅ Negozio aggiornato con successo!')
      loadShopData()
    } catch (err: any) {
      alert('Errore: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/merchant/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Indietro
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Impostazioni Negozio</h1>
              <p className="text-sm text-gray-600 mt-1">Gestisci le informazioni del tuo negozio</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni di Base</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Negozio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Descrivi il tuo negozio..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Negozio *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="PHYSICAL_STORE">Negozio Fisico</option>
                  <option value="ONLINE_STORE">Negozio Online</option>
                  <option value="HYBRID">Ibrido (Fisico + Online)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TCG Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Giochi Supportati</h2>
            <p className="text-sm text-gray-500 mb-4">Seleziona i TCG che vendi o supporti nel tuo negozio</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TCG_TYPES.map((tcg) => {
                const isSelected = formData.tcgTypes.includes(tcg.value)
                return (
                  <button
                    key={tcg.value}
                    type="button"
                    onClick={() => {
                      const newTypes = isSelected
                        ? formData.tcgTypes.filter(t => t !== tcg.value)
                        : [...formData.tcgTypes, tcg.value]
                      setFormData({ ...formData, tcgTypes: newTypes })
                    }}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${tcg.color} border-current`
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{tcg.icon}</span>
                    <span className={`font-medium ${isSelected ? '' : 'text-gray-700'}`}>{tcg.label}</span>
                    {isSelected && (
                      <span className="ml-auto">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Servizi Offerti</h2>
            <p className="text-sm text-gray-500 mb-4">Indica quali servizi offri ai tuoi clienti</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICES.map((service) => {
                const isSelected = formData.services.includes(service.value)
                return (
                  <button
                    key={service.value}
                    type="button"
                    onClick={() => {
                      const newServices = isSelected
                        ? formData.services.filter(s => s !== service.value)
                        : [...formData.services, service.value]
                      setFormData({ ...formData, services: newServices })
                    }}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{service.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium block ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {service.label}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {service.description}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posizione</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Via, Città, CAP"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitudine
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="es. 45.4642"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitudine
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="es. 9.1900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contatti</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="+39 ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="negozio@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sito Web
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter / X
                </label>
                <input
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orari di Apertura</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orario
                  <span className="text-xs text-gray-500 ml-2">(es. 9:00-13:00, 15:00-19:00)</span>
                </label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="9:00-13:00, 15:00-19:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giorni
                  <span className="text-xs text-gray-500 ml-2">(es. Lun-Ven, Sab)</span>
                </label>
                <input
                  type="text"
                  value={formData.openingDays}
                  onChange={(e) => setFormData({ ...formData, openingDays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Lun-Ven, Sab"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/merchant/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
