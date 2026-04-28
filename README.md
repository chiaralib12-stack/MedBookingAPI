# MedBookingAPI

MedBooking è un'applicazione web full-stack sviluppata per la gestione digitale delle prenotazioni di visite mediche in un contesto sanitario.

Il sistema consente a pazienti, medici e amministratori di interagire attraverso un'interfaccia web, automatizzando il processo di prenotazione e migliorando l'organizzazione delle attività.

---

## Funzionalità principali

### Paziente
- Registrazione e login
- Ricerca dei medici per specializzazione
- Visualizzazione degli slot disponibili
- Prenotazione di visite
- Consultazione delle proprie prenotazioni

### Medico
- Accesso alla dashboard personale
- Visualizzazione calendario appuntamenti
- Consultazione delle prenotazioni giornaliere
- Cancellazione appuntamenti

### Amministratore
- Gestione dei medici
- Inserimento disponibilità e ferie
- Visualizzazione statistiche
- Consultazione utenti e appuntamenti

---

## Architettura

L’applicazione è sviluppata secondo un’architettura **client-server**:

- **Frontend:** React + Material UI
- **Backend:** Python + Flask
- **Database:** SQLite
- **Autenticazione:** JWT (JSON Web Token)

La comunicazione tra front-end e back-end avviene tramite API REST con formato JSON.

---

## API

Le API seguono i principi REST e gestiscono:

- Autenticazione utenti
- Gestione medici
- Prenotazioni
- Disponibilità e ferie
- Funzionalità amministrative

Il file di documentazione API è disponibile nella root del progetto:

`medbooking_openapi.yaml`

Può essere aperto tramite Swagger Editor o altri strumenti compatibili con OpenAPI.