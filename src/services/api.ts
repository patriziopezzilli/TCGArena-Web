import axios from 'axios'
import type { MerchantRegistrationRequest, MerchantRegistrationResponse, Expansion, TCGSet, TCGStats, TournamentParticipant } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tcgarena.it/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Client pubblico senza autenticazione per endpoint pubblici
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('merchant_token')
  console.log('🔑 Token found:', token ? 'YES' : 'NO')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('📤 Sending Authorization header:', config.headers.Authorization?.substring(0, 20) + '...')
  } else {
    console.log('⚠️ No token in localStorage')
  }
  return config
})

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log or handle errors in a way that could cause infinite loops
    // Just return the error as-is
    return Promise.reject(error)
  }
)

export const merchantService = {
  async register(data: MerchantRegistrationRequest): Promise<MerchantRegistrationResponse> {
    const response = await apiClient.post<MerchantRegistrationResponse>('/auth/register-merchant', data)
    return response.data
  },

  async searchUnverifiedShops(query: string): Promise<any[]> {
    const response = await publicApiClient.get(`/shops/public/unverified/search?q=${query}`)
    return response.data
  },

  async login(username: string, password: string): Promise<{ token: string; user: any; refreshToken: string }> {
    const response = await apiClient.post('/auth/login', { username, password })
    return response.data
  },

  async getShopStatus(): Promise<{ shop: any; active: boolean; verified: boolean; user: any }> {
    const response = await apiClient.get('/merchant/shop/status')
    return response.data
  },

  async getDashboardStats(): Promise<{
    inventoryCount: number;
    activeReservations: number;
    upcomingTournaments: number;
    pendingRequests: number;
    subscriberCount: number;
  }> {
    const response = await apiClient.get('/merchant/dashboard/stats')
    return response.data
  },

  async getMerchantNotifications(): Promise<{
    items: Array<{
      id: string;
      type: 'TOURNAMENT_TODAY' | 'TOURNAMENT_UPCOMING' | 'PENDING_REQUEST' | 'ACTIVE_RESERVATION' | 'UNREAD_MESSAGE';
      title: string;
      message: string;
      link: string;
      timestamp: string;
      urgent: boolean;
    }>;
    totalCount: number;
  }> {
    const response = await apiClient.get('/merchant/dashboard/notifications')
    return response.data
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/merchant/profile')
    return response.data
  },

  // Inventory endpoints
  async getInventory(shopId: string, filters?: any): Promise<any> {
    const params = new URLSearchParams({ shopId, ...filters })
    const response = await apiClient.get(`/inventory?${params}`)
    return response.data
  },

  async createInventoryCard(data: any): Promise<any> {
    const response = await apiClient.post('/inventory', data)
    return response.data
  },

  async updateInventoryCard(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/inventory/${id}`, data)
    return response.data
  },

  async deleteInventoryCard(id: string): Promise<void> {
    await apiClient.delete(`/inventory/${id}`)
  },

  // Bulk Import endpoints
  async downloadInventoryTemplate(): Promise<Blob> {
    const response = await apiClient.get('/inventory/template', { responseType: 'blob' })
    return response.data
  },

  async bulkImportInventory(shopId: string, file: File): Promise<{
    totalRows: number
    successCount: number
    errorCount: number
    errors: string[]
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/inventory/bulk-import?shopId=${shopId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async submitCustomImportRequest(shopId: string, file: File, notes?: string): Promise<{
    requestId: number
    message: string
    estimatedProcessingTime: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    if (notes) formData.append('notes', notes)
    const response = await apiClient.post(`/inventory/import-request?shopId=${shopId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Bulk Add endpoints
  async bulkAddBySet(data: {
    shopId: number
    setCode: string
    condition: string
    quantity: number
    price: number
    nationality?: string
  }): Promise<{
    totalRows: number
    successCount: number
    errorCount: number
    errors: string[]
    message: string
  }> {
    const response = await apiClient.post('/inventory/bulk-add-by-set', data)
    return response.data
  },

  async bulkAddByExpansion(data: {
    shopId: number
    expansionId: number
    condition: string
    quantity: number
    price: number
    nationality?: string
  }): Promise<{
    totalRows: number
    successCount: number
    errorCount: number
    errors: string[]
    message: string
  }> {
    const response = await apiClient.post('/inventory/bulk-add-by-expansion', data)
    return response.data
  },

  async bulkAddByTemplates(data: {
    shopId: number
    templateIds: number[]
    condition: string
    quantity: number
    price: number
    nationality?: string
  }): Promise<{
    totalRows: number
    successCount: number
    errorCount: number
    errors: string[]
    message: string
  }> {
    const response = await apiClient.post('/inventory/bulk-add-by-templates', data)
    return response.data
  },


  // Reservation endpoints
  async getReservations(shopId: string, status?: string): Promise<any> {
    const params = new URLSearchParams({ shopId })
    if (status) params.append('status', status)
    const response = await apiClient.get(`/reservations/merchant?${params}`)
    return response.data
  },

  async validateReservation(shopId: string, qrCode: string): Promise<any> {
    const response = await apiClient.post(`/reservations/validate?shopId=${shopId}`, { qrCode })
    return response.data
  },

  async validateReservationById(shopId: string, reservationId: string): Promise<any> {
    const response = await apiClient.put(`/reservations/${reservationId}/validate?shopId=${shopId}`)
    return response.data
  },

  // Tournament endpoints
  async getTournaments(): Promise<any> {
    const response = await apiClient.get('/tournaments')
    return response.data
  },

  async createTournament(data: any): Promise<any> {
    const response = await apiClient.post('/tournaments', data)
    return response.data
  },

  async updateTournament(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/tournaments/${id}`, data)
    return response.data
  },

  async deleteTournament(id: string): Promise<void> {
    await apiClient.delete(`/tournaments/${id}`)
  },

  // Customer Request endpoints
  async getRequests(shopId: string, filters?: any): Promise<any> {
    const params = new URLSearchParams({ shopId, ...filters })
    const response = await apiClient.get(`/requests?${params}`)
    return response.data
  },

  async updateRequestStatus(id: string, shopId: string, status: string, response?: string): Promise<any> {
    const res = await apiClient.put(`/requests/${id}/status?shopId=${shopId}`, { status, response })
    return res.data
  },

  async getRequestMessages(id: string): Promise<any> {
    const response = await apiClient.get(`/requests/${id}/messages`)
    return response.data
  },

  async sendMessage(id: string, message: string): Promise<any> {
    // Get shopId from localStorage
    const user = localStorage.getItem('merchant_user')
    if (!user) throw new Error('Merchant user not found')

    const userData = JSON.parse(user)
    const shopId = userData.shopId

    if (!shopId) throw new Error('Shop ID not found')

    const response = await apiClient.post(`/requests/${id}/messages/merchant?shopId=${shopId}`, { message })
    return response.data
  },

  async markRequestAsRead(id: string): Promise<any> {
    const response = await apiClient.post(`/requests/${id}/read`)
    return response.data
  },

  // Shop subscription endpoints
  async getShopSubscribers(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/shops/${shopId}/subscribers`)
    return response.data
  },

  async getSubscriberCount(shopId: string): Promise<{ count: number }> {
    const response = await apiClient.get(`/shops/${shopId}/subscriber-count`)
    return response.data
  },

  async sendShopNotification(shopId: string, title: string, message: string): Promise<any> {
    const response = await apiClient.post(`/notifications/shop/${shopId}/broadcast`, { title, message })
    return response.data
  },

  async updateShop(shopData: any): Promise<any> {
    const response = await apiClient.put('/merchant/shop', shopData)
    return response.data
  },

  async uploadShopPhoto(photoBase64: string): Promise<any> {
    const response = await apiClient.post('/merchant/shop/photo', { photoBase64 })
    return response.data
  },

  // Reservation settings endpoints
  async getReservationSettings(shopId: string): Promise<{ reservationDurationMinutes: number; defaultDurationMinutes: number }> {
    const response = await apiClient.get(`/shops/${shopId}/reservation-settings`)
    return response.data
  },

  async updateReservationSettings(shopId: string, settings: { reservationDurationMinutes: number }): Promise<any> {
    const response = await apiClient.put(`/shops/${shopId}/reservation-settings`, settings)
    return response.data
  },

  // Card Templates endpoints
  async searchCardTemplates(filters?: {
    tcgType?: string;
    expansionId?: number;
    setCode?: string;
    rarity?: string;
    q?: string;
    page?: number;
    size?: number;
  }): Promise<any> {
    const params = new URLSearchParams()
    if (filters?.tcgType) params.append('tcgType', filters.tcgType)
    if (filters?.expansionId) params.append('expansionId', filters.expansionId.toString())
    if (filters?.setCode) params.append('setCode', filters.setCode)
    if (filters?.rarity) params.append('rarity', filters.rarity)
    if (filters?.q) params.append('q', filters.q)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())

    const response = await publicApiClient.get(`/cards/templates/search/advanced?${params}`)
    return response.data
  },

  async getTCGTypes(): Promise<string[]> {
    const response = await publicApiClient.get('/cards/templates/filters/tcg-types')
    return response.data
  },

  async getRarities(): Promise<string[]> {
    const response = await publicApiClient.get('/cards/templates/filters/rarities')
    return response.data
  },

  async getSetCodes(): Promise<string[]> {
    const response = await publicApiClient.get('/cards/templates/filters/set-codes')
    return response.data
  },

  async getExpansions(): Promise<any[]> {
    const response = await publicApiClient.get('/expansions')
    return response.data
  },

  // Tournament participants endpoints
  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    const response = await apiClient.get(`/tournaments/${tournamentId}/participants/detailed`)
    return response.data
  },

  async addTournamentParticipant(tournamentId: string, userIdentifier: string): Promise<any> {
    const response = await apiClient.post(`/tournaments/${tournamentId}/participants`, { userIdentifier })
    return response.data
  },

  async registerManualParticipant(tournamentId: string, data: { firstName: string, lastName: string, email?: string }): Promise<any> {
    const response = await apiClient.post(`/tournaments/${tournamentId}/participants/manual`, data)
    return response.data
  },

  async startTournament(tournamentId: string): Promise<any> {
    const response = await apiClient.post(`/tournaments/${tournamentId}/start`)
    return response.data
  },

  async removeParticipant(tournamentId: string, participantId: string): Promise<void> {
    await apiClient.delete(`/tournaments/${tournamentId}/participants/${participantId}`)
  },

  async completeTournament(tournamentId: string, placements: { participantId: number, placement: number }[]): Promise<any> {
    const response = await apiClient.post(`/tournaments/${tournamentId}/complete`, { placements })
    return response.data
  },

  // ========== NEWS MANAGEMENT ==========
  async getShopNews(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/merchant/shops/${shopId}/news`)
    return response.data
  },

  async getActiveNews(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/merchant/shops/${shopId}/news/active`)
    return response.data
  },

  async getFutureNews(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/merchant/shops/${shopId}/news/future`)
    return response.data
  },

  async getExpiredNews(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/merchant/shops/${shopId}/news/expired`)
    return response.data
  },

  async createNews(shopId: string, data: {
    title: string
    content: string
    newsType: string
    startDate?: string
    expiryDate?: string
    imageUrl?: string
    isPinned?: boolean
  }): Promise<any> {
    const response = await apiClient.post(`/merchant/shops/${shopId}/news`, data)
    return response.data
  },

  async updateNews(shopId: string, newsId: string, data: {
    title?: string
    content?: string
    newsType?: string
    startDate?: string
    expiryDate?: string
    imageUrl?: string
    isPinned?: boolean
  }): Promise<any> {
    const response = await apiClient.put(`/merchant/shops/${shopId}/news/${newsId}`, data)
    return response.data
  },

  async deleteNews(shopId: string, newsId: string): Promise<void> {
    await apiClient.delete(`/merchant/shops/${shopId}/news/${newsId}`)
  },

  // ========== TOURNAMENT LIVE UPDATES ==========
  async getTournamentUpdates(tournamentId: number): Promise<any[]> {
    const response = await apiClient.get(`/tournaments/${tournamentId}/updates`)
    return response.data
  },

  async addTournamentUpdate(tournamentId: number, data: {
    message?: string
    imageBase64?: string
  }): Promise<any> {
    const response = await apiClient.post(`/tournaments/${tournamentId}/updates`, data)
    return response.data
  },

  async deleteTournamentUpdate(tournamentId: number, updateId: number): Promise<void> {
    await apiClient.delete(`/tournaments/${tournamentId}/updates/${updateId}`)
  },

  async getTournamentUpdateCount(tournamentId: number): Promise<number> {
    const response = await apiClient.get(`/tournaments/${tournamentId}/updates/count`)
    return response.data.count
  },

  // Tournament Request & Approval endpoints
  async requestTournament(data: {
    title: string
    description?: string
    tcgType: string
    type: string
    startDate: string
    maxParticipants: number
    entryFee: number
    prizePool?: string
    shopId: number
  }): Promise<any> {
    const response = await apiClient.post('/tournaments/request', data)
    return response.data
  },

  async approveTournament(tournamentId: number): Promise<any> {
    const response = await apiClient.put(`/tournaments/${tournamentId}/approve`)
    return response.data
  },

  async rejectTournament(tournamentId: number, reason: string): Promise<any> {
    const response = await apiClient.put(`/tournaments/${tournamentId}/reject`, { reason })
    return response.data
  },

  async getPendingTournamentRequests(): Promise<any[]> {
    console.log('Calling GET /tournaments/pending-requests')
    const response = await apiClient.get('/tournaments/pending-requests')
    console.log('Response:', response.data)
    return response.data
  },
}

