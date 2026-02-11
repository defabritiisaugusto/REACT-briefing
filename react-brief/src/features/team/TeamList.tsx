// TeamList
// --------
// Componente feature che gestisce la lista completa delle squadre (read + delete + create).
// Viene usato sia nella pagina TeamListPage (wrapper sottile) sia in altre viste
// che vogliono mostrare/gestire le squadre.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import DeleteButton from "@/components/DeleteButton";
import CreateTeamForm from "@/components/CreateButton";

const TeamList = () => {
  const queryClient = useQueryClient();

  const deleteTeamMutation = useMutation({
    mutationFn: (id: number) => TeamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const { data, isLoading, isError, error } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-yellow-400 text-lg font-semibold tracking-wide">
          ⚽ Caricamento squadre...
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Errore nel caricamento delle squadre:", error);
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-6 rounded-2xl shadow-xl text-center">
          ❌ Errore nel caricamento delle squadre.
          {error instanceof Error && (
            <p className="text-xs mt-2 opacity-80">
              Dettaglio: {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const teams = data ?? [];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          ⚽ Squadre Partecipanti
        </h1>
        <p className="text-white/70 mt-2">
          Tutti i club registrati nel torneo
        </p>

      </div>

      {/* LISTA SQUADRE */}
      {teams.length === 0 ? (
        <div className="text-center text-white/60">
          Nessuna squadra presente.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CreateTeamForm />
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl hover:scale-[1.03] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between gap-4">

                {/* INFO SQUADRA */}
                <div className="flex items-center gap-4">
                  {/* Icona palla da calcio */}
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl">
                    ⚽️
                  </div>

                  <div>
                    <h2 className="text-md font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {team.name}
                    </h2>
                    <p className="text-xs text-white/40">
                      ID: {team.id}
                    </p>
                  </div>
                </div>


                {/* AZIONI */}
                <DeleteButton
                  onConfirm={() => deleteTeamMutation.mutate(team.id)}
                  label="Elimina squadra"
                />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamList;
