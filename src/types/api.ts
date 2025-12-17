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
  productType?: ProductType
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
  productType?: ProductType
  parentSetId?: number
  createdAt?: string
  updatedAt?: string
}

// Product type classification for cross-TCG filtering
export type ProductType =
  | 'BOOSTER_SET'
  | 'STARTER_DECK'
  | 'STRUCTURE_DECK'
  | 'SPECIAL_SET'
  | 'PREMIUM_PACK'
  | 'PROMO'
  | 'TIN'
  | 'BOX_SET'
  | 'THEME_BOOSTER'
  | 'MASTERS_SET'
  | 'COMMANDER_SET'
  | 'SUPPLEMENTAL'
  | 'STANDALONE_SET'
  | 'OTHER'

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

export interface TournamentParticipant {
  id: number
  tournamentId: number
  userId: number
  username: string
  displayName: string
  email: string
  registrationDate: string
  hasPaid: boolean
  status: 'REGISTERED' | 'WAITING_LIST' | 'CHECKED_IN'
  placement: any
  checkedInAt?: string
  checkInCode: string
}

export interface Tournament {
  id: string
  title: string
  tcgType: string
  type: 'CASUAL' | 'COMPETITIVE' | 'CHAMPIONSHIP'
  description: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: string
  startDate: string
  endDate: string
  status: 'PENDING_APPROVAL' | 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  location: TournamentLocation
  organizerId: number
  createdByUserId?: number
  approvedByUserId?: number
  approvalDate?: string
  rejectionReason?: string
  isRanked?: boolean
  externalRegistrationUrl?: string
}

export interface TournamentLocation {
  venueName: string
  address: string
  city: string
  country: string
}

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface ImportJob {
  id: string
  tcgType: string
  status: JobStatus
  progressPercent: number
  totalItems: number
  processedItems: number
  message: string
  startTime: string
  endTime?: string
}
