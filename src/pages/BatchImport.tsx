import { useState } from 'react'
import { adminService } from '../services/api'

type TCGType = 'POKEMON' | 'MAGIC' | 'YUGIOH' | 'ONE_PIECE' | 'LORCANA'

const TCG_TYPES: { value: TCGType; label: string; color: string }[] = [
  { value: 'POKEMON', label: 'Pokémon', color: 'bg-yellow-500' },
  { value: 'MAGIC', label: 'Magic: The Gathering', color: 'bg-purple-500' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!', color: 'bg-blue-500' },
  { value: 'ONE_PIECE', label: 'One Piece', color: 'bg-red-500' },
  { value: 'LORCANA', label: 'Lorcana', color: 'bg-indigo-500' },
]

interface ImportHistory {
  tcgType: TCGType
  timestamp: string
  status: 'success' | 'running' | 'error'
  message: string
}

export default function BatchImport() {
  const [selectedTCG, setSelectedTCG] = useState<TCGType>('POKEMON')
  const [startIndex, setStartIndex] = useState<string>('-99')
  const [endIndex, setEndIndex] = useState<string>('-99')
  const [importing, setImporting] = useState(false)
  const [history, setHistory] = useState<ImportHistory[]>([])

  const handleImport = async () => {
    if (!confirm(`Sei sicuro di voler avviare l'import per ${selectedTCG}?`)) return

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
      }
      
      setHistory([newEntry, ...history])
      alert('Import avviato con successo!')
    } catch (err: any) {
      const errorEntry: ImportHistory = {
        tcgType: selectedTCG,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: err.response?.data?.message || err.message || 'Errore durante l\'import',
      }
      
      setHistory([errorEntry, ...history])
      alert('Errore: ' + errorEntry.message)
    } finally {
      setImporting(false)
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

      {/* Import Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Avvia Nuovo Import</h3>
        
        {/* TCG Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona TCG Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {TCG_TYPES.map((tcg) => (
              <button
                key={tcg.value}
                onClick={() => setSelectedTCG(tcg.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTCG === tcg.value
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> L'import è un'operazione che può richiedere molto tempo.
            Usa -99 per importare tutte le cards disponibili, oppure specifica un range per un import parziale.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleImport}
          disabled={importing}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            importing
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
              Import in corso...
            </span>
          ) : (
            `Avvia Import ${selectedTCG}`
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
                className={`border rounded-lg p-4 ${
                  entry.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : entry.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        entry.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : entry.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {entry.tcgType}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        entry.status === 'success'
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
