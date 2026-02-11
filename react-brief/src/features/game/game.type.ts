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

// ATTENZIONE: i nomi dei campi qui devono rispecchiare esattamente
// quelli usati dal backend / dal database.
// La colonna in Postgres è "id_team1" (NON "team1_id"), quindi il tipo
// server-side usa id_team1 / id_team2.
export type ServerGame = {
	id: number;
	id_round: number;
	id_team1: number | null;
	id_team2: number | null;
	goals_team1: number | null;
	goals_team2: number | null;
	winner_team_id: number | null;
};

export function serverGameToGame(input: ServerGame): Game {
	return {
		id: input.id,
		idRound: input.id_round,
		team1Id: input.id_team1,
		team2Id: input.id_team2,
		goalsTeam1: input.goals_team1,
		goalsTeam2: input.goals_team2,
		winnerTeamId: input.winner_team_id,
	};
}

// Per massima compatibilità con il backend attuale inviamo sia i campi
// con prefisso "id_" (es. id_team1) sia quelli con suffisso "_id"
// (es. team1_id). In questo modo il backend che si aspetta team1_id
// non va in errore, e la colonna id_team1 viene comunque popolata.
export function gameToServerGame(
	input: Omit<Partial<Game>, "id">
): any {
	const idRound = input.idRound ?? undefined;
	const team1Id = input.team1Id ?? undefined;
	const team2Id = input.team2Id ?? undefined;
	const goalsTeam1 = input.goalsTeam1 ?? undefined;
	const goalsTeam2 = input.goalsTeam2 ?? undefined;
	const winnerTeamId = input.winnerTeamId ?? undefined;

	return {
		id_round: idRound,
		id_team1: team1Id,
		id_team2: team2Id,
		team1_id: team1Id,
		team2_id: team2Id,
		goals_team1: goalsTeam1,
		goals_team2: goalsTeam2,
		winner_team_id: winnerTeamId,
	};
}