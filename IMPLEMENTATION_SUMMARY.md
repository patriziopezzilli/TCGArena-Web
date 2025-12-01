# TCG Arena - Sistema Merchant con Attivazione Manuale

## ✅ Implementazione Completata

### Backend (Spring Boot)

#### 1. **Shop Entity - Campo Active**
- ✅ Aggiunto campo `active` (Boolean, default `false`)
- ✅ Shop creato in registrazione con `active = false`
- ✅ Getters/Setters per `active`

#### 2. **ShopRepository**
- ✅ `findByActiveTrue()` - Solo shop attivi per API pubbliche
- ✅ `findByOwnerId(Long ownerId)` - Shop del merchant specifico

#### 3. **ShopService**
- ✅ `getAllShops()` - Ritorna SOLO shop attivi (per app iOS)
- ✅ `getAllShopsIncludingInactive()` - Tutti gli shop (per admin)
- ✅ `getShopByOwnerId()` - Shop del merchant

#### 4. **MerchantBackofficeController** (NUOVO)
Endpoint protetti (richiede JWT + `isMerchant = true`):
- ✅ `GET /api/merchant/shop/status` - Status shop del merchant loggato
- ✅ `GET /api/merchant/profile` - Profilo merchant

#### 5. **JwtAuthenticationController**
- ✅ `POST /api/auth/register-merchant` - Registrazione merchant + shop
- ✅ Shop creato con `active = false` automaticamente
- ✅ Response con user, shop e JWT token

---

### Frontend Web (React + TypeScript)

#### 1. **API Service** (`api.ts`)
- ✅ `merchantService.register()` - Registrazione merchant
- ✅ `merchantService.login()` - Login merchant
- ✅ `merchantService.getShopStatus()` - Status shop
- ✅ `merchantService.getProfile()` - Profilo merchant
- ✅ Axios interceptor per JWT token automatico

#### 2. **Pagina Registrazione** (`/merchant/register`)
- ✅ Form completo (account + shop info)
- ✅ Validazione campi
- ✅ Salvataggio token JWT in localStorage
- ✅ Messaggio success con nota "in attesa di verifica"
- ✅ Redirect automatico a dashboard dopo 2 secondi

#### 3. **Pagina Login** (`/merchant/login`) - NUOVO
- ✅ Form login (username/password)
- ✅ Autenticazione via JWT
- ✅ Salvataggio token in localStorage
- ✅ Redirect a `/merchant/dashboard`
- ✅ Gestione errori

#### 4. **Pagina Dashboard** (`/merchant/dashboard`) - NUOVO

**Due stati condizionali:**

##### A. Shop NON Attivo (`active = false`)
```
┌─────────────────────────────────────────┐
│  ⏳ SHOP IN ATTESA DI APPROVAZIONE      │
├─────────────────────────────────────────┤
│  Il tuo negozio è stato registrato      │
│  con successo ma non è ancora attivo.   │
│  Il nostro team sta verificando         │
│  le informazioni fornite.               │
│                                          │
│  ┌───────────────────────────────────┐ │
│  │ Info Negozio:                     │ │
│  │ Nome: Il Mio Negozio TCG          │ │
│  │ Indirizzo: Via Roma 1, Milano     │ │
│  │ Telefono: +39 123456789           │ │
│  │ Status: ⏳ In attesa di verifica  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

##### B. Shop Attivo (`active = true`)
```
┌─────────────────────────────────────────┐
│  DASHBOARD Il Mio Negozio TCG           │
├─────────────────────────────────────────┤
│  [Inventario: 0] [Prenotazioni: 0]     │
│  [Tornei: 0]     [Richieste: 0]        │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Gestione    │  │ Prenotazioni │    │
│  │  Inventario  │  │  & QR Scan   │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Tornei     │  │   Richieste  │    │
│  │  (Gestione)  │  │   Clienti    │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

#### 5. **Routing** (`App.tsx`)
- ✅ `/` - Landing page
- ✅ `/merchant/register` - Registrazione merchant
- ✅ `/merchant/login` - Login merchant
- ✅ `/merchant/dashboard` - Dashboard merchant

