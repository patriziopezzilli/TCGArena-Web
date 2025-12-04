import axios from 'axios'
import type { MerchantRegistrationRequest, MerchantRegistrationResponse, Expansion, TCGSet, TCGStats } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
  async triggerBatchImport(tcgType: string, startIndex: number = -99, endIndex: number = -99): Promise<any> {
    const params = new URLSearchParams()
    if (startIndex !== -99) params.append('startIndex', startIndex.toString())
    if (endIndex !== -99) params.append('endIndex', endIndex.toString())
    const response = await apiClient.post(`/admin/import/${tcgType}?${params}`)
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

  async deleteExpansion(id: number): Promise<void> {
    await apiClient.delete(`/expansions/${id}`)
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

  async deleteSet(id: number): Promise<void> {
    await apiClient.delete(`/sets/${id}`)
  },
}

export default apiClient
