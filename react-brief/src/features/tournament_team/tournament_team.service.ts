import type { TournamentTeam } from "./tournament_team.type";

const API_URL = import.meta.env.VITE_API_URL;

export class TournamentTeamService {
  async list(): Promise<TournamentTeam[]> {
    const res = await fetch(`${API_URL}/tournamentteams`);
    if (!res.ok) throw new Error("Errore nel recupero dei tournament team");
    return res.json();
  }
  // Altri metodi CRUD se necessario
};
