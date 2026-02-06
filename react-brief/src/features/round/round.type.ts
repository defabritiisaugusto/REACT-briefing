// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione. 
// In questo caso, round.type.ts definisce il tipo Round, che rappresenta la struttura dei dati di un round all'interno del torneo, con campi come id, id_tournament, name e status.


export type Round = {
	id: number;
	idTournament: number;
	name: string; // "Quarti di finale", "Semifinali", "Finale"
	status: 'pending' | 'in_progress' | 'completed';
};

export type ServerRound = {
	id: number;
	id_tournament: number;
	name: string; // "Quarti di finale", "Semifinali", "Finale"
	status: 'pending' | 'in_progress' | 'completed';
};

export function serverRoundToRound(input: ServerRound): Round {
	return {
		...input,
		idTournament: input.id_tournament,
	};
}

export function roundToServerRound(input: Omit<Partial<Round>, "id">): Omit<Partial<ServerRound>, "id"> {
	return {
		...input,
		id_tournament: input.idTournament,
	};
}
