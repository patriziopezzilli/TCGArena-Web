import React, { useEffect, useState } from 'react';
import { MapPinIcon, UserIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ShopSuggestion {
  id: number;
  shopName: string;
  city: string;
  latitude: number;
  longitude: number;
  userId: number;
  username: string;
  status: 'PENDING' | 'CONTACTED' | 'REJECTED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusUpdateModal {
  suggestion: ShopSuggestion;
  newStatus: 'CONTACTED' | 'REJECTED';
}

const ShopSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<ShopSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSuggestion, setSelectedSuggestion] = useState<ShopSuggestion | null>(null);
  const [updateModal, setUpdateModal] = useState<StatusUpdateModal | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [statusFilter]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/admin/shop-suggestions'
        : `/api/admin/shop-suggestions?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!updateModal) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/shop-suggestions/${updateModal.suggestion.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateModal.newStatus,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        await loadSuggestions();
        setUpdateModal(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONTACTED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };

    const icons = {
      PENDING: <ClockIcon className="w-4 h-4" />,
      CONTACTED: <CheckCircleIcon className="w-4 h-4" />,
      REJECTED: <XCircleIcon className="w-4 h-4" />,
    };

    const labels = {
      PENDING: 'In attesa',
      CONTACTED: 'Contattato',
      REJECTED: 'Rifiutato',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggerimenti Negozi</h1>
        <p className="text-gray-600">Gestisci i suggerimenti ricevuti dagli utenti per nuovi negozi</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Filtra per stato:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Tutti</option>
          <option value="PENDING">In attesa</option>
          <option value="CONTACTED">Contattati</option>
          <option value="REJECTED">Rifiutati</option>
        </select>
        
        <div className="ml-auto text-sm text-gray-600">
          {suggestions.length} suggeriment{suggestions.length === 1 ? 'o' : 'i'}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nessun suggerimento trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => setSelectedSuggestion(suggestion)}
                className={`bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{suggestion.shopName}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      {suggestion.city}
                    </p>
                  </div>
                  {getStatusBadge(suggestion.status)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {suggestion.username}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(suggestion.createdAt)}
                  </span>
                </div>

                {suggestion.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Note:</span> {suggestion.notes}
                    </p>
                  </div>
                )}

                {suggestion.status === 'PENDING' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdateModal({ suggestion, newStatus: 'CONTACTED' });
                        setNotes('');
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Segna Contattato
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdateModal({ suggestion, newStatus: 'REJECTED' });
                        setNotes('');
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Rifiuta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="sticky top-6 h-[600px] bg-white border border-gray-200 rounded-lg overflow-hidden">
            {selectedSuggestion ? (
              <MapContainer
                key={selectedSuggestion.id}
                center={[selectedSuggestion.latitude, selectedSuggestion.longitude]}
                zoom={13}
                className="w-full h-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[selectedSuggestion.latitude, selectedSuggestion.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">{selectedSuggestion.shopName}</p>
                      <p className="text-sm text-gray-600">{selectedSuggestion.city}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Seleziona un suggerimento per visualizzare la mappa
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {updateModal.newStatus === 'CONTACTED' ? 'Segna come Contattato' : 'Rifiuta Suggerimento'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">{updateModal.suggestion.shopName}</span> - {updateModal.suggestion.city}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (opzionale)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Aggiungi eventuali note..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUpdateModal(null);
                  setNotes('');
                }}
                disabled={updating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  updateModal.newStatus === 'CONTACTED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updating ? 'Aggiornamento...' : 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSuggestions;
