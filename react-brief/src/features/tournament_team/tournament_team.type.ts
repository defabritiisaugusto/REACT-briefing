// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione
// In questo caso, tournament_team.type.ts definisce il tipo TournamentTeam, che rappresenta la relazione tra un torneo e una squadra, con campi come id_tournament, id_team, position e status.


export type TournamentTeam = {
	id: number,
	idTournament: number;
	idTeam: number;
	position: number;
	status: string; // partecipante, eliminato, vincitore
};

export type ServerTournamentTeam = {
	id: number,
	id_tournament: number;
	id_team: number;
	position: number;
	status: string; // partecipante, eliminato, vincitore
}

export function serverTournamentTeamToTournamentTeam(input: ServerTournamentTeam): TournamentTeam {
	return {
		...input,
		idTournament: input.id_tournament,
		idTeam: input.id_team,	
	};
}

export function tournamentTeamToServerTournamentTeam(input: Omit<Partial<TournamentTeam>, "id" >): Omit<Partial<ServerTournamentTeam>, "id"> {
	return {
		id_tournament: input.idTournament,
		id_team: input.idTeam,
		position: input.position,
		status: input.status,
	};
}