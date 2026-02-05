export type Round = {
	id_tournament: number;
	name: string;
	status: 'pending' | 'in_progress' | 'completed';
};
