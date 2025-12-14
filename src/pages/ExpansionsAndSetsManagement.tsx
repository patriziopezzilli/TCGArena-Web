import React, { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import type { Expansion, TCGSet, TCGStats } from '../types/api'

type ViewMode = 'list' | 'cards'
type ModalType = 'expansion' | 'set'

export default function ExpansionsAndSetsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expansions, setExpansions] = useState<Expansion[]>([])
  const [stats, setStats] = useState<TCGStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('expansion')
  const [editingItem, setEditingItem] = useState<Expansion | TCGSet | null>(null)
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null)
  const [expandedExpansions, setExpandedExpansions] = useState<Set<number>>(new Set())
  const [tcgFilter, setTcgFilter] = useState<string>('ALL')
  const [formData, setFormData] = useState({
    // Expansion fields
    title: '',
    tcgType: 'POKEMON',
    imageUrl: '',
    // Set fields
    name: '',
    setCode: '',
    description: '',
    releaseDate: '',
    cardCount: 0,
  })

  const { showToast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [expansionsData, statsData] = await Promise.all([
        adminService.getAllExpansions(),
        adminService.getTCGStatistics()
      ])
      setExpansions(expansionsData)
      setStats(statsData)
    } catch (err) {
      showToast('Errore nel caricamento dei dati', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpansion = () => {
    setModalType('expansion')
    setEditingItem(null)
    setFormData({
      title: '',
      tcgType: 'POKEMON',
      imageUrl: '',
      name: '',
      setCode: '',
      description: '',
      releaseDate: '',
      cardCount: 0,
    })
    setShowModal(true)
  }

  const handleCreateSet = (expansion: Expansion) => {
    setModalType('set')
    setEditingItem(null)
    setSelectedExpansion(expansion)
    setFormData({
      title: '',
      tcgType: 'POKEMON',
      imageUrl: '',
      name: '',
      setCode: '',
      description: '',
      releaseDate: '',
      cardCount: 0,
    })
    setShowModal(true)
  }

  const handleEdit = (item: Expansion | TCGSet, expansion?: Expansion) => {
    setEditingItem(item)
    if ('title' in item && 'tcgType' in item) {
      // È un'espansione
      setModalType('expansion')
      setFormData({
        title: item.title,
        tcgType: item.tcgType,
        imageUrl: item.imageUrl || '',
        name: '',
        setCode: '',
        description: '',
        releaseDate: '',
        cardCount: 0,
      })
    } else {
      // È un set
      setModalType('set')
      setSelectedExpansion(expansion || null)
      setFormData({
        title: '',
        tcgType: 'POKEMON',
        imageUrl: '',
        name: item.name,
        setCode: item.setCode || '',
        description: item.description || '',
        releaseDate: item.releaseDate ? new Date(item.releaseDate).toISOString().split('T')[0] : '',
        cardCount: item.cardCount || 0,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalType === 'expansion') {
        const expansionData = {
          title: formData.title,
          tcgType: formData.tcgType,
          imageUrl: formData.imageUrl || undefined,
        }
        if (editingItem) {
          await adminService.updateExpansion(editingItem.id, expansionData)
          showToast('Espansione aggiornata con successo', 'success')
        } else {
          await adminService.createExpansion(expansionData)
          showToast('Espansione creata con successo', 'success')
        }
      } else {
        if (!selectedExpansion) {
          showToast('Seleziona un\'espansione per il set', 'error')
          return
        }
        const setData = {
          name: formData.name,
          setCode: formData.setCode || undefined,
          description: formData.description || undefined,
          releaseDate: formData.releaseDate || undefined,
          imageUrl: formData.imageUrl || undefined,
          cardCount: formData.cardCount || undefined,
          expansionId: selectedExpansion.id,
        }
        if (editingItem) {
          await adminService.updateSet(editingItem.id, setData)
          showToast('Set aggiornato con successo', 'success')
        } else {
          await adminService.createSet(setData)
          showToast('Set creato con successo', 'success')
        }
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      showToast('Errore: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  const handleDelete = async (item: Expansion | TCGSet, force: boolean = false) => {
    const itemName = 'title' in item ? item.title : item.name
    const isExpansion = 'title' in item

    // Only show initial confirmation if not forcing
    if (!force && !confirm(`Sei sicuro di voler eliminare "${itemName}"?`)) return

    try {
      if (isExpansion) {
        const response = await adminService.deleteExpansion(item.id, force)
        // Check if response indicates cascade confirmation needed
        if (response.status === 409 && response.data?.confirmRequired) {
          const { setCount, cardCount, message } = response.data
          const confirmMessage = `⚠️ ATTENZIONE!\n\n${message}\n\n` +
            `Questa operazione eliminerà:\n` +
            `• ${setCount} set\n` +
            `• ${cardCount} carte\n\n` +
            `Questa azione è IRREVERSIBILE. Vuoi procedere?`

          if (confirm(confirmMessage)) {
            await handleDelete(item, true) // Retry with force=true
          }
          return
        }
        showToast('Espansione eliminata con successo', 'success')
      } else {
        const response = await adminService.deleteSet(item.id, force)
        // Check if response indicates cascade confirmation needed
        if (response.status === 409 && response.data?.confirmRequired) {
          const { cardCount, message } = response.data
          const confirmMessage = `⚠️ ATTENZIONE!\n\n${message}\n\n` +
            `Questa operazione eliminerà ${cardCount} carte.\n\n` +
            `Questa azione è IRREVERSIBILE. Vuoi procedere?`

          if (confirm(confirmMessage)) {
            await handleDelete(item, true) // Retry with force=true
          }
          return
        }
        showToast('Set eliminato con successo', 'success')
      }
      loadData()
    } catch (err: any) {
      // Handle 409 response from axios error
      if (err.response?.status === 409 && err.response?.data?.confirmRequired) {
        const { setCount, cardCount, message } = err.response.data
        let confirmMessage = `⚠️ ATTENZIONE!\n\n${message}\n\n`

        if (isExpansion) {
          confirmMessage += `Questa operazione eliminerà:\n` +
            `• ${setCount || 0} set\n` +
            `• ${cardCount || 0} carte\n\n`
        } else {
          confirmMessage += `Questa operazione eliminerà ${cardCount || 0} carte.\n\n`
        }
        confirmMessage += `Questa azione è IRREVERSIBILE. Vuoi procedere?`

        if (confirm(confirmMessage)) {
          await handleDelete(item, true) // Retry with force=true
        }
        return
      }

      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message
      showToast(errorMessage, 'error')
    }
  }

  const toggleExpansion = (expansionId: number) => {
    setExpandedExpansions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(expansionId)) {
        newSet.delete(expansionId)
      } else {
        newSet.add(expansionId)
      }
      return newSet
    })
  }

  // Filtra espansioni per TCG
  const filteredExpansions = expansions.filter(expansion =>
    tcgFilter === 'ALL' || expansion.tcgType === tcgFilter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiche TCG */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {stats.map((stat) => (
            <div key={stat.tcgType} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex-shrink-0 w-64">
              <div className="text-sm font-medium text-gray-600 mb-2">{stat.tcgType}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Espansioni:</span>
                  <span className="font-semibold text-blue-600">{stat.expansions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Set:</span>
                  <span className="font-semibold text-green-600">{stat.sets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Carte:</span>
                  <span className="font-semibold text-purple-600">{stat.cards}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Fade effect */}
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Espansioni e Set TCG</h2>
          <p className="text-gray-600 mt-1">
            {expansions.length} espansioni, {expansions.reduce((sum, exp) => sum + exp.sets.length, 0)} set totali nel sistema
          </p>
        </div>
        <div className="flex gap-3">
          {/* Filtro TCG */}
          <select
            value={tcgFilter}
            onChange={(e) => setTcgFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="ALL">Tutti i TCG</option>
            <option value="POKEMON">Pokémon</option>
            <option value="MAGIC">Magic: The Gathering</option>
            <option value="ONE_PIECE">One Piece</option>
            <option value="OTHER">Altro</option>
          </select>
          <button
            onClick={handleCreateExpansion}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">➕</span>
              Aggiungi Espansione
              <span className="transform hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              {viewMode === 'list' ? '📋 Vista Card' : '📝 Vista Lista'}
              <span className="transform hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* Vista Lista Gerarchica */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Espansione / Set
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo TCG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dettagli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Immagine
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpansions.map((expansion) => (
                  <React.Fragment key={expansion.id}>
                    {/* Riga Espansione */}
                    <tr key={`expansion-${expansion.id}`} className="hover:bg-gray-50 bg-blue-50/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpansion(expansion.id)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {expandedExpansions.has(expansion.id) ? '▼' : '▶'}
                          </button>
                          <div className="text-sm font-medium text-gray-900">{expansion.title}</div>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {expansion.sets.length} set
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          {expansion.tcgType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Espansione
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expansion.imageUrl ? (
                          <div className="max-w-xs truncate" title={expansion.imageUrl}>
                            {expansion.imageUrl}
                          </div>
                        ) : (
                          'Nessuno'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(expansion)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                        >
                          <span className="flex items-center gap-1">
                            <span>✏️</span>
                            Modifica
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(expansion)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 ml-2"
                        >
                          <span className="flex items-center gap-1">
                            <span>🗑️</span>
                            Elimina
                          </span>
                        </button>
                        <button
                          onClick={() => handleCreateSet(expansion)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 ml-2"
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-white">➕</span>
                            Set
                          </span>
                        </button>
                      </td>
                    </tr>

                    {/* Righe Set - solo se espansione è aperta */}
                    {expandedExpansions.has(expansion.id) && expansion.sets.map((set) => (
                      <tr key={`set-${set.id}`} className="hover:bg-gray-50 bg-gray-50/50">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="ml-12 flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">•</span>
                            </div>
                            <div className="text-sm text-gray-900">{set.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Set TCG
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {set.setCode && <div>Codice: {set.setCode}</div>}
                          {set.releaseDate && <div>Data: {new Date(set.releaseDate).toLocaleDateString('it-IT')}</div>}
                          {set.cardCount && <div>Carte: {set.cardCount}</div>}
                          {set.description && <div className="truncate max-w-xs">{set.description}</div>}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {set.imageUrl ? (
                            <div className="max-w-xs truncate" title={set.imageUrl}>
                              {set.imageUrl}
                            </div>
                          ) : (
                            'Nessuno'
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(set, expansion)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 mr-2"
                          >
                            <span>✏️</span>
                          </button>
                          <button
                            onClick={() => handleDelete(set)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105"
                          >
                            <span>🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista Card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpansions.map((expansion) => (
            <div key={expansion.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
              {/* Header Espansione */}
              <div className="bg-blue-600 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{expansion.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expansion)}
                      className="group relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                      title="Modifica espansione"
                    >
                      <span className="group-hover:rotate-12 transition-transform duration-300">✏️</span>
                    </button>
                    <button
                      onClick={() => handleDelete(expansion)}
                      className="group relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                      title="Elimina espansione"
                    >
                      <span className="group-hover:rotate-12 transition-transform duration-300">🗑️</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                    {expansion.tcgType}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-100 rounded-full">
                    {expansion.sets.length} set
                  </span>
                </div>
                {expansion.imageUrl && (
                  <div className="text-xs text-white/80 truncate" title={expansion.imageUrl}>
                    {expansion.imageUrl}
                  </div>
                )}
              </div>

              {/* Set dell'espansione */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Set TCG</h4>
                  <button
                    onClick={() => handleCreateSet(expansion)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-white">➕</span>
                      Aggiungi Set
                    </span>
                  </button>
                </div>

                {expansion.sets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📦</div>
                    <p className="text-gray-500 text-sm">Nessun set presente</p>
                    <p className="text-gray-400 text-xs mt-1">Aggiungi il primo set a questa espansione</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expansion.sets.map((set) => (
                      <div key={set.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm mb-1">{set.name}</div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {set.setCode && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {set.setCode}
                                </span>
                              )}
                              {set.cardCount && (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                  {set.cardCount} carte
                                </span>
                              )}
                            </div>
                            {set.releaseDate && (
                              <div className="text-xs text-gray-600 mb-1">
                                Rilasciato: {new Date(set.releaseDate).toLocaleDateString('it-IT')}
                              </div>
                            )}
                            {set.description && (
                              <div className="text-xs text-gray-600 line-clamp-2">{set.description}</div>
                            )}
                            {set.imageUrl && (
                              <div className="text-xs text-gray-500 truncate mt-1" title={set.imageUrl}>
                                URL: {set.imageUrl}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-3">
                            <button
                              onClick={() => handleEdit(set, expansion)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                              title="Modifica set"
                            >
                              <span>✏️</span>
                            </button>
                            <button
                              onClick={() => handleDelete(set)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-110"
                              title="Elimina set"
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Card per aggiungere nuova espansione */}
          <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center min-h-[300px]" onClick={handleCreateExpansion}>
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">➕</div>
              <div className="text-gray-600 font-medium">Aggiungi Espansione</div>
              <div className="text-gray-400 text-sm mt-1">Crea una nuova espansione TCG</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900">
              {editingItem ? 'Modifica' : 'Aggiungi'} {modalType === 'expansion' ? 'Espansione' : 'Set TCG'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {modalType === 'expansion' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      placeholder="Es: Scarlet & Violet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo TCG *
                    </label>
                    <select
                      value={formData.tcgType}
                      onChange={(e) => setFormData({ ...formData, tcgType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="POKEMON">Pokémon</option>
                      <option value="MAGIC">Magic: The Gathering</option>
                      <option value="ONE_PIECE">One Piece</option>
                      <option value="OTHER">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Immagine
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              ) : (
                <>
                  {selectedExpansion && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="text-sm text-blue-800">
                        <strong>Espansione:</strong> {selectedExpansion.title}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Set *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                      placeholder="Es: Base Set"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Codice Set
                    </label>
                    <input
                      type="text"
                      value={formData.setCode}
                      onChange={(e) => setFormData({ ...formData, setCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Es: BS01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numero Carte
                    </label>
                    <input
                      type="number"
                      value={formData.cardCount}
                      onChange={(e) => setFormData({ ...formData, cardCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      min="0"
                      placeholder="Es: 102"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data Rilascio
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="Descrizione del set..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Immagine
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  {editingItem ? 'Aggiorna' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}