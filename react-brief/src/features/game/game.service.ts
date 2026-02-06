// I file .service.ts contengono classi dedicate alla logica di business, alla gestione dei dati e alla comunicazione con backend esterni (API) 
// In questo caso, GameService si occupa di tutte le operazioni legate ai game dei tornei, come la creazione, la lista e l'aggiornamento dei game per un torneo specifico.


import { gameToServerGame, serverGameToGame, type Game, type ServerGame } from "./game.type";
import { myFetch } from "@/lib/backend";
import myEnv from "@/lib/env";


export class GameService {
  static async list(): Promise<Game[]> {
    const games = await myFetch<ServerGame[]>(`${myEnv.backendApiUrl}/games`);
    return games.map(serverGameToGame);
  }

 static async get(id: number): Promise<Game> {
    const game = await myFetch<ServerGame>(`${myEnv.backendApiUrl}/games/${id}`);
    return serverGameToGame(game);
  }

  static async update({id, data}: {id: number, data: Omit<Partial<Game>, 'id'>}): Promise<Game> {
    const updatedGame = await myFetch<ServerGame>(`${myEnv.backendApiUrl}/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameToServerGame(data))
    });
    return serverGameToGame(updatedGame);
  }

  static async create({data}: {data: Omit<Game, 'id'>}): Promise<Game> {
    const newGame = await myFetch<ServerGame>(`${myEnv.backendApiUrl}/games`, {
      method: 'POST',
      body: JSON.stringify(gameToServerGame(data))
    });
    return serverGameToGame(newGame);
  }

  static async delete(id: number): Promise<void> {
    await myFetch(`${myEnv.backendApiUrl}/games/${id}`, {
      method: 'DELETE',
    });
  }
    
}
 

