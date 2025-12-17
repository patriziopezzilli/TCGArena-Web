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
  { value: 'POKEMON', label: 'Pokémon', icon: <BoltIcon className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'MAGIC', label: 'Magic: The Gathering', icon: <SparklesIcon className="w-6 h-6" />, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', icon: <CardsIcon className="w-6 h-6" />, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'ONE_PIECE', label: 'One Piece', icon: <FireIcon className="w-6 h-6" />, color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'DIGIMON', label: 'Digimon', icon: <CpuChipIcon className="w-6 h-6" />, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'DRAGON_BALL', label: 'Dragon Ball', icon: <StarIcon className="w-6 h-6" />, color: 'bg-amber-100 text-amber-800 border-amber-300' },
]

const SERVICES = [
  { value: 'CARD_SALES', label: 'Vendita Carte', icon: <ShoppingBagIcon className="w-6 h-6" />, description: 'Vendita di singole e sealed product' },
  { value: 'BUY_CARDS', label: 'Acquisto Carte', icon: <BanknotesIcon className="w-6 h-6" />, description: 'Acquisto carte dai clienti' },
  { value: 'TOURNAMENTS', label: 'Tornei', icon: <TournamentIcon className="w-6 h-6" />, description: 'Organizzazione tornei ufficiali e amatoriali' },
  { value: 'PLAY_AREA', label: 'Area Gioco', icon: <PuzzlePieceIcon className="w-6 h-6" />, description: 'Tavoli disponibili per giocare' },
  { value: 'GRADING', label: 'Grading', icon: <StarIcon className="w-6 h-6" />, description: 'Servizio di valutazione e grading' },
  { value: 'ACCESSORIES', label: 'Accessori', icon: <ShoppingBagIcon className="w-6 h-6" />, description: 'Bustine, deck box, playmat, ecc.' },
  { value: 'PREORDERS', label: 'Preordini', icon: <CalendarIcon className="w-6 h-6" />, description: 'Preordini nuovi set' },
  { value: 'ONLINE_STORE', label: 'Store Online', icon: <GlobeAltIcon className="w-6 h-6" />, description: 'Vendita online con spedizione' },
  { value: 'CARD_EVALUATION', label: 'Valutazione Carte', icon: <MagnifyingGlassIcon className="w-6 h-6" />, description: 'Valutazione gratuita collezioni' },
  { value: 'TRADE_IN', label: 'Permuta', icon: <ArrowPathIcon className="w-6 h-6" />, description: 'Permuta carte con store credit' },
]

interface MerchantSettingsProps {
  embedded?: boolean
}

export default function MerchantSettings({ embedded = false }: MerchantSettingsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  // Cleanup geocoding timeout on unmount
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

      // Parse tcgTypes and services from comma-separated strings
      const tcgTypesArray = status.shop.tcgTypes
        ? status.shop.tcgTypes.split(',').filter((t: string) => t.trim())
        : []
      const servicesArray = status.shop.services
        ? status.shop.services.split(',').filter((s: string) => s.trim())
        : []

      // Initialize default opening hours if not present
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

      // Load reservation settings
      try {
        const reservationSettingsData = await merchantService.getReservationSettings(status.shop.id)
        setReservationSettings(reservationSettingsData)
      } catch (error) {
        console.warn('Could not load reservation settings, using defaults:', error)
        // Keep default values
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
      // Convert file to base64
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Seleziona un file immagine valido', 'warning')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('La foto deve essere inferiore a 5MB', 'warning')
        return
      }
      handlePhotoUpload(file)
    }
  }

  const geocodeAddress = useCallback(async (address: string) => {
    if (!address || address.trim() === '') {
      return
    }

    try {
      // Usa Nominatim (OpenStreetMap) per il geocoding - gratuito e senza API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=IT`
      )

      if (!response.ok) {
        throw new Error('Errore nella richiesta di geocoding')
      }

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
      // Silent error handling - no toast for automatic geocoding
    }
  }, [])

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Trigger geocoding with debounce when address changes and seems complete
    if (field === 'address' && value && value.trim().length > 8) {
      // Check if address seems complete (has comma or number)
      const hasComma = value.includes(',')
      const hasNumber = /\d+/.test(value)

      if (hasComma || hasNumber) {
        if (geocodingTimeoutRef.current) {
          clearTimeout(geocodingTimeoutRef.current)
        }
        geocodingTimeoutRef.current = setTimeout(() => {
          geocodeAddress(value)
        }, 1000) // Wait 1 second after user stops typing
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
      showToast('Impostazioni prenotazioni salvate con successo!', 'success')
    } catch (error: any) {
      showToast('Errore nel salvataggio: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  const userData = getMerchantUserData()

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

  const content = (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="PHYSICAL_STORE">Negozio Fisico</option>
                <option value="ONLINE_STORE">Negozio Online</option>
                <option value="HYBRID">Ibrido (Fisico + Online)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shop Photo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto del Negozio</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto negozio"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Carica una foto del tuo negozio. La foto verrà mostrata agli utenti nell'app mobile.
                </p>
                <div className="flex gap-3">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {uploadingPhoto ? 'Caricamento...' : 'Carica Foto'}
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
                      onClick={() => {
                        setPhotoPreview(null)
                        // TODO: Add endpoint to delete photo
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formati supportati: JPG, PNG, GIF. Dimensione massima: 5MB.
                </p>
              </div>
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
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${isSelected
                    ? `${tcg.color} border-current`
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-gray-600">{tcg.icon}</span>
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
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-gray-600">{service.icon}</span>
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
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Via Roma 123, Milano"
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
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
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
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-sm">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <strong>Coordinate automatiche:</strong> I campi latitudine e longitudine vengono popolati automaticamente quando inserisci un indirizzo completo. Non è necessario modificarli manualmente.
                </div>
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
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
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
                onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
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
                onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
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
                onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orari di Apertura</h2>
          <OpeningHoursForm
            value={formData.openingHoursStructured!}
            onChange={(hours) => handleInputChange('openingHoursStructured', hours)}
          />
        </div>

        {/* Reservation Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Impostazioni Prenotazioni</h2>
          <p className="text-sm text-gray-500 mb-4">Configura la durata delle prenotazioni per il tuo negozio</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Prenotazione (minuti) *
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                required
                value={reservationSettings.reservationDurationMinutes}
                onChange={(e) => setReservationSettings(prev => ({
                  ...prev,
                  reservationDurationMinutes: parseInt(e.target.value) || 30
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Durata massima: 24 ore (1440 minuti). Default: {reservationSettings.defaultDurationMinutes} minuti.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-sm">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <strong>Come funziona:</strong> Quando un cliente prenota una carta, avrà questo tempo per completare il ritiro prima che la prenotazione scada automaticamente.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReservationSettingsSubmit}
              disabled={saving}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${saving
                ? 'bg-blue-300 text-blue-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {saving ? 'Salvataggio...' : 'Salva Impostazioni Prenotazioni'}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
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
              }`}
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </>
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
