# Setup Iniziale

## 1. Clona il repository

```bash
git clone https://github.com/patriziopezzilli/TCGArena-Web.git
cd TCGArena-Web
```

## 2. Installa le dipendenze

```bash
npm install
```

## 3. Configura le variabili d'ambiente

Copia il file `.env.example` in `.env`:

```bash
cp .env.example .env
```

Se necessario, modifica l'URL del backend in `.env`:

```bash
VITE_API_URL=http://localhost:8080/api
```

## 4. Avvia il server di sviluppo

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 5. Build per produzione

```bash
npm run build
```

I file compilati saranno nella cartella `dist/`

## 6. Anteprima build di produzione

```bash
npm run preview
```

---

## Credenziali di Test

### Admin Panel
- Username: `admin`
- Password: `start123`

### Merchant (dopo registrazione)
- Usa le credenziali create durante la registrazione su `/merchant/register`

---

## Troubleshooting

### Errore "Cannot connect to backend"
- Verifica che il backend Spring Boot sia in esecuzione su `http://localhost:8080`
- Controlla che `VITE_API_URL` in `.env` sia corretto

### Errore durante `npm install`
- Cancella `node_modules` e `package-lock.json`
- Riprova con `npm install`

### Porta 3000 già in uso
- Modifica `vite.config.ts` per usare una porta diversa
- Oppure termina il processo che usa la porta 3000
