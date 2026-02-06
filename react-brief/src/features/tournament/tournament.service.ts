// I file .service.ts contengono classi dedicate alla logica di business, alla gestione dei dati e alla comunicazione con backend esterni (API) 
// In questo caso, TournamentService si occupa di tutte le operazioni legate ai tornei, come la lista, la creazione e l'inizializzazione dei tornei.

import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";
import {   type Tournament } from "./tournament.type";

export class TournamentService {
  
  static async list(): Promise<Tournament[]> {
    const tournaments = await myFetch<Tournament[]>(`${myEnv.backendApiUrl}/tournaments`);
    return tournaments; 
  }

  static async get(id: number): Promise<Tournament> {
    const tournament = await myFetch<Tournament>(`${myEnv.backendApiUrl}/tournaments/${id}`);
    return tournament;
  }

  static async create({ name }: { name: string }): Promise<Tournament> {
    const newTournament = await myFetch<Tournament>(`${myEnv.backendApiUrl}/tournaments`, {
      method: 'POST',
      body: JSON.stringify({ name })
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

    static async delete(id: number): Promise<void> {
    await myFetch(`${myEnv.backendApiUrl}/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

}
