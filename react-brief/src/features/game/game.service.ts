import type { Game } from "./game.type";

const API_URL = import.meta.env.VITE_API_URL;

export class GameService {
  static async list(): Promise<Game[]> {
    const res = await fetch(`${API_URL}/games`);
    if (!res.ok) throw new Error("Errore nel recupero dei game");
    return res.json();
  }
  // Altri metodi CRUD se necessario
};

// import { serverBoxToBox, type Box, type ServerBox } from "@/features/box/box.type";
// import { myFetch } from "@/lib/backend";
// import myEnv from "@/lib/env";

// export class BoxService {
//     static async list(categoryId?: number): Promise<Box[]> {
//         const boxes = await myFetch<ServerBox[]>(`${myEnv.backendApiUrl}/boxes${categoryId ? "?category_id=" + categoryId : ""}`);
//         return boxes.map(serverBoxToBox);
//     }

//     static async get(id: number): Promise<Box | undefined> {
//         const box = await myFetch<ServerBox>(`${myEnv.backendApiUrl}/boxes/${id}`);
//         return serverBoxToBox(box);
//     }
// }