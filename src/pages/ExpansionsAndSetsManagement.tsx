import React, { useEffect, useState, useMemo } from 'react'
import { adminService } from '../services/api'
import apiClient from '../services/api'
import { useToast } from '../contexts/ToastContext'
import type { Expansion, TCGSet, TCGStats } from '../types/api'

type ExpansionWithDate = Expansion & { releaseDate?: string }

type ViewMode = 'list' | 'cards'
type ModalType = 'expansion' | 'set'

export default function ExpansionsAndSetsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expansions, setExpansions] = useState<ExpansionWithDate[]>([])
  const [stats, setStats] = useState<TCGStats[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [reloadingSetId, setReloadingSetId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('expansion')
  const [editingItem, setEditingItem] = useState<ExpansionWithDate | TCGSet | null>(null)
  const [selectedExpansion, setSelectedExpansion] = useState<ExpansionWithDate | null>(null)
  const [expandedExpansions, setExpandedExpansions] = useState<Set<number>>(new Set())
  const [tcgFilter, setTcgFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('ALL')

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    expansions.forEach(exp => {
      // Check expansion release date
      if (exp.releaseDate) {
        years.add(new Date(exp.releaseDate).getFullYear().toString())
      }
      // Check sets release dates
      exp.sets.forEach(set => {
        if (set.releaseDate) {
          years.add(new Date(set.releaseDate).getFullYear().toString())
        }
      })
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }, [expansions])
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

  const handleEdit = (item: ExpansionWithDate | TCGSet, expansion?: ExpansionWithDate) => {
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
        releaseDate: item.releaseDate ? new Date(item.releaseDate).toISOString().split('T')[0] : '',
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
          releaseDate: formData.releaseDate ? `${formData.releaseDate}T00:00:00` : undefined,
        }
        if (editingItem) {
          await adminService.updateExpansion(editingItem.id, expansionData)
          showToast('Serie aggiornata con successo', 'success')
        } else {
          await adminService.createExpansion(expansionData)
          showToast('Serie creata con successo', 'success')
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
          releaseDate: formData.releaseDate ? `${formData.releaseDate}T00:00:00` : undefined,
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
        showToast('Serie eliminata con successo', 'success')
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

  // Sync release dates from TCG API
  const handleSyncReleaseDates = async () => {
    if (!confirm('Vuoi sincronizzare le date di rilascio di tutti i set da TCG? Questa operazione può richiedere diversi minuti.')) return

    setSyncing(true)
    try {
      const response = await apiClient.post('/sets/sync-release-dates')
      const results = response.data as Record<string, number>

      // Format results for display
      const successMessages: string[] = []
      const errorMessages: string[] = []

      Object.entries(results).forEach(([tcg, count]) => {
        if (count >= 0) {
          successMessages.push(`${tcg}: ${count} set aggiornati`)
        } else {
          errorMessages.push(`${tcg}: errore`)
        }
      })

      if (errorMessages.length > 0) {
        showToast(`Sync completato con errori. Successi: ${successMessages.join(', ')}. Errori: ${errorMessages.join(', ')}`, 'warning')
      } else {
        showToast(`Sync completato! ${successMessages.join(', ')}`, 'success')
      }

      // Reload data to show updated dates
      await loadData()
    } catch (err: any) {
      showToast('Errore durante la sincronizzazione: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setSyncing(false)
    }
  }

  // Reload a specific set from JustTCG API (delta import)
  const handleReloadSet = async (set: TCGSet) => {
    if (!confirm(`Vuoi ricaricare il set "${set.name}" da JustTCG?\n\nQuesta operazione aggiungerà solo le carte mancanti, senza eliminare quelle esistenti.`)) return

    setReloadingSetId(set.id)
    try {
      const result = await adminService.reloadSet(set.id)

      if (result.success) {
        if (result.newCards > 0) {
          showToast(`Reload completato! ${result.newCards} nuove carte aggiunte, ${result.skipped} già presenti${result.errors > 0 ? `, ${result.errors} errori` : ''}`, 'success')
        } else {
          showToast(`Nessuna nuova carta trovata. ${result.skipped} carte già presenti.`, 'info')
        }
        // Reload data to show updated card counts
        await loadData()
      } else {
        showToast('Reload fallito', 'error')
      }
    } catch (err: any) {
      showToast('Errore durante il reload: ' + (err.response?.data?.error || err.message), 'error')
    } finally {
      setReloadingSetId(null)
    }
  }

  // Complete reset of a specific set from TCGDex API (destructive)
  const handleResetSetFromTcgDex = async (set: TCGSet) => {
    const setCode = prompt(`Inserisci il set code per "${set.name}" (es. me02.5):`)
    if (!setCode || setCode.trim() === '') return

    if (!confirm(`⚠️ ATTENZIONE: RESET COMPLETO TRAMITE TCGDEX!\n\nVuoi resettare completamente il set "${set.name}" usando TCGDex API?\n\nSet Code: ${setCode}\n\nQuesta operazione:\n• ELIMINERÀ TUTTE le carte esistenti (${set.cardCount || 0} carte)\n• Ricaricherà tutto da TCGDex API da zero\n\nQuesta azione è IRREVERSIBILE. Sei sicuro?`)) return

    setReloadingSetId(set.id)
    try {
      const result = await adminService.resetSetFromTcgDex(set.id, setCode.trim())

      if (result.success) {
        showToast(`Reset TCGDex completato! ${result.deletedCards} carte eliminate, ${result.importedCards} carte ricaricate${result.errors > 0 ? `, ${result.errors} errori` : ''}`, 'success')
        // Reload data to show updated card counts
        await loadData()
      } else {
        showToast('Reset TCGDex fallito', 'error')
      }
    } catch (err: any) {
      showToast('Errore durante il reset TCGDex: ' + (err.response?.data?.error || err.message), 'error')
    } finally {
      setReloadingSetId(null)
    }
  }

  // Complete reset of a specific set (destructive)
  const handleResetSet = async (set: TCGSet) => {
    if (!confirm(`⚠️ ATTENZIONE: RESET COMPLETO!\n\nVuoi resettare completamente il set "${set.name}"?\n\nQuesta operazione:\n• ELIMINERÀ TUTTE le carte esistenti (${set.cardCount || 0} carte)\n• Ricaricherà tutto da JustTCG API da zero\n\nQuesta azione è IRREVERSIBILE. Sei sicuro?`)) return

    setReloadingSetId(set.id)
    try {
      const result = await adminService.resetSet(set.id)

      if (result.success) {
        showToast(`Reset completato! ${result.deletedCards} carte eliminate, ${result.importedCards} nuove carte ricaricate${result.errors > 0 ? `, ${result.errors} errori` : ''}`, 'success')
        // Reload data to show updated card counts
        await loadData()
      } else {
        showToast('Reset fallito', 'error')
      }
    } catch (err: any) {
      showToast('Errore durante il reset: ' + (err.response?.data?.error || err.message), 'error')
    } finally {
      setReloadingSetId(null)
    }
  }

  // Filtra espansioni per TCG e ricerca
  const filteredExpansions = expansions.filter(expansion => {
    const matchesTcg = tcgFilter === 'ALL' || expansion.tcgType === tcgFilter
    const matchesSearch = searchTerm === '' ||
      expansion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expansion.tcgType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expansion.sets.some(set =>
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (set.setCode && set.setCode.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    const matchesYear = yearFilter === 'ALL' ||
      (expansion.releaseDate && new Date(expansion.releaseDate).getFullYear().toString() === yearFilter) ||
      expansion.sets.some(set => set.releaseDate && new Date(set.releaseDate).getFullYear().toString() === yearFilter)

    return matchesTcg && matchesSearch && matchesYear
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] -m-6 overflow-hidden bg-gray-50/50">
      {/* Sidebar Filtri TCG */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 animate-fade-in">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="text-primary italic">TCG</span>
            <span>Arena</span>
          </h2>
          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em] font-bold">Expansion Control</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {[
            { id: 'ALL', label: 'Tutti i TCG', icon: '🌐' },
            { id: 'POKEMON', label: 'Pokémon', icon: '⚡' },
            { id: 'POKEMON_JAPAN', label: 'Pokémon Japan', icon: '🇯🇵' },
            { id: 'MAGIC', label: 'Magic: The Gathering', icon: '🔥' },
            { id: 'YUGIOH', label: 'Yu-Gi-Oh!', icon: '🔮' },
            { id: 'ONE_PIECE', label: 'One Piece', icon: '🏴‍☠️' },
            { id: 'DIGIMON', label: 'Digimon', icon: '👾' },
            { id: 'LORCANA', label: 'Disney Lorcana', icon: '✨' },
            { id: 'RIFTBOUND', label: 'Riftbound', icon: '💎' },
            { id: 'DRAGON_BALL_SUPER_FUSION_WORLD', label: 'Dragon Ball Super', icon: '🐉' },
            { id: 'FLESH_AND_BLOOD', label: 'Flesh and Blood', icon: '⚔️' },
            { id: 'UNION_ARENA', label: 'Union Arena', icon: '🏟️' },
            { id: 'OTHER', label: 'Altro', icon: '📦' },
          ].map((tcg) => (
            <button
              key={tcg.id}
              onClick={() => setTcgFilter(tcg.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${tcgFilter === tcg.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-primary active:scale-95'
                }`}
            >
              <span className="text-lg">{tcg.icon}</span>
              {tcg.label}
              {tcgFilter === tcg.id && <span className="ml-auto animate-ping-slow">●</span>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <button
            onClick={handleSyncReleaseDates}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{syncing ? '⌛' : '🔄'}</span>
            {syncing ? 'Syncing...' : 'Sync Release Dates'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-grid-pattern">
        {/* Top Floating Header */}
        <div className="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20 premium-shadow">
          <div className="flex-1 w-full flex items-center gap-4">
            <div className="relative group flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">🔍</span>
              <input
                type="text"
                placeholder="Cerca serie o set..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium cursor-pointer hover:bg-gray-100 min-w-[140px]"
            >
              <option value="ALL">📅 Tutti gli anni</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                🎴 Card
              </button>
            </div>
          </div>

          <button
            onClick={handleCreateExpansion}
            className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-lg">✨</span> Nuova Serie
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {stats.filter(s => tcgFilter === 'ALL' || s.tcgType === tcgFilter).map((stat) => (
            <div key={stat.tcgType} className="bg-white rounded-2xl p-6 border border-gray-100 premium-shadow group hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="font-black">{stat.tcgType.charAt(0)}</span>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.tcgType}</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Serie</span>
                  <span className="text-xl font-black text-gray-900">{stat.expansions}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Set</span>
                  <span className="text-xl font-black text-gray-900">{stat.sets}</span>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Carte Caricate</span>
                    <span className="text-xs font-black text-primary">{stat.cards.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-fade-in premium-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serie / Set
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
                          <div>Serie</div>
                          {expansion.releaseDate && (
                            <div className="text-xs text-gray-400 mt-1">
                              Rilascio: {new Date(expansion.releaseDate).toLocaleDateString('it-IT')}
                            </div>
                          )}
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
                              onClick={() => handleReloadSet(set)}
                              disabled={reloadingSetId === set.id}
                              className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-all duration-300 hover:scale-105 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Ricarica carte mancanti da JustTCG"
                            >
                              {reloadingSetId === set.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                              ) : (
                                <span>🔄</span>
                              )}
                            </button>
                            <button
                              onClick={() => handleResetSetFromTcgDex(set)}
                              disabled={reloadingSetId === set.id}
                              className="px-3 py-1 bg-purple-700 text-white text-sm rounded-lg hover:bg-purple-800 transition-all duration-300 hover:scale-105 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reset tramite Pokemon TCG API - inserisci set code"
                            >
                              {reloadingSetId === set.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                              ) : (
                                <span>🎴</span>
                              )}
                            </button>
                            <button
                              onClick={() => handleResetSet(set)}
                              disabled={reloadingSetId === set.id}
                              className="px-3 py-1 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-all duration-300 hover:scale-105 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reset completo - elimina tutto e ricarica da zero"
                            >
                              {reloadingSetId === set.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                              ) : (
                                <span>💥</span>
                              )}
                            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in pb-10">
            {filteredExpansions.map((expansion) => (
              <div key={expansion.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 premium-shadow group hover:border-primary/20 transition-all duration-500 flex flex-col">
                {/* Expansion Header/Cover */}
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  {expansion.imageUrl ? (
                    <img src={expansion.imageUrl} alt={expansion.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
                      <span className="text-4xl text-white/10 font-black italic">{expansion.tcgType}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">{expansion.tcgType}</div>
                    <h3 className="text-xl font-black text-white leading-tight">{expansion.title}</h3>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEdit(expansion)} className="w-10 h-10 glass-panel !bg-black/20 text-white rounded-xl flex items-center justify-center hover:!bg-primary transition-all active:scale-95">
                      <span className="text-lg">✏️</span>
                    </button>
                    <button onClick={() => handleDelete(expansion)} className="w-10 h-10 glass-panel !bg-black/20 text-white rounded-xl flex items-center justify-center hover:!bg-red-500 transition-all active:scale-95">
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Contenuto</span>
                      <span className="text-lg font-black text-gray-900">{expansion.sets.length} Set Caricati</span>
                    </div>
                    <button
                      onClick={() => handleCreateSet(expansion)}
                      className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 active:scale-90"
                      title="Aggiungi Set"
                    >
                      <span className="text-2xl">+</span>
                    </button>
                  </div>

                  {expansion.sets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
                      <span className="text-4xl mb-4">📦</span>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nessun set trovato</p>
                    </div>
                  ) : (
                    <div className="space-y-3 custom-scrollbar max-h-60 overflow-y-auto pr-2">
                      {expansion.sets.map((set) => (
                        <div key={set.id} className="p-4 bg-gray-50 rounded-2xl group/set transition-all hover:bg-white hover:ring-2 hover:ring-primary/20 hover:premium-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-extrabold text-gray-900 leading-tight mb-1">{set.name}</div>
                              <div className="flex gap-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{set.setCode || 'NO CODE'}</span>
                                {set.cardCount && (
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">• {set.cardCount} Carte</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/set:opacity-100 transition-opacity">
                              <button onClick={() => handleReloadSet(set)} className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 rounded-lg text-amber-600 transition-colors" title="Reload">
                                <span className="text-sm">🔄</span>
                              </button>
                              <button onClick={() => handleEdit(set, expansion)} className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Edit">
                                <span className="text-sm">✏️</span>
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

            {/* Empty State / Add Card */}
            <button
              onClick={handleCreateExpansion}
              className="bg-gray-50/50 rounded-3xl border-4 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 hover:bg-primary/[0.02] transition-all min-h-[400px]"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center premium-shadow group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                <span className="text-4xl group-hover:text-white transition-colors">✨</span>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-gray-900 mb-1 group-hover:text-primary transition-colors">Nuova Serie</div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inizia a gestire nuovi contenuti</p>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Modal - Modernized */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar premium-shadow animate-scale-in border border-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Configurazione</div>
                <h3 className="text-2xl font-black text-gray-900">
                  {editingItem ? 'Modifica' : 'Aggiungi'} {modalType === 'expansion' ? 'Serie' : 'Set TCG'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-90"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {modalType === 'expansion' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Titolo Serie *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-semibold placeholder:text-gray-300"
                      required
                      placeholder="Es: Scarlet & Violet"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo TCG *</label>
                      <select
                        value={formData.tcgType}
                        onChange={(e) => setFormData({ ...formData, tcgType: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold appearance-none"
                        required
                      >
                        <option value="POKEMON">Pokémon</option>
                        <option value="POKEMON_JAPAN">Pokémon Japan</option>
                        <option value="MAGIC">Magic</option>
                        <option value="YUGIOH">Yu-Gi-Oh!</option>
                        <option value="ONE_PIECE">One Piece</option>
                        <option value="LORCANA">Lorcana</option>
                        <option value="OTHER">Altro</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Rilascio</label>
                      <input
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-semibold placeholder:text-gray-300"
                      placeholder="https://..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {selectedExpansion && (
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Serie Destinazione</span>
                        <span className="text-sm font-bold text-gray-900">{selectedExpansion.title}</span>
                      </div>
                      <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">{selectedExpansion.tcgType}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Set *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-semibold placeholder:text-gray-300"
                      required
                      placeholder="Es: Base Set"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Codice Set</label>
                      <input
                        type="text"
                        value={formData.setCode}
                        onChange={(e) => setFormData({ ...formData, setCode: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold placeholder:text-gray-300"
                        placeholder="Es: BS01"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Card Count</label>
                      <input
                        type="number"
                        value={formData.cardCount}
                        onChange={(e) => setFormData({ ...formData, cardCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrizione Set</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-semibold placeholder:text-gray-300 min-h-[100px]"
                      placeholder="Breve introduzione al set..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Set Asset URL (Packs/Logo)</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-semibold placeholder:text-gray-300"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-gray-900 transition-colors"
                >
                  Indietro
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 shadow-primary/20 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingItem ? 'Salva Modifiche' : 'Conferma e Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}