#### 6. **Landing Page**
- ✅ Link "Accedi" → `/merchant/login`
- ✅ Bottone "Registra il negozio" → `/merchant/register`

---

## 🔄 Flusso Completo

### 1. Registrazione
```
Merchant → /merchant/register
         ↓
   Compila form (username, email, password, shop info)
         ↓
   POST /api/auth/register-merchant
         ↓
   Backend crea:
     - User (isMerchant=true)
     - Shop (active=false, verified=false)
         ↓
   Response: { user, shop, token }
         ↓
   Salva token in localStorage
         ↓
   Messaggio: "Shop in attesa di verifica"
         ↓
   Redirect → /merchant/dashboard (dopo 2s)
```

### 2. Login
```
Merchant → /merchant/login
         ↓
   Username + Password
         ↓
   POST /api/auth/login
         ↓
   Response: { token, user, refreshToken }
         ↓
   Salva token in localStorage
         ↓
   Redirect → /merchant/dashboard
```

### 3. Dashboard - Shop Pending
```
/merchant/dashboard
         ↓
   GET /api/merchant/shop/status (con JWT)
         ↓
   Response: { shop: { active: false }, ... }
         ↓
   Mostra schermata:
     "⏳ Shop in attesa di approvazione"
     + Info negozio
     + Nessuna funzionalità attiva
```

### 4. Attivazione Manuale (Admin)
```
Admin → Database o Admin Panel
         ↓
   UPDATE shops SET active = true WHERE id = X;
         ↓
   (Opzionale) Invia email notifica a merchant
```

### 5. Dashboard - Shop Attivo
```
/merchant/dashboard
         ↓
   GET /api/merchant/shop/status (con JWT)
         ↓
   Response: { shop: { active: true }, ... }
         ↓
   Mostra dashboard completa:
     - Quick stats
     - Gestione inventario
     - Prenotazioni con QR scan
     - Tornei
     - Richieste clienti
```

---

## 🔒 Security

### JWT Authentication
- Token salvato in `localStorage.merchant_token`
- Axios interceptor aggiunge `Authorization: Bearer {token}` automaticamente
- Endpoint `/api/merchant/*` protetti (richiede autenticazione)

### Autorizzazioni
- Endpoint merchant verificano `user.isMerchant = true`
- Dashboard frontend verifica token all'avvio
- Redirect automatico a `/merchant/login` se non autenticato

---

## 📱 API Pubbliche (App iOS)

### GET /api/shops
**Comportamento:**
- Ritorna SOLO shop con `active = true`
- Shop in pending NON sono visibili nell'app
- Shop disattivati NON appaiono in lista

**Esempio Response:**
```json
[
  {
    "id": 1,
    "name": "Negozio TCG Milano",
    "address": "Via Roma 1, Milano 20100",
    "active": true,
    "verified": true
  }
  // Shop con active=false NON inclusi
]
```

---

## 🗄️ Database Migration

### SQL da eseguire:

```sql
-- Aggiungere campo active a tabella shops
ALTER TABLE shops ADD COLUMN active BOOLEAN NOT NULL DEFAULT false;

-- (Opzionale) Attivare shop già verificati
UPDATE shops SET active = true WHERE verified = true;
```

---

## 📋 Testing Manuale

### 1. Test Registrazione
```bash
curl -X POST http://localhost:8080/api/auth/register-merchant \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testshop",
    "email": "test@shop.it",
    "password": "password123",
    "displayName": "Test Shop Owner",
    "shopName": "Test TCG Shop",
    "address": "Via Test 1",
    "city": "Milano",
    "zipCode": "20100",
    "phone": "+39 1234567890",
    "description": "Negozio di test"
  }'
```

**Verifica Response:**
- ✅ `user.isMerchant = true`
- ✅ `shop.active = false`
- ✅ Token JWT presente

### 2. Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testshop",
    "password": "password123"
  }'
