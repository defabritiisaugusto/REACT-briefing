import {
  serverTournamentTeamToTournamentTeam,
  tournamentTeamToServerTournamentTeam,
  type TournamentTeam,
  type ServerTournamentTeam,
} from "./tournament_team.type";
import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";

// Service molto semplice per gestire le iscrizioni squadra–torneo
export class TournamentTeamService {
  // Tutte le squadre iscritte a un torneo
  static async listByTournament(tournamentId: number): Promise<TournamentTeam[]> {
    const data = await myFetch<ServerTournamentTeam[]>(
      `${myEnv.backendApiUrl}/tournament-teams/${tournamentId}/teams`
    );
    return data.map(serverTournamentTeamToTournamentTeam);
  }

  // Tutti i tornei a cui è iscritta una squadra
  static async listByTeam(teamId: number): Promise<TournamentTeam[]> {
    const data = await myFetch<ServerTournamentTeam[]>(
      `${myEnv.backendApiUrl}/tournament-teams/${teamId}/tournaments`
    );
    return data.map(serverTournamentTeamToTournamentTeam);
  }

  // Iscrive una squadra a un torneo
  static async create(
    params: {
      teamId: number;
      tournamentId: number;
      position: number;
      status?: string;
    }
  ): Promise<TournamentTeam> {
    const { teamId, tournamentId, position, status = "participating" } = params;

    const body = tournamentTeamToServerTournamentTeam({
      idTeam: teamId,
      idTournament: tournamentId,
      position,
      status,
    });

    const created = await myFetch<ServerTournamentTeam>(
      `${myEnv.backendApiUrl}/tournament-teams/${teamId}/tournaments/${tournamentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    return serverTournamentTeamToTournamentTeam(created);
  }

  // Rimuove una squadra da un torneo
  static async delete(teamId: number, tournamentId: number): Promise<void> {
    await myFetch<void>(
      `${myEnv.backendApiUrl}/tournament-teams/${teamId}/tournaments/${tournamentId}`,
      {
        method: "DELETE",
      }
    );
  }
}
