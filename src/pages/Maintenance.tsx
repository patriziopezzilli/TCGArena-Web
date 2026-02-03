import { useState, useEffect } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { ImportIcon } from '../components/Icons'

export default function Maintenance() {
    const { showToast } = useToast()
    const [status, setStatus] = useState<string>('Idle')
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({ tcgType: '', year: '' })

    const checkStatus = async () => {
        try {
            const res = await adminService.getSyncStatus()
            setStatus(res)
        } catch (err) {
            console.error('Failed to get status', err)
        }
    }

    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleSync = async () => {
        if (!confirm('Questo avvierà il download di tutte le immagini mancanti sul server. Continuare?')) return

        setLoading(true)
        try {
            await adminService.syncImages({
                tcgType: filters.tcgType || undefined,
                year: filters.year ? parseInt(filters.year) : undefined
            })
            showToast('Sincronizzazione avviata in background', 'success')
            checkStatus()
        } catch (err: any) {
            showToast('Errore durante l\'avvio della sincronizzazione: ' + (err.response?.data?.message || err.message), 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImportIcon className="w-5 h-5 text-gray-500" />
                    Gestione Immagini Carte
                </h3>

                <p className="text-gray-600 mb-6">
                    Scarica localmente le immagini delle carte dai server esterni per abilitare la ricerca visuale e migliorare le performance.
                    Questo processo può richiedere molto tempo se ci sono molte immagini mancanti.
                </p>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Filtri Opzionali</p>
                            <div className="flex gap-3 mt-2">
                                <select
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900"
                                    value={filters.tcgType}
                                    onChange={(e) => setFilters({ ...filters, tcgType: e.target.value })}
                                >
                                    <option value="">Tutti i TCG</option>
                                    <option value="POKEMON">Pokémon</option>
                                    <option value="ONE_PIECE">One Piece</option>
                                    <option value="MAGIC">Magic: The Gathering</option>
                                    <option value="YUGIOH">Yu-Gi-Oh!</option>
                                    <option value="DIGIMON">Digimon</option>
                                    <option value="LORCANA">Disney Lorcana</option>
                                    <option value="RIFTBOUND">Riftbound</option>
                                    <option value="DRAGON_BALL_SUPER_FUSION_WORLD">Dragon Ball Super Fusion World</option>
                                    <option value="FLESH_AND_BLOOD">Flesh and Blood</option>
                                    <option value="UNION_ARENA">Union Arena</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Anno (es. 2024)"
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900 w-32"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Stato Attuale</p>
                            <p className="text-gray-900 font-medium mt-1 font-mono">{status}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={loading || status.includes('Syncing')}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <ImportIcon className="w-4 h-4" />
                        )}
                        Avvia Sync Immagini
                    </button>
                </div>
            </div>
        </div>
    )
}
