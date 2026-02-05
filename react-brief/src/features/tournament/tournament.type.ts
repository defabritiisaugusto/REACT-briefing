export type Tournament = {
    id: number;
	name: string;
	date: string;
	place: string;
}

export type ServerTournament = {
    id: number;
    name: string;
    date: string;
    place: string;
}

export function serverTournamentToTournament(input: ServerTournament): Tournament {
    return {
        id: input.id,
        name: input.name,
        date: input.date,
        place: input.place,
    };
}