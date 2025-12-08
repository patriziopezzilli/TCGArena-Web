import { useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

type TCGType = 'POKEMON' | 'MAGIC' | 'YUGIOH' | 'ONE_PIECE' | 'DIGIMON' | 'DRAGON_BALL_SUPER' | 'DRAGON_BALL_FUSION' | 'FLESH_AND_BLOOD' | 'LORCANA'

const TCG_TYPES: { value: TCGType; label: string; color: string }[] = [
  { value: 'POKEMON', label: 'Pokémon', color: 'bg-yellow-500' },
  { value: 'MAGIC', label: 'Magic: The Gathering', color: 'bg-purple-500' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', color: 'bg-blue-500' },
  { value: 'ONE_PIECE', label: 'One Piece', color: 'bg-red-500' },
  { value: 'DIGIMON', label: 'Digimon', color: 'bg-cyan-500' },
  { value: 'DRAGON_BALL_SUPER', label: 'Dragon Ball Super', color: 'bg-orange-500' },
  { value: 'DRAGON_BALL_FUSION', label: 'Dragon Ball Fusion', color: 'bg-green-500' },
  { value: 'FLESH_AND_BLOOD', label: 'Flesh and Blood', color: 'bg-rose-600' },
  { value: 'LORCANA', label: 'Lorcana', color: 'bg-indigo-500' },
]

// JustTCG supported types (subset)
const JUSTTCG_TYPES: { value: TCGType; label: string; color: string }[] = [
  { value: 'POKEMON', label: 'Pokémon', color: 'bg-yellow-500' },
  { value: 'MAGIC', label: 'Magic: The Gathering', color: 'bg-purple-500' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', color: 'bg-blue-500' },
  { value: 'ONE_PIECE', label: 'One Piece', color: 'bg-red-500' },
  { value: 'DIGIMON', label: 'Digimon', color: 'bg-cyan-500' },
  { value: 'LORCANA', label: 'Lorcana', color: 'bg-indigo-500' },
]

interface ImportHistory {
  tcgType: TCGType
  timestamp: string
  status: 'success' | 'running' | 'error'
  message: string
  source: 'legacy' | 'justtcg'
}

export default function BatchImport() {
  const { showToast } = useToast()
  const [selectedTCG, setSelectedTCG] = useState<TCGType>('POKEMON')
  const [selectedJustTCG, setSelectedJustTCG] = useState<TCGType>('POKEMON')
  const [startIndex, setStartIndex] = useState<string>('-99')
  const [endIndex, setEndIndex] = useState<string>('-99')
  const [importing, setImporting] = useState(false)
  const [importingJustTCG, setImportingJustTCG] = useState(false)
  const [history, setHistory] = useState<ImportHistory[]>([])

  const handleImport = async () => {
    if (!confirm(`Sei sicuro di voler avviare l'import Legacy per ${selectedTCG}?`)) return

    setImporting(true)
    const start = parseInt(startIndex)
    const end = parseInt(endIndex)

    try {
      const result = await adminService.triggerBatchImport(selectedTCG, start, end)

      const newEntry: ImportHistory = {
        tcgType: selectedTCG,
        timestamp: new Date().toISOString(),
        status: 'success',
        message: result.message || result || 'Import avviato con successo',
        source: 'legacy',
      }

      setHistory([newEntry, ...history])
      showToast('Legacy import avviato con successo!', 'success')
    } catch (err: any) {
      const errorEntry: ImportHistory = {
        tcgType: selectedTCG,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: err.response?.data?.message || err.message || 'Errore durante l\'import',
        source: 'legacy',
      }

      setHistory([errorEntry, ...history])
      showToast('Errore: ' + errorEntry.message, 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleJustTCGImport = async () => {
    if (!confirm(`Sei sicuro di voler avviare l'import JustTCG per ${selectedJustTCG}? Include prezzi real-time!`)) return

    setImportingJustTCG(true)

    try {
      const result = await adminService.triggerJustTCGImport(selectedJustTCG)

      const newEntry: ImportHistory = {
        tcgType: selectedJustTCG,
        timestamp: new Date().toISOString(),
        status: 'success',
        message: result.message || 'JustTCG import avviato con successo',
        source: 'justtcg',
      }

      setHistory([newEntry, ...history])
      showToast('JustTCG import avviato con successo!', 'success')
    } catch (err: any) {
      const errorEntry: ImportHistory = {
        tcgType: selectedJustTCG,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: err.response?.data?.message || err.message || 'Errore durante JustTCG import',
        source: 'justtcg',
      }

      setHistory([errorEntry, ...history])
      showToast('Errore: ' + errorEntry.message, 'error')
    } finally {
      setImportingJustTCG(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Batch Import Cards</h2>
        <p className="text-sm text-gray-600 mt-1">
          Importa cards dal database esterno per ogni TCG type
        </p>
      </div>

      {/* JustTCG Import Section - NEW */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💰</span>
          <div>
            <h3 className="font-semibold text-gray-900">JustTCG Import (Prezzi Real-Time)</h3>
            <p className="text-sm text-gray-600">Import cards con prezzi aggiornati da JustTCG API</p>
          </div>
        </div>

        {/* JustTCG Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona TCG Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {JUSTTCG_TYPES.map((tcg) => (
              <button
                key={tcg.value}
                onClick={() => setSelectedJustTCG(tcg.value)}
                className={`p-3 rounded-lg border-2 transition-all ${selectedJustTCG === tcg.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${tcg.color} mb-2`}></div>
                <p className="text-xs font-medium text-gray-900">{tcg.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            <strong>✨ JustTCG API:</strong> Importa cards con prezzi Near Mint aggiornati in tempo reale.
            Supporta: Pokémon, MTG, Yu-Gi-Oh!, One Piece, Digimon, Lorcana.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleJustTCGImport}
          disabled={importingJustTCG}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${importingJustTCG
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {importingJustTCG ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              JustTCG Import in corso...
            </span>
          ) : (
            `🚀 Avvia JustTCG Import - ${selectedJustTCG}`
          )}
        </button>
      </div>

      {/* Legacy Import Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Legacy Import (API Originali)</h3>

        {/* TCG Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona TCG Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {TCG_TYPES.map((tcg) => (
              <button
                key={tcg.value}
                onClick={() => setSelectedTCG(tcg.value)}
                className={`p-4 rounded-lg border-2 transition-all ${selectedTCG === tcg.value
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${tcg.color} mb-2`}></div>
                <p className="text-sm font-medium text-gray-900">{tcg.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Index Range */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Index
              <span className="text-xs text-gray-500 ml-2">(-99 per tutti)</span>
            </label>
            <input
              type="number"
              value={startIndex}
              onChange={(e) => setStartIndex(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="-99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Index
              <span className="text-xs text-gray-500 ml-2">(-99 per tutti)</span>
            </label>
            <input
              type="number"
              value={endIndex}
              onChange={(e) => setEndIndex(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="-99"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900">
            <strong>Nota:</strong> L'import Legacy usa le API originali per ogni TCG.
            Usa -99 per importare tutte le cards disponibili.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleImport}
          disabled={importing}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${importing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
        >
          {importing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Legacy Import in corso...
            </span>
          ) : (
            `Avvia Legacy Import ${selectedTCG}`
          )}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Storico Import</h3>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${entry.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : entry.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${entry.source === 'justtcg'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {entry.source === 'justtcg' ? '💰 JustTCG' : '📦 Legacy'}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${entry.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {entry.tcgType}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${entry.status === 'success'
                        ? 'bg-green-200 text-green-900'
                        : entry.status === 'error'
                          ? 'bg-red-200 text-red-900'
                          : 'bg-blue-200 text-blue-900'
                        }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString('it-IT')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

