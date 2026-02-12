// TournamentList
// --------------
// Componente feature che mostra tutti i tornei ATTIVI (status diverso da "completed").
// Si occupa di:
// - leggere la lista completa dei tornei dal backend (TournamentService.list)
// - filtrare quelli non ancora conclusi
// - permettere la cancellazione di un torneo tramite DeleteButton + mutation.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import DeleteButton from "@/components/DeleteButton";

export const TournamentList = () => {
  const queryClient = useQueryClient();

  // deleteTournamentMutation
  // ------------------------
  // Esegue la DELETE di un torneo e, al successo, invalida la query
  // "tournaments" così la lista viene ricaricata dal backend.
  // useMutation è perfetto per operazioni di scrittura (POST/PUT/DELETE) perché gestisce automaticamente
  // lo stato di loading/error/success e ci permette di definire side effect in onSuccess/onError.
  // serve per cancellare un torneo quando l'utente conferma l'azione nel DeleteButton.
  // mutationFn: cosa succede quando chiamiamo deleteTournamentMutation.mutate(id)
  // onSuccess: azioni da fare in caso di successo (in questo caso, invalidare la query "tournaments" per ricaricare la lista aggiornata)
  // la sua funzione mutate viene passata al DeleteButton, che la chiama con l'id del torneo da cancellare quando l'utente conferma.
  const deleteTournamentMutation = useMutation({
    mutationFn: (id: number) => TournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  // Query principale che legge tutti i tornei dal backend.
  const { data, isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: () => TournamentService.list(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-yellow-400 text-lg font-semibold tracking-wide">
          🏆 Caricamento tornei in corso...
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Errore nel caricamento dei tornei:", error);
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-6 rounded-2xl shadow-xl text-center">
          ❌ Errore nel caricamento dei tornei.
          {error instanceof Error && (
            <p className="text-xs mt-2 opacity-80">
              Dettaglio: {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Applichiamo un semplice filtro lato frontend per mostrare solo
  // i tornei che NON sono ancora completati.
  const allTournaments = data ?? [];
  const tournaments = allTournaments.filter((t) => t.status !== "completed");

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 Tornei Attivi
        </h1>
        <p className="text-white/70 mt-2">
          Tutti i tornei attualmente in corso
        </p>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center text-white/60">
          Nessun torneo attivo al momento.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start gap-4">
                <Link to={`/tournaments/${tournament.id}`} className="flex-1">
                  <h2 className="text-lg font-bold tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                    {tournament.name}
                  </h2>

                  {tournament.place && (
                    <p className="text-sm text-white/70 mt-2">
                      📍 {tournament.place}
                    </p>
                  )}

                  {tournament.date && (
                    <p className="text-sm text-white/70">📅 {tournament.date}</p>
                  )}
                </Link>

                <div className="flex flex-col items-end gap-3">
                  <span className="text-xs text-white/40">ID: {tournament.id}</span>

                  <DeleteButton
                    onConfirm={() => deleteTournamentMutation.mutate(tournament.id)}
                    label="Elimina torneo"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
