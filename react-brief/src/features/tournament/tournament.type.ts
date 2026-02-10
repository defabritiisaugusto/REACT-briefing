// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione
// In questo caso, tournament.type.ts definisce il tipo Tournament, che rappresenta la struttura dei dati di un torneo, con campi come id, name, date e place. 
// Inoltre, contiene una funzione di utilità serverTournamentToTournament per convertire i dati del torneo ricevuti dal server (ServerTournament) in un formato più adatto all'uso all'interno dell'applicazione (Tournament).
import type { Team } from "../team/team.type";

// Stato del torneo gestito dal backend:
// - pending: creato ma non ancora iniziato
// - in_progress: in corso
// - completed: concluso con un vincitore
export type TournamentStatus = "pending" | "in_progress" | "completed";

// Rappresenta un torneo così come arriva dal backend
export type Tournament = {
	id: number;
	name: string;
	// Data e luogo possono essere opzionali nel backend, quindi li trattiamo come nullable
	date: string | null;
	place: string | null;
	// Stato del torneo: ci serve per separare lista attuale e storico
	status?: TournamentStatus | null;
	// ID della squadra vincitrice, impostato dal backend quando il torneo viene completato
	winner_team_id?: number | null;
	// Relazione opzionale caricata con eager loading (winnerTeam nel JSON del backend)
	winnerTeam?: Team | null;
};




