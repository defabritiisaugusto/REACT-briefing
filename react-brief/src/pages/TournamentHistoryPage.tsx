// TournamentHistoryPage
// ----------------------
// Questa pagina mostra lo "storico tornei": tutti i tornei che
// sono stati conclusi (cioè hanno un vincitore in finale) e che
// abbiamo marcato come completati lato frontend.

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";

const TournamentHistoryPage = () => {
  // Carichiamo solo i tornei con stato "completed" direttamente dal backend
  const { data, isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments", "completed"],
    queryFn: () => TournamentService.listByStatus("completed"),
  });

  // Carichiamo tutte le squadre una sola volta: ci serve per tradurre
  // winner_team_id (numero) -> nome della squadra vincitrice mostrato nella lista
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
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Caricamento storico tornei...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || isTeamsError) {
    console.error("Errore nel caricamento dello storico tornei:", error);
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardContent>
            <p className="text-red-600 font-medium">Errore nel caricamento dello storico tornei.</p>
            {error instanceof Error && (
              <p className="text-xs text-red-500 mt-1">Dettaglio: {error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTournaments = data ?? [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 pb-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-lg font-semibold">Storico tornei</CardTitle>
          <CardDescription>
            Tutti i tornei conclusi (cioè con una squadra vincente in finale).
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {completedTournaments.length === 0 ? (
            <p className="text-gray-600">Nessun torneo concluso al momento.</p>
          ) : (
            <ul className="space-y-3">
              {completedTournaments.map((tournament) => {
                // Se il backend ha impostato winner_team_id, troviamo il nome squadra corrispondente
                const winnerName =
                  tournament.winner_team_id != null && teams
                    ? teams.find((team) => team.id === tournament.winner_team_id)?.name
                    : undefined;

                return (
                <li
                  key={tournament.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{tournament.name}</p>
                    {tournament.place && (
                      <p className="text-xs text-gray-600 truncate">Luogo: {tournament.place}</p>
                    )}
                    {tournament.date && (
                      <p className="text-xs text-gray-600 truncate">Data: {tournament.date}</p>
                    )}
                    {winnerName && (
                      <p className="text-xs text-emerald-700 truncate mt-1">
                        Torneo vinto da: {winnerName}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">ID: {tournament.id}</span>
                </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentHistoryPage;
