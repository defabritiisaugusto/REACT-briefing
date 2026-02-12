## Panoramica

Applicazione frontend per gestire tornei di calcio a 5 amichevoli in giornata (oneshot) ,
sviluppata con **React + TypeScript + Vite** e componenti **shadcn/ui**.

Con questa app possiamo:

- creare e gestire squadre;
- creare tornei con nome, data, luogo e squadre partecipanti;
- giocare un tabellone a 8 squadre (quarti → semifinali → finale);
- tenere traccia di stato torneo, round e partite;
- distinguere tra tornei attivi e tornei conclusi.

## Stack

- React 18
- TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- TanStack Query (React Query)

## Struttura

- `src/features/tournament`
  - tipi e service dei tornei;
  - `TournamentCreate` per creare un torneo + iscrivere le squadre;
  - `TournamentList` per vedere i tornei attivi;
  - `TournamentBracket` per gestire il tabellone a 8 squadre e salvare
    i risultati;
  - `TournamentHistory` per lo storico dei tornei conclusi.

- `src/features/team`
  - tipi e service delle squadre;
  - `TeamList` per lista/creazione/eliminazione squadre.

- `src/features/tournament_team`, `src/features/round`, `src/features/game`
  - tipi + service per iscrizioni, round e partite.

- `src/layouts/MainLayout.tsx`
  - layout principale con navbar (Home, Organizza, Tornei, Storico, Squadre)
    e sfondo a tema campo da calcio.

- `src/pages`
  - pagine "sottili" che leggono i parametri di routing e renderizzano
    i componenti di feature (es. `TournamentCreatePage`, `TournamentListPage`,
    `TournamentBracketPage`, `TournamentHistoryPage`, `TeamListPage`, `MainPage`).

## Flusso principale

1. **Creiamo le squadre** dalla pagina Squadre.
2. **Creiamo un torneo** scegliendo nome, data, luogo e fino a 8 squadre.
3. **Giochiamo il tabellone** (quarti → semifinali → finale) inserendo i gol.
4. Quando c'è un vincitore, il torneo viene segnato come completato e
   vengono salvati round e partite.
5. I tornei attivi compaiono nella lista Tornei, quelli conclusi nello Storico.

## Comandi principali

Da dentro la cartella del progetto React (`react-brief`):

```bash
# installa le dipendenze
npm install

# avvia l'ambiente di sviluppo
npm run dev



Assicurati che il backend PHP sia in esecuzione sull'URL configurato in `src/lib/env.ts`
(`backendApiUrl`), altrimenti le chiamate API falliranno.




