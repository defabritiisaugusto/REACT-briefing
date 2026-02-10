## Panoramica progetto

Applicazione frontend per la gestione di tornei di calcio (o sport simili),
sviluppata con **React + TypeScript + Vite** e componenti **shadcn/ui**.

Il progetto permette di:
- gestire squadre (creazione/lista/eliminazione lato backend);
- creare tornei con nome, data, luogo e selezione delle squadre partecipanti;
- giocare un tabellone a 8 squadre (quarti → semifinali → finale) lato frontend;
- segnare il torneo come concluso salvando nel backend lo stato e la squadra vincente;
- visualizzare separatamente tornei attivi e storico dei tornei conclusi.

## Stack tecnico

- **Framework**: React 18
- **Linguaggio**: TypeScript
- **Bundler/Dev server**: Vite
- **UI kit**: shadcn/ui + Tailwind CSS
- **Data fetching**: TanStack Query (React Query)
- **Backend**: API PHP esterne (progetto `brief_tournament`), con modelli `Tournament`, `Team`, `TournamentTeam` ecc.

## Struttura principale

Cartelle più importanti del frontend:

- `src/pages`
	- `HomePage.tsx`: pagina iniziale.
	- `TournamentListPage.tsx`: lista tornei **attivi** (status diverso da `completed`).
	- `TournamentCreatePage.tsx`: form per creare un nuovo torneo e selezionare fino a 8 squadre.
	- `TournamentBracketPage.tsx`: tabellone a 8 squadre (quarti, semifinali, finale).
	- `TournamentHistoryPage.tsx`: storico tornei (status = `completed`), con indicazione della squadra vincente.
	- `TeamListPage.tsx`: lista squadre con possibilità di eliminazione.

- `src/features`
	- `tournament/`
		- `tournament.type.ts`: tipo `Tournament` con campi `id`, `name`, `date`, `place`, `status`, `winner_team_id` e relazione opzionale `winnerTeam`.
		- `tournament.service.ts`: tutte le chiamate API per i tornei (`list`, `listByStatus`, `create`, `update`, `delete`, `completeTournament`).
	- `team/`
		- `team.type.ts`: tipo `Team`.
		- `team.service.ts`: chiamate API per le squadre.
	- `tournament_team/`
		- `tournament_team.type.ts` e `tournament_team.service.ts`: gestiscono le iscrizioni delle squadre nei tornei.

- `src/layouts/MainLayout.tsx`
	- Layout principale con la navbar e link a: Home, Organizza, Tornei, Storico tornei, Squadre.

## Flusso tornei

1. **Creazione torneo**
	 - Dalla pagina `Organizza` (`TournamentCreatePage`) inserisci nome, data e selezioni le squadre partecipanti.
	 - Il frontend chiama il backend per creare il torneo e poi crea i record di iscrizione (`TournamentTeam`).

2. **Lista tornei attivi**
	 - `TournamentListPage` usa `TournamentService.list()` e filtra i tornei con `status !== "completed"`.
	 - Da qui puoi entrare nel dettaglio/bracket o eliminare un torneo.

3. **Bracket (tabellone)**
	 - `TournamentBracketPage` legge:
		 - tornei dal backend (`TournamentService.list()`),
		 - iscrizioni (`TournamentTeamService.listByTournament`),
		 - squadre (`TeamService.list()`).
	 - Costruisce un array di nomi squadra e sceglie automaticamente 8 squadre in ordine casuale per i quarti.
	 - I risultati delle singole partite (gol) vengono gestiti **solo in stato React** (non salvati nel backend).

4. **Completamento torneo**
	 - Quando la finale ha un vincitore chiaro, il frontend trova la `Team` corrispondente e chiama:
		 - `TournamentService.completeTournament(tournamentId, winnerTeamId)`
	 - Il backend aggiorna il torneo:
		 - `status = 'completed'`
		 - `winner_team_id = ID della squadra vincente`

5. **Storico tornei**
	 - `TournamentHistoryPage` legge solo i tornei con `status = 'completed'` tramite `TournamentService.listByStatus("completed")`.
	 - Carica anche tutte le squadre (`TeamService.list()`) e mostra: nome torneo, luogo, data e testo
		 "Torneo vinto da: {nome squadra vincente}" usando `winner_team_id`.

## Integrazione con il backend PHP

Il frontend non ha un backend Node integrato: parla con un backend PHP (`brief_tournament`) attraverso HTTP.

Endpoint principali utilizzati:

- `GET /tournaments` – lista tornei.
- `GET /tournaments/status/{status}` – tornei filtrati per stato (`pending`, `in_progress`, `completed`).
- `POST /tournaments` – crea un nuovo torneo.
- `PUT /tournaments/{id}` – aggiorna un torneo.
- `DELETE /tournaments/{id}` – elimina un torneo.
- `POST /tournaments/{id}/complete` – segna il torneo come completato, impostando `winner_team_id`.
- `GET /teams` – lista squadre.
- `GET /tournamentteams/by-tournament/{id}` – iscrizioni di un torneo.

Il backend espone anche modelli come `Tournament`, `Team`, `TournamentTeam` con un piccolo ORM custom (`BaseModel`, `HasRelations`, `WithValidate`).

## Comandi principali

Da dentro la cartella del progetto React (`react-brief`):

```bash
# installa le dipendenze
npm install

# avvia l'ambiente di sviluppo
npm run dev

# build di produzione
npm run build

# (opzionale) anteprima build
npm run preview
```

Assicurati che il backend PHP sia in esecuzione sull'URL configurato in `src/lib/env.ts`
(`backendApiUrl`), altrimenti le chiamate API falliranno.

