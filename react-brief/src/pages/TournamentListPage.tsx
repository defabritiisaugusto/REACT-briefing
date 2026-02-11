import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import DeleteButton from "@/components/DeleteButton";

const TournamentListPage = () => {
  const queryClient = useQueryClient();

  const deleteTournamentMutation = useMutation({
    mutationFn: (id: number) => TournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const { data, isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: () => TournamentService.list(),
  });

  // LOADING
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-yellow-400 text-lg font-semibold tracking-wide">
          🏆 Caricamento tornei in corso...
        </div>
      </div>
    );
  }

  // ERROR
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

  const allTournaments = data ?? [];
  const tournaments = allTournaments.filter(
    (t) => t.status !== "completed"
  );

  return (
    <div className="space-y-10">

      {/* HEADER SEZIONE */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 Tornei Attivi
        </h1>
        <p className="text-white/70 mt-2">
          Tutti i tornei attualmente in corso
        </p>
      </div>

      {/* LISTA TORNEI */}
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

                {/* LINK DETTAGLIO */}
                <Link
                  to={`/tournaments/${tournament.id}`}
                  className="flex-1"
                >
                  <h2 className="text-lg font-bold tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                    {tournament.name}
                  </h2>

                  {tournament.place && (
                    <p className="text-sm text-white/70 mt-2">
                      📍 {tournament.place}
                    </p>
                  )}

                  {tournament.date && (
                    <p className="text-sm text-white/70">
                      📅 {tournament.date}
                    </p>
                  )}
                </Link>

                {/* AZIONI */}
                <div className="flex flex-col items-end gap-3">
                  <span className="text-xs text-white/40">
                    ID: {tournament.id}
                  </span>

                  <DeleteButton
                    onConfirm={() =>
                      deleteTournamentMutation.mutate(tournament.id)
                    }
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

export default TournamentListPage;
