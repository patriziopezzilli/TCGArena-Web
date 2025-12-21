import React, { useEffect, useState } from 'react'
import apiClient from '../../services/api'
import { CheckCircleIcon, MapPinIcon } from '../Icons'

interface Suggestion {
    id: number
    userId: number
    userEmail: string
    text: string
    createdAt: string
    isRead: boolean
}

export default function UserSuggestions() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSuggestions()
    }, [])

    const loadSuggestions = async () => {
        try {
            const res = await apiClient.get('/api/suggestions')
            setSuggestions(res.data)
        } catch (err) {
            console.error('Error loading suggestions:', err)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await apiClient.put(`/api/suggestions/${id}/read`)
            // Optimistic update
            setSuggestions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    if (loading) {
        return <div className="text-center py-8">Caricamento suggerimenti...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Suggerimenti Utenti</h2>
                    <p className="text-gray-500">Feedback inviati dagli utenti dall'app</p>
                </div>
                <div className="text-sm text-gray-500">
                    Totale: {suggestions.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {suggestions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Nessun suggerimento ricevuto finora.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${!suggestion.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-900">
                                                {suggestion.userEmail || `User #${suggestion.userId}`}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(suggestion.createdAt).toLocaleDateString('it-IT')}
                                                {' '}
                                                {new Date(suggestion.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!suggestion.isRead && (
                                                <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                                                    NUOVO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{suggestion.text}</p>
                                    </div>

                                    {!suggestion.isRead && (
                                        <button
                                            onClick={() => markAsRead(suggestion.id)}
                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                            title="Segna come letto"
                                        >
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
