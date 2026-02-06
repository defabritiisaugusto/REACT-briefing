// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione
// In questo caso, team.type.ts definisce il tipo Team, che rappresenta la struttura dei dati di una squadra all'interno del torneo, con campi come id, name e img.


export type Team = {
	id: number;
	name: string;
	img: string;
}






