export interface MerchantRegistrationRequest {
  // User data
  username: string
  email: string
  password: string
  displayName: string
  
  // Shop data
  shopName: string
  address: string
  city: string
  zipCode: string
  phone: string
  description?: string
}

export interface MerchantRegistrationResponse {
  user: {
    id: string
    username: string
    email: string
    displayName: string
    isMerchant: boolean
  }
  shop: {
    id: string
    name: string
    address: string
    city: string
    zipCode: string
    phone: string
    description?: string
  }
  token: string
}

export interface APIError {
  message: string
  status: number
}
