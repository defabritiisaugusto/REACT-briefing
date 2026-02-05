import { myFetch } from "@/lib/backend";
import { type ServerTeam, serverTeamToTeam, type Team } from "./team.type";
import myEnv from "@/lib/env";



export class TeamService {
  static async list(): Promise<Team[]> {
    const teams = await myFetch<ServerTeam[]>(`${myEnv.backendApiUrl}/teams`);
    return teams.map(serverTeamToTeam);
  }
  // Altri metodi CRUD se necessario
};
