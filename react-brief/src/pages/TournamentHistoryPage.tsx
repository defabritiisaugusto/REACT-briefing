import { useQuery } from "@tanstack/react-query";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";

const TournamentHistoryPage = () => {
  const { data, isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments", "completed"],
    queryFn: () => TournamentService.listByStatus("completed"),
  });

  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  if (isLoading || isTeamsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-yellow-400 text-lg font-semibold tracking-wide">
          🏆 Caricamento Hall of Fame...
        </div>
      </div>
    );
  }

  if (isError || isTeamsError) {
    console.error("Errore nel caricamento dello storico tornei:", error);
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-6 rounded-2xl shadow-xl text-center">
          ❌ Errore nel caricamento dello storico tornei.
          {error instanceof Error && (
            <p className="text-xs mt-2 opacity-80">
              Dettaglio: {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const completedTournaments = data ?? [];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 Storico Tornei
        </h1>
        <p className="text-white/70 mt-2">
          Tutti i tornei conclusi e le squadre campioni
        </p>
      </div>

      {/* LISTA */}
      {completedTournaments.length === 0 ? (
        <div className="text-center text-white/60">
          Nessun torneo concluso al momento.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {completedTournaments.map((tournament) => {
            const winnerName =
              tournament.winner_team_id != null && teams
                ? teams.find((team) => team.id === tournament.winner_team_id)?.name
                : undefined;

            return (
              <div
                key={tournament.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex flex-col gap-2">

                  {/* Nome torneo */}
                  <h2 className="text-lg font-bold tracking-wide text-white">
                    {tournament.name}
                  </h2>

                  {/* Info torneo */}
                  {tournament.place && (
                    <p className="text-sm text-white/70">
                      📍 {tournament.place}
                    </p>
                  )}

                  {tournament.date && (
                    <p className="text-sm text-white/70">
                      📅 {tournament.date}
                    </p>
                  )}

                  {/* Vincitore */}
                  {winnerName && (
                    <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-between">
                      <span>🥇 Campione</span>
                      <span>{winnerName}</span>
                    </div>
                  )}

                  {/* ID */}
                  <span className="text-xs text-white/40 mt-2">
                    ID: {tournament.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentHistoryPage;
