import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { merchantService } from '../services/api'

export default function MerchantRegister() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        description: '',
        address: '',
        city: '',
        zipCode: '',
        phone: '',
        existingShopId: null as number | null
    })

    // Search state
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    // Debounce search on shopName
    useEffect(() => {
        // Only search if we don't have a linked shop yet
        if (formData.existingShopId) return

        const timer = setTimeout(async () => {
            if (formData.shopName.length >= 3) {
                setSearching(true)
                try {
                    const results = await merchantService.searchUnverifiedShops(formData.shopName)
                    setSearchResults(results)
                    setShowSuggestions(true)
                } catch (err) {
                    console.error('Search failed', err)
                } finally {
                    setSearching(false)
                }
            } else {
                setSearchResults([])
                setShowSuggestions(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.shopName, formData.existingShopId])

    const handleShopSelect = (shop: any) => {
        setFormData({
            ...formData,
            existingShopId: shop.id,
            shopName: shop.name,
            description: shop.description || '',
            address: shop.address || '',
            city: '',
            zipCode: '',
            phone: shop.phoneNumber || ''
        })
        setSearchResults([])
        setShowSuggestions(false)
    }

    const handleClearLinkedShop = () => {
        setFormData({
            ...formData,
            existingShopId: null,
            shopName: '',
            description: '',
            address: '',
            city: '',
            zipCode: '',
            phone: ''
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Le password non coincidono')
            return
        }

        setLoading(true)

        try {
            const { confirmPassword, ...dataToSend } = formData
            await merchantService.register({
                ...dataToSend,
                displayName: formData.username
            })

            // Navigate to login or auto-login (usually redirect to login)
            navigate('/merchant/login')
        } catch (err: any) {
            setError(err.response?.data || 'Errore durante la registrazione. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

            <div className="max-w-2xl w-full relative animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="group inline-block">
                        <h1 className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
                            TCG Arena
                        </h1>
                        <div className="h-1 bg-gray-900 rounded-full mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrazione Merchant</h2>
                        <p className="text-sm text-gray-600">
                            Crea il tuo account e gestisci il tuo negozio
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-shake">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Shop Info Section */}
                    <div className="space-y-5 pt-2">
                        {/* Removed Toggle Claim Mode */}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User Info Section */}
                        <div className="space-y-5 border-b border-gray-100 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Dati Account</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField
                                    id="username" label="Username" value={formData.username}
                                    onChange={(val: string) => setFormData({ ...formData, username: val })}
                                    focused={focusedField === 'username'} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                                />
                                <InputField
                                    id="email" label="Email" type="email" value={formData.email}
                                    onChange={(val: string) => setFormData({ ...formData, email: val })}
                                    focused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField
                                    id="password" label="Password" type="password" value={formData.password}
                                    onChange={(val: string) => setFormData({ ...formData, password: val })}
                                    focused={focusedField === 'password'} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                />
                                <InputField
                                    id="confirmPassword" label="Conferma Password" type="password" value={formData.confirmPassword}
                                    onChange={(val: string) => setFormData({ ...formData, confirmPassword: val })}
                                    focused={focusedField === 'confirmPassword'} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </div>

                        {/* Shop Info Section */}
                        <div className="space-y-5 pt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Dettagli Negozio</h3>
                                {formData.existingShopId && (
                                    <button
                                        type="button"
                                        onClick={handleClearLinkedShop}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                    >
                                        Scollega attività
                                    </button>
                                )}
                            </div>

                            <div className="relative">
                                <InputField
                                    id="shopName"
                                    label={formData.existingShopId ? "Negozio Collegato" : "Nome Negozio (Inizia a digitare per cercare)"}
                                    value={formData.shopName}
                                    onChange={(val: string) => {
                                        setFormData({ ...formData, shopName: val })
                                        if (val.length < 3) setShowSuggestions(false)
                                    }}
                                    focused={focusedField === 'shopName'}
                                    onFocus={() => setFocusedField('shopName')}
                                    onBlur={() => {
                                        setFocusedField(null)
                                        // Delay hiding suggestions to allow clicking
                                        setTimeout(() => setShowSuggestions(false), 200)
                                    }}
                                    disabled={!!formData.existingShopId}
                                />

                                {searching && (
                                    <div className="absolute right-4 top-[2.4rem] transform -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {showSuggestions && searchResults.length > 0 && !formData.existingShopId && (
                                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                                        <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Attività trovate
                                        </div>
                                        {searchResults.map((shop) => (
                                            <button
                                                key={shop.id}
                                                type="button"
                                                onClick={() => handleShopSelect(shop)}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <div className="font-semibold text-gray-900">{shop.name}</div>
                                                <div className="text-sm text-gray-500">{shop.address}</div>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setShowSuggestions(false)}
                                            className="w-full text-center px-4 py-2 bg-gray-50 text-gray-500 text-sm hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                        >
                                            Non è il tuo negozio? Continua a compilare
                                        </button>
                                    </div>
                                )}
                            </div>
                            <InputField
                                id="description" label="Descrizione (Opzionale)" value={formData.description}
                                onChange={(val: string) => setFormData({ ...formData, description: val })}
                                focused={focusedField === 'description'} onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)}
                            />
                            <InputField
                                id="address" label="Indirizzo" value={formData.address}
                                onChange={(val: string) => setFormData({ ...formData, address: val })}
                                focused={focusedField === 'address'} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)}
                                disabled={!!formData.existingShopId}
                            />
                            <div className="grid grid-cols-2 gap-5">
                                <InputField
                                    id="city" label="Città" value={formData.city}
                                    onChange={(val: string) => setFormData({ ...formData, city: val })}
                                    focused={focusedField === 'city'} onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)}
                                    disabled={!!formData.existingShopId}
                                />
                                <InputField
                                    id="zipCode" label="CAP" value={formData.zipCode}
                                    onChange={(val: string) => setFormData({ ...formData, zipCode: val })}
                                    focused={focusedField === 'zipCode'} onFocus={() => setFocusedField('zipCode')} onBlur={() => setFocusedField(null)}
                                    disabled={!!formData.existingShopId}
                                />
                            </div>
                            <InputField
                                id="phone" label="Telefono" value={formData.phone}
                                onChange={(val: string) => setFormData({ ...formData, phone: val })}
                                focused={focusedField === 'phone'} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full py-4 px-4 bg-gray-900 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Registrazione...
                                    </>
                                ) : (
                                    <>
                                        Registrati
                                        <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Hai già un account?{' '}
                            <Link
                                to="/merchant/login"
                                className="font-semibold text-gray-900 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                            >
                                Accedi
                                <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                        <span className="transform transition-transform duration-200 group-hover:-translate-x-1">←</span>
                        Torna alla homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}

function InputField({ id, label, type = 'text', value, onChange, focused, onFocus, onBlur, disabled = false }: any) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className={`block text-sm font-medium transition-colors duration-200 ${focused ? 'text-gray-900' : 'text-gray-600'}`}
            >
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl transition-all duration-300 outline-none placeholder:text-gray-400
                    ${focused ? 'bg-white border-gray-900' : 'border-gray-100'}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                    required={!label.includes('Opzionale')}
                />
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${focused ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>
    )
}
