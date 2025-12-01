# TCG Arena Web

Modern React landing page and merchant backoffice platform for TCG Arena.

## ✨ Features

- 🌐 **Landing Page** - Ultra minimal design showcasing platform benefits for players and merchants
- 📝 **Merchant Registration** - Complete onboarding flow for TCG shop owners
- 🔐 **Merchant Login** - JWT-based authentication
- 📊 **Merchant Dashboard** - Conditional dashboard based on shop activation status
- 🎯 **Shop Activation System** - Manual verification workflow before shop goes live

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for routing
- **React Hook Form** for form handling
- **Axios** for API requests

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- TCG Arena Backend running on `http://localhost:8080`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🗺️ Routes

- `/` - Landing page
- `/merchant/register` - Merchant registration
- `/merchant/login` - Merchant login
- `/merchant/dashboard` - Merchant dashboard (protected route)

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
│   ├── Landing.tsx              # Landing page
│   ├── MerchantOnboarding.tsx   # Registration form
│   ├── MerchantLogin.tsx        # Login page
│   └── MerchantDashboard.tsx    # Dashboard (conditional)
├── services/       # API service layer
│   └── api.ts      # Axios client + merchant services
├── types/          # TypeScript type definitions
│   └── api.ts      # API request/response types
└── App.tsx         # Main app with routing
```

## API Integration

The app connects to the Spring Boot backend at `http://localhost:8080/api`

### Endpoints Used

- `POST /api/auth/register-merchant` - Merchant registration + shop creation
- `POST /api/auth/login` - Merchant login (JWT)
- `GET /api/merchant/shop/status` - Shop status (active/pending)
- `GET /api/merchant/profile` - Merchant profile

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8080/api
```

## 🎯 Features

### Landing Page
- Ultra minimal design inspired by Linear.app
- Hero section with CTA
- Feature showcase for players (find cards, reserve, tournaments, rewards, collection)
- Merchant benefits section
- Italian language throughout

### Merchant Registration
- Multi-section form (Account + Shop Info)
- Real-time validation with React Hook Form
- JWT token saved to localStorage
- Automatic redirect to dashboard
- Success message with "pending verification" notice

### Merchant Login
- Simple username/password form
- JWT authentication
- Token persistence
- Error handling
- Redirect to dashboard

### Merchant Dashboard

**Two conditional states:**

#### 1. Shop NOT Active (Pending)
- Shows "⏳ In attesa di approvazione" message
- Displays shop information
- No operational features enabled
- Waiting for admin approval

#### 2. Shop Active
- Full dashboard with quick stats
- 4 operational sections:
  - **Inventory Management** (UC-A2)
  - **Reservations** with QR scanner (UC-A2)
  - **Tournaments** management (UC-A2)
  - **Customer Requests** (UC-A2)

## 🔐 Authentication

- JWT token stored in `localStorage.merchant_token`
- Axios interceptor adds `Authorization: Bearer {token}` header automatically
- Protected routes redirect to `/merchant/login` if not authenticated

## 📚 Documentation

- `README_MERCHANT_SYSTEM.md` - Complete guide to merchant system
- `MERCHANT_ACTIVATION_SYSTEM.md` - Technical details of activation system
- `IMPLEMENTATION_SUMMARY.md` - Full implementation summary
- `BACKEND_API.md` - Backend API specifications

## 🚀 Deployment

Build for production:

```bash
npm run build
```

Files will be in `dist/` folder, ready to deploy to any static hosting service.

## 📝 License

Private project - TCG Arena
- Responsive design

### Merchant Onboarding
- Two-step registration form
- Account creation (username, email, password)
- Shop setup (name, address, contact info)
- Form validation with React Hook Form
- Error handling and success states

## Design Principles

- Ultra minimal, clean white theme
- Smooth transitions and animations
- Mobile-first responsive
- Accessibility focused (WCAG 2.1 AA)
