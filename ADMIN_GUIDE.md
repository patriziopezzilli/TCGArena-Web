# 🔐 Guida Admin Panel - TCG Arena

## Accesso Admin

### Credenziali
- **Username**: `admin`
- **Password**: `start123`

### Login
1. Vai su `http://localhost:3000/merchant/login`
2. Inserisci le credenziali admin
3. Verrai reindirizzato alla dashboard admin

---

## 🎯 Dashboard Admin

### Panoramica
La dashboard admin mostra:
- **Statistiche globali**: Totale negozi, attivi, in attesa, verificati
- **Lista shop pending**: Negozi in attesa di approvazione
- **Azioni disponibili**: Attivazione/dettagli shop

### Statistiche Visualizzate

```
┌────────────────────────────────────────────────────┐
│  Total Negozi  │  Attivi  │  In Attesa  │ Verificati │
│      12       │    8     │      4      │     10     │
└────────────────────────────────────────────────────┘
```

---

## ✅ Approvazione Shop

### Workflow
1. **Visualizza shop pending**
   - Ogni shop mostra: nome, indirizzo, telefono, tipo, owner ID, descrizione

2. **Attiva shop**
   - Click su "✓ Attiva Negozio"
   - Conferma azione
   - Shop diventa attivo e visibile nell'app iOS

3. **Risultato**
   - Shop scompare dalla lista pending
   - Counter "In Attesa" decrementato
   - Counter "Attivi" incrementato
   - Shop visibile in `GET /api/shops` (API pubblica)

---

## 📊 Dati Shop Visualizzati

Per ogni shop in pending viene mostrato:

```
┌─────────────────────────────────────────────────┐
│ Nome Negozio                    [In Attesa]     │
├─────────────────────────────────────────────────┤
│ Indirizzo: Via Roma 1, Milano 20100             │
│ Telefono: +39 123456789                         │
│ Tipo: LOCAL_STORE                               │
│ Owner ID: #42                                   │
│ Descrizione: Negozio specializzato in Magic    │
│                                                 │
│          [✓ Attiva Negozio]  [Dettagli]        │
└─────────────────────────────────────────────────┘
```

---

## 🔄 API Endpoints Utilizzati

### GET `/api/admin/shops/stats`
Ritorna statistiche aggregate:
```json
{
  "total": 12,
  "active": 8,
  "pending": 4,
  "verified": 10
}
```

### GET `/api/admin/shops/pending`
Ritorna lista shop con `active = false`:
```json
[
  {
    "id": 5,
    "name": "TCG Shop Milano",
    "address": "Via Roma 1, Milano 20100",
    "phoneNumber": "+39 123456789",
    "type": "LOCAL_STORE",
    "active": false,
    "isVerified": false,
    "ownerId": 42
  }
]
```

### POST `/api/admin/shops/{id}/activate`
Attiva uno shop:
```json
{
  "success": true,
  "message": "Shop activated successfully",
  "shop": {
    "id": 5,
    "active": true,
    "isVerified": true,
    ...
  }
}
```

---

## 🚀 Come Usare

### Scenario Completo

1. **Merchant si registra**
   ```
   /merchant/register → Shop creato (active=false)
   ```

2. **Admin controlla pending**
   ```
   Login come admin → Dashboard mostra 1 shop pending
   ```

3. **Admin verifica info**
   ```
   Controlla: nome, indirizzo, telefono, descrizione
   ```

4. **Admin approva**
   ```
   Click "✓ Attiva Negozio" → Conferma
   Shop attivato (active=true, verified=true)
   ```

5. **Shop visibile nell'app**
   ```
   GET /api/shops → Include il nuovo shop
   App iOS → Merchant visibile nella lista negozi
   ```

6. **Merchant può operare**
   ```
   Login merchant → Dashboard completa
   Accesso a: inventario, prenotazioni, tornei, richieste
   ```

---

## 🔒 Sicurezza

### Credenziali Hardcoded
⚠️ **Nota**: Le credenziali admin sono attualmente hardcoded nel frontend.

**Per produzione**, implementare:
1. Backend con ruolo `ADMIN` nel database
2. Endpoint `/api/auth/login` che verifica ruolo
3. JWT con claim `role: "ADMIN"`
4. Protezione endpoint admin con `@PreAuthorize("hasRole('ADMIN')")`

### Implementazione Produzione

```java
// UserService.java
public boolean isAdmin(User user) {
    return user.getRole() == UserRole.ADMIN;
}

// AdminController.java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/shops/pending")
public ResponseEntity<?> getPendingShops() {
    // ...
}
```

---

## 📝 Note Importanti

1. **Persistenza Login**
   - Admin rimane loggato fino a logout manuale
   - Flag salvato in `localStorage.is_admin`

2. **Ricarica Automatica**
   - Dopo attivazione, lista si aggiorna automaticamente
   - Statistiche aggiornate in tempo reale

3. **Conferma Azioni**
   - Prima di attivare shop, viene richiesta conferma
   - Previene attivazioni accidentali

4. **Gestione Errori**
   - Se API fallisce, mostra messaggio errore
   - Possibilità di riprovare senza ricaricare pagina

---

## 🛠️ Testing

### Test Manuale Completo

```bash
# 1. Backend in esecuzione
cd "TCG Arena - Backend"
./mvnw spring-boot:run

# 2. Frontend in esecuzione
cd "TCG Arena - Web"
npm run dev

# 3. Registra un merchant di test
# http://localhost:3000/merchant/register

# 4. Login come admin
# http://localhost:3000/merchant/login
# Username: admin
# Password: start123

# 5. Verifica shop pending
# Dashboard admin dovrebbe mostrare il nuovo shop

# 6. Attiva shop
# Click "✓ Attiva Negozio"

# 7. Verifica nell'app
# GET http://localhost:8080/api/shops
# Dovrebbe includere il nuovo shop
```

---

## 💡 Miglioramenti Futuri

1. **Ricerca e Filtri**
   - Ricerca per nome shop
   - Filtro per tipo (LOCAL_STORE, ONLINE_STORE, etc.)
   - Ordinamento per data registrazione

2. **Dettagli Shop**
   - Modal con info complete merchant
   - Storico attivazioni/disattivazioni
   - Note admin

3. **Azioni Batch**
   - Seleziona multipli shop
   - Attiva/disattiva in batch
   - Export CSV

4. **Notifiche**
   - Email automatica al merchant quando attivato
   - Webhook per integrazioni esterne

5. **Audit Log**
   - Tracciamento chi ha attivato/disattivato
   - Timestamp azioni
   - Motivazioni disattivazione

---

## 🆘 Troubleshooting

### Admin non vede shop pending
- Verifica che ci siano shop con `active = false` nel DB
- Check query SQL: `SELECT * FROM shops WHERE active = false;`

### Errore "Shop not found" durante attivazione
- Verifica che lo shop esista: `SELECT * FROM shops WHERE id = X;`
- Controlla log backend per dettagli

### Logout non funziona
- Cancella manualmente localStorage: DevTools → Application → Local Storage → Clear

---

**Admin Panel pronto all'uso!** 🚀