```

### 3. Test Shop Status (Pending)
```bash
TOKEN="eyJhbGc..."  # Token dal login

curl -X GET http://localhost:8080/api/merchant/shop/status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "shop": {
    "id": 1,
    "name": "Test TCG Shop",
    "active": false,
    "verified": false
  },
  "active": false,
  "verified": false,
  "user": { ... }
}
```

### 4. Test Attivazione Shop
```sql
-- Eseguire nel database
UPDATE shops SET active = true WHERE name = 'Test TCG Shop';
```

### 5. Test Shop Status (Active)
```bash
curl -X GET http://localhost:8080/api/merchant/shop/status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "shop": {
    "active": true,
    "verified": false
  },
  "active": true,
  ...
}
```

### 6. Test API Pubblica
```bash
curl -X GET http://localhost:8080/api/shops
```

**Expected:**
- SOLO shop con `active = true`
- Shop pending NON presenti

---

## 🚀 Next Steps (Task 5)

### Implementare funzionalità merchant dashboard

Secondo requisiti UC-A2:

#### A. **Gestione Inventario**
- [ ] CRUD carte (POST, GET, PATCH, DELETE)
- [ ] Upload foto carte
- [ ] Filtri e ricerca
- [ ] Mass update prezzi
- [ ] Audit log versioning

#### B. **Prenotazioni**
- [ ] Lista prenotazioni
- [ ] QR code scanner (frontend)
- [ ] Validazione prenotazione (PATCH /reservation/{id}/validate)
- [ ] Conferma ritiro (PATCH /reservation/{id}/pickup)
- [ ] Sistema punti automatico
- [ ] Scadenza automatica (cron job)

#### C. **Tornei**
- [ ] Creazione torneo (POST /tournaments)
- [ ] Modifica/elimina torneo
- [ ] Lista iscritti
- [ ] Matchmaking Swiss/Bracket
- [ ] Inserimento risultati
- [ ] Standings real-time
- [ ] Notifiche push

#### D. **Richieste Clienti**
- [ ] Lista richieste
- [ ] Thread messaggi
- [ ] Upload foto
- [ ] Cambio stato (pending → accepted/rejected/completed)
- [ ] Notifiche push

---

## 📝 Note Implementative

1. ✅ Shop creato con `active = false` by default
2. ✅ Admin deve attivare manualmente (`UPDATE shops SET active = true`)
3. ✅ API pubbliche filtrano solo shop attivi
4. ✅ Dashboard condizionale (pending vs active)
5. ⏳ TODO: Admin panel per gestione shop
6. ⏳ TODO: Email notification quando shop attivato
7. ⏳ TODO: Implementazione completa UC-A2

---

## 🎯 Files Modificati/Creati

### Backend
- ✅ `Shop.java` - Aggiunto campo `active`
- ✅ `ShopRepository.java` - Query filtrate
- ✅ `ShopService.java` - Metodi pubblici/admin separati
- ✅ `MerchantBackofficeController.java` - **NUOVO**
- ✅ `JwtAuthenticationController.java` - Endpoint register-merchant
- ✅ `MerchantRegistrationRequestDTO.java` - **NUOVO**
- ✅ `MerchantRegistrationResponseDTO.java` - **NUOVO**

### Frontend Web
- ✅ `api.ts` - Servizi merchant
- ✅ `MerchantLogin.tsx` - **NUOVO**
- ✅ `MerchantDashboard.tsx` - **NUOVO**
- ✅ `MerchantOnboarding.tsx` - Aggiornato (redirect dashboard)
- ✅ `Landing.tsx` - Link login aggiunto
- ✅ `App.tsx` - Routes aggiunte
- ✅ `MERCHANT_ACTIVATION_SYSTEM.md` - **NUOVO** (documentazione)

---

## ✅ Sistema Pronto!

Il sistema di attivazione merchant è completo e funzionante. 

**Prossimo step:** Implementare le funzionalità operative del merchant (inventario, prenotazioni, tornei, richieste) come da Task 5.
