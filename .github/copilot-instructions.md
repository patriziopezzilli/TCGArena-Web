# TCG Arena Web - Copilot Instructions

## Project Overview
Modern React landing page and merchant onboarding platform for TCG Arena. Ultra minimal design inspired by Linear.app with white/light theme.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **API**: Axios for HTTP requests
- **Backend**: Spring Boot REST API

## Design Principles
- Ultra minimal, clean white theme
- Smooth animations and transitions
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Fast loading times

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (Landing, MerchantOnboarding)
├── services/      # API service layer
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Main app component with routing
```

## API Integration
- Base URL: `http://localhost:8080/api`
- Endpoints:
  - `POST /merchants/register` - Merchant registration + shop creation
  - Authentication handled via JWT tokens

## Code Style
- Use functional components with hooks
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Conventional commits for Git messages
