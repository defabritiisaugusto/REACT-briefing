import type { Round } from "./round.type";

const API_URL = import.meta.env.VITE_API_URL;

export class RoundService {
  async list(): Promise<Round[]> {
    const res = await fetch(`${API_URL}/rounds`);
    if (!res.ok) throw new Error("Errore nel recupero dei round");
    return res.json();
  }
  // Altri metodi CRUD se necessario
};
