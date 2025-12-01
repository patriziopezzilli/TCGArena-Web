import axios from 'axios'
import type { MerchantRegistrationRequest, MerchantRegistrationResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
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

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/merchant/profile')
    return response.data
  },
}

export const adminService = {
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
}

export default apiClient
