// I file .type.ts (o talvolta chiamati models.ts o types.d.ts) servono a definire la struttura dei dati (shape of data) all'interno dell'applicazione
// In questo caso, tournament.type.ts definisce il tipo Tournament, che rappresenta la struttura dei dati di un torneo, con campi come id, name, date e place. 
// Inoltre, contiene una funzione di utilità serverTournamentToTournament per convertire i dati del torneo ricevuti dal server (ServerTournament) in un formato più adatto all'uso all'interno dell'applicazione (Tournament).


export type Tournament = {
    id: number;
	name: string;
	date: string;
	place: string;
}




