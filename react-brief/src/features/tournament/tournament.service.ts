import { myFetch } from "@/lib/backend";
import { type ServerTournament, serverTournamentToTournament, type Tournament } from "./tournament.type";
import myEnv from "@/lib/env";



export class TournamentService {
  
  async list(): Promise<Tournament[]> {
    const tournaments = await myFetch<ServerTournament[]>(`${myEnv.backendApiUrl}/tournaments`);
    return tournaments.map(serverTournamentToTournament);
  }
  // Altri metodi CRUD se necessario
};
