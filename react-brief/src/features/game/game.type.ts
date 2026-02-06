// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione
// In questo caso, game.type.ts definisce il tipo Game, che rappresenta la struttura dei dati di un game all'interno del torneo, con campi come id, id_round, team1_id, team2_id, goals_team1, goals_team2 e winner_team_id.


export type Game = {
	id: number;
	idRound: number;
	team1Id: number | null;
	team2Id: number | null;
	goalsTeam1: number | null;
	goalsTeam2: number | null;
	winnerTeamId: number | null;
};

export type ServerGame = {
	id : number;
	id_round : number;
	team1_id : number | null;
	team2_id : number | null;
	goals_team1 : number | null;
	goals_team2 : number | null;
	winner_team_id : number | null;
}

export function serverGameToGame(input: ServerGame): Game {
	return {
		...input,
		idRound: input.id_round,
		team1Id: input.team1_id,
		team2Id: input.team2_id,
		goalsTeam1: input.goals_team1,
		goalsTeam2: input.goals_team2,
		winnerTeamId: input.winner_team_id,
	};
}

export function gameToServerGame(input: Omit<Partial<Game>, "id">): Omit<Partial<ServerGame>, "id"> {
	return {
		...input,
		id_round: input.idRound,
		team1_id: input.team1Id,
		team2_id: input.team2Id,
		goals_team1: input.goalsTeam1,
		goals_team2: input.goalsTeam2,
		winner_team_id: input.winnerTeamId,
	};
}