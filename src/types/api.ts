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

export interface Expansion {
  id: number
  title: string
  tcgType: string
  imageUrl?: string
  sets: TCGSet[]
  createdAt?: string
  updatedAt?: string
}

export interface TCGSet {
  id: number
  name: string
  setCode?: string
  imageUrl?: string
  releaseDate?: string
  cardCount?: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface TCGStats {
  tcgType: string
  expansions: number
  sets: number
  cards: number
}

export interface Shop {
  id: number
  name: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  phoneNumber: string
  websiteUrl?: string
  type: 'PHYSICAL_STORE' | 'ONLINE_STORE' | 'HYBRID' | 'LOCAL_STORE'
  isVerified: boolean
  active: boolean
  ownerId: number
  openingHours?: string
  openingDays?: string
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  email?: string
  photoBase64?: string
}

export interface APIError {
  message: string
  status: number
}

export type CardNationality = 'JPN' | 'ITA' | 'EN' | 'COR' | 'FRA' | 'GER' | 'SPA' | 'POR' | 'CHI' | 'RUS'

export interface CardNationalityInfo {
  code: CardNationality
  displayName: string
}
