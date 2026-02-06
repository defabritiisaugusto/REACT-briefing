import type { TournamentTeam } from "./tournament_team.type";
import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";

export class TournamentTeamService {
  static async list(): Promise<TournamentTeam[]> {
    return myFetch<TournamentTeam[]>(`${myEnv.backendApiUrl}/tournament-teams`);
  }

 
static async get(id: number): Promise<TournamentTeam> {
  const tournamentTeam = await myFetch<TournamentTeam>(`${myEnv.backendApiUrl}/tournament-teams/${id}`)
  return ser
}


}
