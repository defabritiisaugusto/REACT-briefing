export type Team = {
	id: number;
	name: string;
	img: string;
}

export type ServerTeam = {
	id: number;
	name: string;
	img: string;
}

export function serverTeamToTeam(input: ServerTeam): Team {
	return {
		id: input.id,
		name: input.name,
		img: input.img,
	};
}
