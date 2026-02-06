// I file .service.ts contengono classi dedicate alla logica di business, alla gestione dei dati e alla comunicazione con backend esterni (API) 
// In questo caso, TeamService si occupa di tutte le operazioni legate alle squadre dei tornei, come la lista e la gestione delle squadre per un torneo specifico.


import { myFetch } from "@/lib/backend";
import { type Team } from "./team.type";
import myEnv from "@/lib/env";

export class TeamService {
  static async list(): Promise<Team[]> {
    const teams = await myFetch<Team[]>(`${myEnv.backendApiUrl}/teams`);
    return teams;
  }

  static async get(id: number): Promise<Team> {
    const team = await myFetch<Team>(`${myEnv.backendApiUrl}/teams/${id}`);
    return team;
  }


  static async update({ id, name }: { id: number, name: string }): Promise<Team> {
    const updateTeam = await myFetch<Team>(`${myEnv.backendApiUrl}/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    return updateTeam;
  }

  static async create({ id, name }: { id: number, name: string }): Promise<Team> {
    const newTeam = await myFetch<Team>(`${myEnv.backendApiUrl}/teams`, {
      method: 'POST',
      body: JSON.stringify({ id, name })
    });
    return newTeam;
  }


}
