// I file .service.ts contengono classi dedicate alla logica di business, alla gestione dei dati e alla comunicazione con backend esterni (API). 
// In questo caso, RoundService si occupa di tutte le operazioni legate ai round dei tornei, come la creazione, la lista e l'inizializzazione dei round per un torneo specifico.


import { serverRoundToRound, type Round, type ServerRound } from "./round.type";
import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";

export class RoundService {
  static async list(): Promise<Round[]> {
    const rounds = await myFetch<ServerRound[]>(`${myEnv.backendApiUrl}/rounds`);
    return rounds.map(serverRoundToRound);
  }


  static async get(id: number): Promise<Round> {
    const round = await myFetch<ServerRound>(`${myEnv.backendApiUrl}/rounds/${id}`);
    return serverRoundToRound(round);
  }

  static async update({ id, data }: { id: number, data: Omit<Partial<Round>, 'id'> }): Promise<Round> {
    const updatedRound = await myFetch<ServerRound>(`${myEnv.backendApiUrl}/rounds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return serverRoundToRound(updatedRound);
  }

  static async create({ data }: { data: Omit<Round, 'id'> }): Promise<Round> {
    const newRound = await myFetch<ServerRound>(`${myEnv.backendApiUrl}/rounds`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return serverRoundToRound(newRound);
  }

  static async delete(id: number): Promise<void> {
    await myFetch(`${myEnv.backendApiUrl}/rounds/${id}`, {
      method: 'DELETE',
    });
  }

  
}



