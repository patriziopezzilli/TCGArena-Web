# Sistema di Attivazione Shop - TCG Arena

## Overview

Il sistema di registrazione e attivazione merchant è stato implementato con le seguenti caratteristiche:

1. **Registrazione Merchant** → Shop creato con `active = false`
2. **Verifica Manuale** → Admin attiva lo shop
3. **Backoffice Merchant** → Dashboard condizionale basata su status shop

---

## Backend Changes

### 1. Shop Entity (`Shop.java`)

Aggiunto campo `active`:

```java
@Column(nullable = false)
private Boolean active = false;
```

**Default:** `false` - il negozio non è visibile nell'app fino all'attivazione manuale.

### 2. ShopRepository (`ShopRepository.java`)

Aggiunte query:

```java
List<Shop> findByActiveTrue(); // Solo shop attivi
Optional<Shop> findByOwnerId(Long ownerId); // Shop per merchant
```

### 3. ShopService (`ShopService.java`)

Due metodi distinti:

- `getAllShops()` → Ritorna solo shop con `active = true` (per app pubblica)
- `getAllShopsIncludingInactive()` → Tutti gli shop (per backoffice admin)
- `getShopByOwnerId(Long ownerId)` → Shop del merchant specifico

### 4. MerchantBackofficeController (`MerchantBackofficeController.java`)

Nuovi endpoint:

```
GET /api/merchant/shop/status
GET /api/merchant/profile
```

**Response `/shop/status`:**
```json
{
  "shop": { ... },
  "active": true/false,
  "verified": true/false,
  "user": { ... }
}
```

---

## Frontend Web - Backoffice Merchant

### Nuove Pagine

#### 1. `/merchant/login` (`MerchantLogin.tsx`)
- Login per merchant
- Salva token JWT in `localStorage.merchant_token`
- Redirect a `/merchant/dashboard`

#### 2. `/merchant/dashboard` (`MerchantDashboard.tsx`)

**Due stati possibili:**

##### A. Shop NON Attivo (`active = false`)
Mostra:
- ⏳ Status "In attesa di approvazione"
- Informazioni negozio registrato
- Messaggio: "Il nostro team sta verificando le informazioni"
- **Nessuna funzionalità attiva**

##### B. Shop Attivo (`active = true`)
Dashboard completa con:
- Quick stats (inventario, prenotazioni, tornei, richieste)
- 4 sezioni operative:
  - **Gestione Inventario** (UC-A2)
  - **Prenotazioni** con QR scanner (UC-A2)
  - **Tornei** (creazione e gestione) (UC-A2)
  - **Richieste Clienti** (UC-A2)

---

## Flusso Completo

### 1. Registrazione Merchant

```
POST /api/auth/register-merchant
```

**Request:**
```json
{
  "username": "merchant1",
  "email": "merchant@shop.it",
  "password": "password123",
  "displayName": "Mario Rossi",
  "shopName": "Il Mio Negozio TCG",
  "address": "Via Roma 1",
  "city": "Milano",
  "zipCode": "20100",
  "phone": "+39 123456789",
  "description": "Negozio di carte collezionabili"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "merchant1",
    "isMerchant": true,
    "shopId": 1
  },
  "shop": {
    "id": 1,
    "name": "Il Mio Negozio TCG",
    "active": false,  // ← NON ATTIVO
    "verified": false
  },
  "token": "eyJhbGc..."
}
```

### 2. Login Merchant

```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "merchant1",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "...",
  "user": { ... }
}
```

### 3. Verifica Status Shop

```
GET /api/merchant/shop/status
Authorization: Bearer eyJhbGc...
```

**Response (Shop NON attivo):**
```json
{
  "shop": {
    "id": 1,
    "name": "Il Mio Negozio TCG",
    "active": false,
    "verified": false
  },
  "active": false,
  "verified": false,
  "user": { ... }
}
```

**Response (Shop attivo):**
```json
{
  "shop": {
    "id": 1,
    "name": "Il Mio Negozio TCG",
    "active": true,
    "verified": true
  },
  "active": true,
  "verified": true,
  "user": { ... }
}
```

### 4. Attivazione Manuale (Admin)

**TODO:** Endpoint admin per attivare shop:

```sql
UPDATE shops SET active = true WHERE id = 1;
```

Oppure tramite endpoint (da implementare):
```
PATCH /api/admin/shops/{id}/activate
```

---

## API Pubbliche (App iOS)

### Get All Shops
```
GET /api/shops
```

**Comportamento:**
- Ritorna SOLO shop con `active = true`
- Shop non attivi NON sono visibili nell'app

---

## TODO - Prossimi Step

### Task 5: Implementare funzionalità merchant dashboard

Secondo i requisiti UC-A2, implementare:

#### A. Gestione Inventario
- CRUD carte
- Mass update prezzi
- Versioning/audit log
- Prevenzione overbooking

#### B. Prenotazioni
- QR scanner per ritiri
- Validazione prenotazione
- Scadenza automatica
- Notifiche push

#### C. Tornei
- Creazione tornei
- Gestione iscrizioni
- Matchmaking Swiss/Bracket
- Inserimento risultati
- Standings real-time

#### D. Richieste Clienti
- Lista richieste
- Thread messaggi
- Cambio stato (pending/accepted/rejected/completed)
- Notifiche push

---

## Security

### Autenticazione
- JWT token con refresh token
- Token salvato in `localStorage.merchant_token`
- Interceptor axios aggiunge header `Authorization: Bearer {token}`

### Autorizzazioni
- Endpoint `/api/merchant/*` richiedono:
  - Token JWT valido
  - `user.isMerchant = true`
  
### Protezione Route Frontend
- `MerchantDashboard` verifica token all'avvio
- Redirect a `/merchant/login` se token mancante/invalido

---

## Database Migration

### Aggiungere campo `active` a tabella `shops`:

```sql
ALTER TABLE shops ADD COLUMN active BOOLEAN NOT NULL DEFAULT false;
```

### Attivare shop esistenti (se necessario):

```sql
UPDATE shops SET active = true WHERE verified = true;
```

---

## Testing

### 1. Registrazione Merchant
```bash
curl -X POST http://localhost:8080/api/auth/register-merchant \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testmerchant",
    "email": "test@shop.it",
    "password": "password123",
    "displayName": "Test Merchant",
    "shopName": "Test Shop",
    "address": "Via Test 1",
    "city": "Milano",
    "zipCode": "20100",
    "phone": "+39 1234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testmerchant",
    "password": "password123"
  }'
```

### 3. Verifica Status
```bash
curl -X GET http://localhost:8080/api/merchant/shop/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Attivazione Shop (SQL diretto)
```sql
UPDATE shops SET active = true WHERE name = 'Test Shop';
```

### 5. Verifica Shop Pubblici
```bash
curl -X GET http://localhost:8080/api/shops
# Dovrebbe ritornare SOLO shop con active=true
```

---

## Note Implementative

1. **Shop creato = NON attivo** → `active = false` by default
2. **Admin verifica** → Controlla info, poi `UPDATE shops SET active = true`
3. **Merchant login** → Vede status pending o dashboard completa
4. **API pubbliche** → Filtrano solo `active = true`
5. **Notifica email** → TODO: Inviare email quando shop viene attivato

---

## Prossimi Sviluppi

1. **Admin Panel** per gestire shop in attesa
2. **Email notifications** per merchant quando shop attivato
3. **Implementazione completa UC-A2** (inventario, prenotazioni, tornei, richieste)
4. **Real-time updates** con WebSocket/SSE per tornei live
5. **Mobile app integration** con backend completo