export const adminService = {
  // ========== SHOPS MANAGEMENT ==========
  async getAllShops(): Promise<any[]> {
    const response = await apiClient.get('/admin/shops')
    return response.data
  },

  async getPendingShops(): Promise<any[]> {
    const response = await apiClient.get('/admin/shops/pending')
    return response.data
  },

  async getShopStats(): Promise<{ total: number; active: number; pending: number; verified: number }> {
    const response = await apiClient.get('/admin/shops/stats')
    return response.data
  },

  async activateShop(shopId: number): Promise<any> {
    const response = await apiClient.post(`/admin/shops/${shopId}/activate`)
    return response.data
  },

  async deactivateShop(shopId: number): Promise<any> {
    const response = await apiClient.post(`/admin/shops/${shopId}/deactivate`)
    return response.data
  },

  async updateShop(shopId: number, shopData: any): Promise<any> {
    const response = await apiClient.put(`/admin/shops/${shopId}`, shopData)
    return response.data
  },

  // ========== PARTNERS MANAGEMENT ==========
  async getAllPartners(): Promise<any[]> {
    const response = await apiClient.get('/partners/all')
    return response.data
  },

  async createPartner(partnerData: any): Promise<any> {
    const response = await apiClient.post('/partners', partnerData)
    return response.data
  },

  async updatePartner(partnerData: any): Promise<any> {
    const response = await apiClient.post('/partners', partnerData)
    return response.data
  },

  async deletePartner(partnerId: number): Promise<any> {
    const response = await apiClient.delete(`/partners/${partnerId}`)
    return response.data
  },

  // ========== REWARDS MANAGEMENT ==========
  async getAllRewards(): Promise<any[]> {
    const response = await apiClient.get('/rewards')
    return response.data
  },

  async createReward(rewardData: any): Promise<any> {
    const response = await apiClient.post('/admin/rewards', rewardData)
    return response.data
  },

  async updateReward(rewardId: number, rewardData: any): Promise<any> {
    const response = await apiClient.put(`/admin/rewards/${rewardId}`, rewardData)
    return response.data
  },

  async deleteReward(rewardId: number): Promise<any> {
    const response = await apiClient.delete(`/admin/rewards/${rewardId}`)
    return response.data
  },

  // ========== REWARD FULFILLMENT MANAGEMENT ==========
  async getAllRewardTransactions(): Promise<any[]> {
    const response = await apiClient.get('/rewards/admin/transactions')
    return response.data
  },

  async getPendingFulfillments(): Promise<any[]> {
    const response = await apiClient.get('/rewards/admin/transactions/pending')
    return response.data
  },

  async updateRewardTransaction(transactionId: number, updates: {
    status?: string
    voucherCode?: string
    trackingNumber?: string
  }): Promise<any> {
    const response = await apiClient.put(`/rewards/admin/transactions/${transactionId}`, updates)
    return response.data
  },

  // ========== ACHIEVEMENTS MANAGEMENT ==========
  async getAllAchievements(): Promise<any[]> {
    const response = await apiClient.get('/achievements')
    return response.data
  },

  async createAchievement(achievementData: any): Promise<any> {
    const response = await apiClient.post('/admin/achievements', achievementData)
    return response.data
  },

  async updateAchievement(achievementId: number, achievementData: any): Promise<any> {
    const response = await apiClient.put(`/admin/achievements/${achievementId}`, achievementData)
    return response.data
  },

  async deleteAchievement(achievementId: number): Promise<any> {
    const response = await apiClient.delete(`/admin/achievements/${achievementId}`)
    return response.data
  },

  // ========== BATCH IMPORT ==========
  async triggerJustTCGImport(tcgType: string): Promise<{
    success: boolean
    message: string
    tcgType: string
    jobId: string
  }> {
    const response = await apiClient.post(`/batch/justtcg/${tcgType}`)
    return response.data
  },

  async getImportJobStatus(jobId: string): Promise<import('../types/api').ImportJob> {
    const response = await apiClient.get(`/batch/jobs/${jobId}`)
    return response.data
  },

  async getJustTCGSupportedTypes(): Promise<{ supportedTypes: string[], count: number }> {
    const response = await apiClient.get('/batch/justtcg/supported')
    return response.data
  },

  async getCardTemplateCounts(): Promise<Record<string, number>> {
    const response = await apiClient.get('/admin/card-templates/counts')
    return response.data
  },

  // ========== EXPANSIONS MANAGEMENT ==========
  async getAllExpansions(): Promise<Expansion[]> {
    const response = await publicApiClient.get('/expansions')
    return response.data
  },

  async getTCGStatistics(): Promise<TCGStats[]> {
    const response = await publicApiClient.get('/expansions/stats')
    return response.data
  },

  async getExpansionById(id: number): Promise<Expansion> {
    const response = await publicApiClient.get(`/expansions/${id}`)
    return response.data
  },

  async createExpansion(expansionData: Omit<Expansion, 'id' | 'sets' | 'createdAt' | 'updatedAt'>): Promise<Expansion> {
    const response = await apiClient.post('/expansions', expansionData)
    return response.data
  },

  async updateExpansion(id: number, expansionData: Partial<Omit<Expansion, 'id' | 'sets' | 'createdAt' | 'updatedAt'>>): Promise<Expansion> {
    const response = await apiClient.put(`/expansions/${id}`, expansionData)
    return response.data
  },

  async deleteExpansion(id: number, force: boolean = false): Promise<any> {
    const response = await apiClient.delete(`/expansions/${id}?force=${force}`)
    return response
  },

  // ========== TCG SETS MANAGEMENT ==========
  async createSet(setData: Omit<TCGSet, 'id' | 'createdAt' | 'updatedAt'> & { expansionId: number }): Promise<TCGSet> {
    const response = await apiClient.post('/sets', setData)
    return response.data
  },

  async updateSet(id: number, setData: Partial<Omit<TCGSet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TCGSet> {
    const response = await apiClient.put(`/sets/${id}`, setData)
    return response.data
  },

  async deleteSet(id: number, force: boolean = false): Promise<any> {
    const response = await apiClient.delete(`/sets/${id}?force=${force}`)
    return response
  },

  // ========== IMAGE SYNC MANAGEMENT ==========
  async syncImages(filters?: { tcgType?: string; year?: number }): Promise<any> {
    const params = new URLSearchParams()
    if (filters?.tcgType) params.append('tcgType', filters.tcgType)
    if (filters?.year) params.append('year', filters.year.toString())

    const response = await apiClient.post(`/admin/images/sync?${params.toString()}`)
    return response.data
  },

  async getSyncStatus(): Promise<string> {
    const response = await apiClient.get('/admin/images/status')
    return response.data
  },
}

export default apiClient
