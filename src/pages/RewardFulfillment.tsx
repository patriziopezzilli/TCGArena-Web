import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface RewardTransaction {
    id: number
    userId: number
    pointsChange: number
    description: string
    rewardId: number | null
    timestamp: string
    voucherCode: string | null
    trackingNumber: string | null
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED'
}

const statusConfig = {
    PENDING: { label: 'In preparazione', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
    PROCESSING: { label: 'In lavorazione', color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
    SHIPPED: { label: 'Spedito', color: 'bg-purple-100 text-purple-800', icon: '📦' },
    DELIVERED: { label: 'Consegnato', color: 'bg-green-100 text-green-800', icon: '✅' },
    COMPLETED: { label: 'Completato', color: 'bg-gray-100 text-gray-800', icon: '🎉' },
}

export default function RewardFulfillment() {
    const [transactions, setTransactions] = useState<RewardTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<RewardTransaction | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending'>('pending')
    const [formData, setFormData] = useState({
        status: 'PENDING' as string,
        voucherCode: '',
        trackingNumber: '',
    })

    const { showToast } = useToast()

    useEffect(() => {
        loadTransactions()
    }, [filter])

    const loadTransactions = async () => {
        setLoading(true)
        try {
            const data = filter === 'pending'
                ? await adminService.getPendingFulfillments()
                : await adminService.getAllRewardTransactions()

            // Filter only redemptions (negative points = rewards redeemed)
            const redemptions = data.filter((t: RewardTransaction) => t.pointsChange < 0 && t.rewardId)
            setTransactions(redemptions)
        } catch (err) {
            showToast('Errore nel caricamento delle transazioni', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (transaction: RewardTransaction) => {
        setEditingTransaction(transaction)
        setFormData({
            status: transaction.status || 'PENDING',
            voucherCode: transaction.voucherCode || '',
            trackingNumber: transaction.trackingNumber || '',
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTransaction) return

        try {
            await adminService.updateRewardTransaction(editingTransaction.id, {
                status: formData.status,
                voucherCode: formData.voucherCode || undefined,
                trackingNumber: formData.trackingNumber || undefined,
            })
            showToast('Transazione aggiornata con successo', 'success')
            setShowModal(false)
            loadTransactions()
        } catch (err: any) {
            showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Reward Fulfillment</h2>
                    <p className="text-sm text-gray-600 mt-1">Gestisci i premi riscattati dagli utenti</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'pending'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Da gestire ({transactions.length})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Tutti
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = transactions.filter(t => (t.status || 'PENDING') === status).length
                    return (
                        <div key={status} className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{config.icon}</span>
                                <span className="text-sm font-medium text-gray-600">{config.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                        </div>
                    )
                })}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descrizione
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Punti
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Voucher / Tracking
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Azioni
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {filter === 'pending'
                                            ? '✅ Nessun premio da gestire'
                                            : 'Nessuna transazione trovata'}
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => {
                                    const status = transaction.status || 'PENDING'
                                    const config = statusConfig[status]
                                    return (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                #{transaction.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate">{transaction.description}</div>
                                                <div className="text-xs text-gray-500">User ID: {transaction.userId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                                {transaction.pointsChange} pts
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {new Date(transaction.timestamp).toLocaleDateString('it-IT', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
                                                    {config.icon} {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {transaction.voucherCode && (
                                                    <div className="flex items-center gap-1 text-blue-600">
                                                        <span>🎫</span>
                                                        <code className="font-mono text-xs bg-blue-50 px-1 rounded">{transaction.voucherCode}</code>
                                                    </div>
                                                )}
                                                {transaction.trackingNumber && (
                                                    <div className="flex items-center gap-1 text-orange-600">
                                                        <span>📦</span>
                                                        <code className="font-mono text-xs bg-orange-50 px-1 rounded">{transaction.trackingNumber}</code>
                                                    </div>
                                                )}
                                                {!transaction.voucherCode && !transaction.trackingNumber && (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Gestisci
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            Gestisci Premio #{editingTransaction.id}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">{editingTransaction.description}</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                    <option value="PENDING">⏳ In preparazione</option>
                                    <option value="PROCESSING">⚙️ In lavorazione</option>
                                    <option value="SHIPPED">📦 Spedito</option>
                                    <option value="DELIVERED">✅ Consegnato</option>
                                    <option value="COMPLETED">🎉 Completato</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Codice Voucher (per premi digitali)
                                </label>
                                <input
                                    type="text"
                                    value={formData.voucherCode}
                                    onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                                    placeholder="es. VOUCHER-ABC123"
                                />
                                <p className="text-xs text-gray-500 mt-1">Inserisci il codice che l'utente potrà usare</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numero Tracking (per premi fisici)
                                </label>
                                <input
                                    type="text"
                                    value={formData.trackingNumber}
                                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                                    placeholder="es. 1Z999AA10123456784"
                                />
                                <p className="text-xs text-gray-500 mt-1">Numero di tracciamento della spedizione</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Salva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
