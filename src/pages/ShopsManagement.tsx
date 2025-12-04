import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { Shop } from '../types/api';

const ShopsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Shop>>({});
  const geocodingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllShops();
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description,
      address: shop.address,
      latitude: shop.latitude,
      longitude: shop.longitude,
      phoneNumber: shop.phoneNumber,
      email: shop.email,
      websiteUrl: shop.websiteUrl,
      instagramUrl: shop.instagramUrl,
      facebookUrl: shop.facebookUrl,
      twitterUrl: shop.twitterUrl,
      type: shop.type || 'PHYSICAL_STORE',
      openingHours: shop.openingHours,
      openingDays: shop.openingDays,
      active: shop.active,
      isVerified: shop.isVerified,
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingShop(null);
    setFormData({});
    // Clear any pending geocoding timeout
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
      geocodingTimeoutRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    try {
      await adminService.updateShop(editingShop.id, formData);
      await fetchShops();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating shop:', error);
      showToast('Errore durante l\'aggiornamento del negozio', 'error');
    }
  };

  const handleInputChange = (field: keyof Shop, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Trigger geocoding with debounce when address changes and seems complete
    if (field === 'address' && value && value.trim().length > 8) {
      // Check if address seems complete (has comma or number)
      const hasComma = value.includes(',');
      const hasNumber = /\d+/.test(value);
      
      if (hasComma || hasNumber) {
        if (geocodingTimeoutRef.current) {
          clearTimeout(geocodingTimeoutRef.current);
        }
        geocodingTimeoutRef.current = setTimeout(() => {
          geocodeAddress(value); // Silent geocoding
        }, 1000); // Wait 1 second after user stops typing
      }
    }
  };

  const geocodeAddress = useCallback(async (address: string) => {
    if (!address || address.trim() === '') {
      return;
    }

    try {
      // Usa Nominatim (OpenStreetMap) per il geocoding - gratuito e senza API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=IT`
      );

      if (!response.ok) {
        throw new Error('Errore nella richiesta di geocoding');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Silent error handling - no toast for automatic geocoding
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Caricamento negozi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Gestione Negozi</h2>
        <div className="text-sm text-gray-600">
          Totale negozi: {shops.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Shop Header with Photo */}
            <div className="relative h-32 bg-gray-100 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-gray-900 text-center px-4">{shop.name}</h3>
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  shop.active 
                    ? 'bg-green-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  {shop.active ? '✓ Attivo' : '⏳ In Attesa'}
                </span>
              </div>
            </div>

            {/* Shop Details */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{shop.address}</p>
                  </div>
                </div>

                {/* Contact */}
                {shop.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📞</span>
                    </div>
                    <p className="text-sm text-gray-900">{shop.phoneNumber}</p>
                  </div>
                )}

                {/* Hours */}
                {shop.openingHours && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">🕒</span>
                    </div>
                    <p className="text-sm text-gray-900">{shop.openingHours}</p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex gap-2 pt-2">
                  {shop.websiteUrl && (
                    <a
                      href={shop.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Sito web"
                    >
                      <span className="text-sm">🌐</span>
                    </a>
                  )}
                  {shop.instagramUrl && (
                    <a
                      href={shop.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors"
                      title="Instagram"
                    >
                      <span className="text-sm">📷</span>
                    </a>
                  )}
                  {shop.facebookUrl && (
                    <a
                      href={shop.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      title="Facebook"
                    >
                      <span className="text-sm">📘</span>
                    </a>
                  )}
                  {shop.twitterUrl && (
                    <a
                      href={shop.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors"
                      title="Twitter"
                    >
                      <span className="text-sm">🐦</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(shop)}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Modifica Negozio
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {shops.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nessun negozio trovato
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Modifica Negozio: {editingShop.name}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Informazioni Base</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Negozio *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Negozio *
                    </label>
                    <select
                      value={formData.type || ''}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    >
                      <option value="PHYSICAL_STORE">Negozio Fisico</option>
                      <option value="ONLINE_STORE">Negozio Online</option>
                      <option value="HYBRID">Ibrido</option>
                      <option value="LOCAL_STORE">Locale</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active || false}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Negozio Attivo</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Indirizzo</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Indirizzo *
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                      placeholder="Via Roma 123, Milano"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Contatti</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sito Web
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl || ''}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Social Media</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.instagramUrl || ''}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://www.instagram.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.facebookUrl || ''}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://www.facebook.com/pagename"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      value={formData.twitterUrl || ''}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Orari di Apertura</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orari
                    </label>
                    <input
                      type="text"
                      value={formData.openingHours || ''}
                      onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="es. 9:00-19:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giorni
                    </label>
                    <input
                      type="text"
                      value={formData.openingDays || ''}
                      onChange={(e) => handleInputChange('openingDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="es. Lun-Sab"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopsManagement;
