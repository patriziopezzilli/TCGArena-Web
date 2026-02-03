import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { OpeningHoursForm, OpeningHours } from '../components/OpeningHoursForm'
import DashboardLayout from '../components/DashboardLayout'
import { merchantMenuItems, getMerchantUserData } from '../constants/merchantMenu'
import {
  BoltIcon, SparklesIcon, CardsIcon, FireIcon, CpuChipIcon, StarIcon,
  ShoppingBagIcon, BanknotesIcon, TournamentIcon, PuzzlePieceIcon,
  CalendarIcon, GlobeAltIcon, MagnifyingGlassIcon, ArrowPathIcon
} from '../components/Icons'

const TCG_TYPES = [
  { value: 'POKEMON', label: 'Pokémon', icon: <BoltIcon className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'MAGIC', label: 'Magic: The Gathering', icon: <SparklesIcon className="w-5 h-5" />, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', icon: <CardsIcon className="w-5 h-5" />, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'ONE_PIECE', label: 'One Piece', icon: <FireIcon className="w-5 h-5" />, color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'DIGIMON', label: 'Digimon', icon: <CpuChipIcon className="w-5 h-5" />, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'RIFTBOUND', label: 'Riftbound: League of Legends', icon: <StarIcon className="w-5 h-5" />, color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { value: 'LORCANA', label: 'Disney Lorcana', icon: <SparklesIcon className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'DRAGON_BALL_SUPER_FUSION_WORLD', label: 'Dragon Ball Super Fusion World', icon: <FireIcon className="w-5 h-5" />, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'FLESH_AND_BLOOD', label: 'Flesh and Blood', icon: <CardsIcon className="w-5 h-5" />, color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'UNION_ARENA', label: 'Union Arena', icon: <CardsIcon className="w-5 h-5" />, color: 'bg-amber-100 text-amber-800 border-amber-300' },
]

const SERVICES = [
  { value: 'CARD_SALES', label: 'Vendita Carte', icon: <ShoppingBagIcon className="w-5 h-5" />, description: 'Vendita di singole e sealed product' },
  { value: 'BUY_CARDS', label: 'Acquisto Carte', icon: <BanknotesIcon className="w-5 h-5" />, description: 'Acquisto carte dai clienti' },
  { value: 'TOURNAMENTS', label: 'Tornei', icon: <TournamentIcon className="w-5 h-5" />, description: 'Organizzazione tornei' },
  { value: 'PLAY_AREA', label: 'Area Gioco', icon: <PuzzlePieceIcon className="w-5 h-5" />, description: 'Tavoli disponibili' },
  { value: 'GRADING', label: 'Grading', icon: <StarIcon className="w-5 h-5" />, description: 'Valutazione e grading' },
  { value: 'ACCESSORIES', label: 'Accessori', icon: <ShoppingBagIcon className="w-5 h-5" />, description: 'Bustine, deck box, playmat' },
  { value: 'PREORDERS', label: 'Preordini', icon: <CalendarIcon className="w-5 h-5" />, description: 'Preordini nuovi set' },
  { value: 'ONLINE_STORE', label: 'Store Online', icon: <GlobeAltIcon className="w-5 h-5" />, description: 'Vendita online' },
  { value: 'CARD_EVALUATION', label: 'Valutazione', icon: <MagnifyingGlassIcon className="w-5 h-5" />, description: 'Valutazione collezioni' },
  { value: 'TRADE_IN', label: 'Permuta', icon: <ArrowPathIcon className="w-5 h-5" />, description: 'Permuta con store credit' },
]

type TabType = 'profile' | 'services' | 'location' | 'settings'

const TABS: { id: TabType; label: string }[] = [
  { id: 'profile', label: 'Profilo' },
  { id: 'services', label: 'Servizi' },
  { id: 'location', label: 'Posizione' },
  { id: 'settings', label: 'Impostazioni' },
]

interface MerchantSettingsProps {
  embedded?: boolean
}

export default function MerchantSettings({ embedded = false }: MerchantSettingsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const geocodingTimeoutRef = useRef<number | null>(null)
  const [reservationSettings, setReservationSettings] = useState({
    reservationDurationMinutes: 30,
    defaultDurationMinutes: 30,
  })
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
    openingHoursStructured: null as OpeningHours | null,
    type: 'PHYSICAL_STORE',
    tcgTypes: [] as string[],
    services: [] as string[],
  })

  useEffect(() => {
    loadShopData()
  }, [])

  useEffect(() => {
    return () => {
      if (geocodingTimeoutRef.current) {
        clearTimeout(geocodingTimeoutRef.current)
      }
    }
  }, [])

  const loadShopData = async () => {
    try {
      const status = await merchantService.getShopStatus()
      setPhotoPreview(status.shop.photoBase64 || null)

      const tcgTypesArray = status.shop.tcgTypes
        ? status.shop.tcgTypes.split(',').filter((t: string) => t.trim())
        : []
      const servicesArray = status.shop.services
        ? status.shop.services.split(',').filter((s: string) => s.trim())
        : []

      const defaultHours: OpeningHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { closed: true },
      }

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
        openingHoursStructured: status.shop.openingHoursStructured || defaultHours,
        type: status.shop.type || 'PHYSICAL_STORE',
        tcgTypes: tcgTypesArray,
        services: servicesArray,
      })

      try {
        const reservationSettingsData = await merchantService.getReservationSettings(status.shop.id)
        setReservationSettings(reservationSettingsData)
      } catch (error) {
        console.warn('Could not load reservation settings, using defaults:', error)
      }
    } catch (err) {
      showToast('Errore nel caricamento dei dati', 'error')
      navigate('/merchant/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      await merchantService.uploadShopPhoto(base64)
      setPhotoPreview(base64)
      showToast('Foto caricata con successo!', 'success')
    } catch (error: any) {
      showToast('Errore nel caricamento della foto: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Seleziona un file immagine valido', 'warning')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('La foto deve essere inferiore a 5MB', 'warning')
        return
      }
      handlePhotoUpload(file)
    }
  }

  const geocodeAddress = useCallback(async (address: string) => {
    if (!address || address.trim() === '') return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=IT`
      )

      if (!response.ok) throw new Error('Errore nella richiesta di geocoding')

      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }))
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }, [])

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (field === 'address' && value && value.trim().length > 8) {
      const hasComma = value.includes(',')
      const hasNumber = /\d+/.test(value)

      if (hasComma || hasNumber) {
        if (geocodingTimeoutRef.current) {
          clearTimeout(geocodingTimeoutRef.current)
        }
        geocodingTimeoutRef.current = setTimeout(() => {
          geocodeAddress(value)
        }, 1000)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await merchantService.updateShop({
        ...formData,
        tcgTypes: formData.tcgTypes.join(','),
        services: formData.services.join(','),
      })
      showToast('Impostazioni salvate con successo!', 'success')
      navigate('/merchant/dashboard')
    } catch (error: any) {
      showToast('Errore nel salvataggio: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReservationSettingsSubmit = async () => {
    setSaving(true)
    try {
      const status = await merchantService.getShopStatus()
      await merchantService.updateReservationSettings(status.shop.id, {
        reservationDurationMinutes: reservationSettings.reservationDurationMinutes
      })
      showToast('Impostazioni prenotazioni salvate!', 'success')
    } catch (error: any) {
      showToast('Errore nel salvataggio: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  const userData = getMerchantUserData()

  // ========== LOADING STATE ==========

  if (loading) {
    if (embedded) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      )
    }
    return (
      <DashboardLayout
        title="Impostazioni"
        subtitle="Caricamento..."
        menuItems={merchantMenuItems}
        userName={userData?.displayName || userData?.username}
        shopName={userData?.shopName}
      >
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  // ========== MAIN CONTENT ==========

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5">
        <div className="flex overflow-x-auto scrollbar-hide gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-1 text-center min-w-0 ${activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                } `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && <ProfileTab
          formData={formData}
          handleInputChange={handleInputChange}
          photoPreview={photoPreview}
          uploadingPhoto={uploadingPhoto}
          handleFileChange={handleFileChange}
          setPhotoPreview={setPhotoPreview}
        />}
        {activeTab === 'services' && <ServicesTab
          formData={formData}
          setFormData={setFormData}
        />}
        {activeTab === 'location' && <LocationTab
          formData={formData}
          handleInputChange={handleInputChange}
        />}
        {activeTab === 'settings' && <SettingsTab
          formData={formData}
          handleInputChange={handleInputChange}
          reservationSettings={reservationSettings}
          setReservationSettings={setReservationSettings}
          handleReservationSettingsSubmit={handleReservationSettingsSubmit}
          saving={saving}
        />}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/merchant/dashboard')}
          className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
            } `}
        >
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </form>
  )

  if (embedded) {
    return content
  }

  return (
    <DashboardLayout
      title="Impostazioni"
      subtitle="Gestisci le informazioni del tuo negozio"
      menuItems={merchantMenuItems}
      userName={userData?.displayName || userData?.username}
      shopName={userData?.shopName}
    >
      {content}
    </DashboardLayout>
  )
}

// ========== EXTRACTED TAB COMPONENTS ==========

const ProfileTab = ({ formData, handleInputChange, photoPreview, uploadingPhoto, handleFileChange, setPhotoPreview }: any) => (
  <div className="space-y-6">
    {/* Basic Info */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Informazioni di Base</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Negozio *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow resize-none"
            placeholder="Descrivi brevemente il tuo negozio..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Negozio *</label>
          <select
            required
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
          >
            <option value="PHYSICAL_STORE">Negozio Fisico</option>
            <option value="ONLINE_STORE">Negozio Online</option>
            <option value="HYBRID">Ibrido (Fisico + Online)</option>
          </select>
        </div>
      </div>
    </div>

    {/* Shop Photo */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Foto del Negozio</h3>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Foto negozio"
              className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-3">
            Questa foto verrà mostrata agli utenti nell'app.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {uploadingPhoto ? 'Caricamento...' : 'Carica'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                Rimuovi
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF • Max 5MB</p>
        </div>
      </div>
    </div>
  </div>
)

const ServicesTab = ({ formData, setFormData }: any) => (
  <div className="space-y-6">
    {/* TCG Types */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Giochi Supportati</h3>
      <p className="text-sm text-gray-500 mb-4">Seleziona i TCG che tratti nel tuo negozio</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TCG_TYPES.map((tcg) => {
          const isSelected = formData.tcgTypes.includes(tcg.value)
          return (
            <button
              key={tcg.value}
              type="button"
              onClick={() => {
                const newTypes = isSelected
                  ? formData.tcgTypes.filter((t: string) => t !== tcg.value)
                  : [...formData.tcgTypes, tcg.value]
                setFormData({ ...formData, tcgTypes: newTypes })
              }}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${isSelected
                  ? `${tcg.color} border-current`
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } `}
            >
              <span className="text-gray-600 flex-shrink-0">{tcg.icon}</span>
              <span className={`font-medium text-sm truncate ${isSelected ? '' : 'text-gray-700'} `}>
                {tcg.label}
              </span>
              {isSelected && (
                <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>

    {/* Services */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Servizi Offerti</h3>
      <p className="text-sm text-gray-500 mb-4">Indica quali servizi offri ai tuoi clienti</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {SERVICES.map((service) => {
          const isSelected = formData.services.includes(service.value)
          return (
            <button
              key={service.value}
              type="button"
              onClick={() => {
                const newServices = isSelected
                  ? formData.services.filter((s: string) => s !== service.value)
                  : [...formData.services, service.value]
                setFormData({ ...formData, services: newServices })
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-center transition-all ${isSelected
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
                } `}
            >
              <span className={isSelected ? 'text-white' : 'text-gray-500'}>{service.icon}</span>
              <span className="font-medium text-xs">{service.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  </div>
)

const LocationTab = ({ formData, handleInputChange }: any) => (
  <div className="space-y-6">
    {/* Address */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Indirizzo</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Completo *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
            placeholder="Via Roma 123, Milano"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lat</label>
            <input
              type="number"
              step="any"
              value={formData.latitude || ''}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long</label>
            <input
              type="number"
              step="any"
              value={formData.longitude || ''}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Le coordinate vengono calcolate automaticamente dall'indirizzo.</span>
        </div>
      </div>
    </div>

    {/* Opening Hours */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <OpeningHoursForm
        value={formData.openingHoursStructured!}
        onChange={(hours: any) => handleInputChange('openingHoursStructured', hours)}
      />
    </div>
  </div>
)

const SettingsTab = ({ formData, handleInputChange, reservationSettings, setReservationSettings, handleReservationSettingsSubmit, saving }: any) => (
  <div className="space-y-6">
    {/* Contacts */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Contatti</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="+39 ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="negozio@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sito Web</label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>

    {/* Social Media */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Social Media</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input
            type="url"
            value={formData.instagramUrl}
            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="@username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input
            type="url"
            value={formData.facebookUrl}
            onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="pagina"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
          <input
            type="url"
            value={formData.twitterUrl}
            onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="@username"
          />
        </div>
      </div>
    </div>

    {/* Reservation Settings */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Prenotazioni</h3>
      <p className="text-sm text-gray-500 mb-4">Configura la durata delle prenotazioni carte</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durata (minuti)</label>
          <input
            type="number"
            min="1"
            max="1440"
            value={reservationSettings.reservationDurationMinutes}
            onChange={(e) => setReservationSettings((prev: any) => ({
              ...prev,
              reservationDurationMinutes: parseInt(e.target.value) || 30
            }))}
            className="w-full max-w-xs px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tempo per completare il ritiro (default: {reservationSettings.defaultDurationMinutes} min)
          </p>
        </div>
        <button
          type="button"
          onClick={handleReservationSettingsSubmit}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${saving
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } `}
        >
          {saving ? 'Salvataggio...' : 'Salva Prenotazioni'}
        </button>
      </div>
    </div>
  </div>
)
