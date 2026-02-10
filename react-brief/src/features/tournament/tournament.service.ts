// I file .service.ts contengono classi dedicate alla logica di business, alla gestione dei dati e alla comunicazione con backend esterni (API) 
// In questo caso, TournamentService si occupa di tutte le operazioni legate ai tornei, come la lista, la creazione e l'inizializzazione dei tornei.

import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";
import { type Tournament, type TournamentStatus } from "./tournament.type";

// Service centralizzato per tutte le chiamate API relative ai tornei
// (lista, creazione, aggiornamento, eliminazione, completamento, filtri per stato)
export class TournamentService {
  
  static async list(): Promise<Tournament[]> {
    const tournaments = await myFetch<Tournament[]>(`${myEnv.backendApiUrl}/tournaments`);
    return tournaments; 
  }

  // Restituisce i tornei filtrati per stato (pending, in_progress, completed)
  // Usato per separare pagina "Tornei" e "Storico tornei".
  static async listByStatus(status: TournamentStatus): Promise<Tournament[]> {
    const tournaments = await myFetch<Tournament[]>(
      `${myEnv.backendApiUrl}/tournaments/status/${status}`
    );
    return tournaments;
  }

  static async get(id: number): Promise<Tournament> {
    const tournament = await myFetch<Tournament>(`${myEnv.backendApiUrl}/tournaments/${id}`);
    return tournament;
  }

  // Creazione torneo: accettiamo almeno il nome, e opzionalmente anche la data
  static async create({ name, date }: { name: string; date?: string }): Promise<Tournament> {
    const newTournament = await myFetch<Tournament>(`${myEnv.backendApiUrl}/tournaments`, {
      method: 'POST',
      body: JSON.stringify({ name, date })
    });
    return newTournament;
  }
  
  static async update({ id, name }: { id: number, name: string }): Promise<Tournament> {
    const updatedTournament = await myFetch<Tournament>(`${myEnv.backendApiUrl}/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    return updatedTournament;
  }

    // Elimina un torneo esistente
    static async delete(id: number): Promise<void> {
    await myFetch(`${myEnv.backendApiUrl}/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  // Segna il torneo come completato sul backend impostando anche la squadra vincente
  // Endpoint: POST /tournaments/{id}/complete
  static async completeTournament(id: number, winnerTeamId: number): Promise<Tournament> {
    const updatedTournament = await myFetch<Tournament>(
      `${myEnv.backendApiUrl}/tournaments/${id}/complete`,
      {
        method: "POST",
        body: JSON.stringify({ winner_team_id: winnerTeamId }),
      }
    );
    return updatedTournament;
  }

}
