// TeamListPage
// -------------
// Questa pagina mostra una lista semplice delle squadre presenti nel sistema.
// Usiamo anche qui un contenitore Card per dare un aspetto più curato,
// con una lista di squadre tipo "rubrica" (logo + nome + ID).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import DeleteButton from "@/components/DeleteButton";

const TeamListPage = () => {
  // queryClient ci serve per aggiornare (invalidare) la lista "teams" dopo una cancellazione
  const queryClient = useQueryClient();
  // MUTATION PER ELIMINARE UNA SQUADRA
  const deleteTeamMutation = useMutation({
    mutationFn: (id: number) => TeamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  // useQuery chiama TeamService.list() per recuperare tutte le squadre dal backend.
  // queryKey è "teams", così React Query sa che questi dati rappresentano l'elenco delle squadre.
  const { data, isLoading, isError, error } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // STATO DI CARICAMENTO (loading)
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Caricamento squadre...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // STATO DI ERRORE
  if (isError) {
    console.error("Errore nel caricamento delle squadre:", error);
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardContent>
            <p className="text-red-600 font-medium">Errore nel caricamento delle squadre.</p>
            {error instanceof Error && (
              <p className="text-xs text-red-500 mt-1">Dettaglio: {error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // STATO DI SUCCESSO
  const teams = data ?? [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 pb-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          {/* Titolo principale della pagina */}
          <CardTitle className="text-lg font-semibold">Lista squadre</CardTitle>
          <CardDescription>
            Tutte le squadre disponibili.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Se non ci sono squadre, mostriamo un messaggio informativo */}
          {teams.length === 0 ? (
            <p className="text-gray-600">Nessuna squadra presente.</p>
          ) : (
            // Lista di squadre: ogni squadra è una riga con nome e (se presente) immagine
            <ul className="space-y-3">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {/* Se è presente un'immagine, la mostriamo come piccolo logo */}
                    {team.img && (
                      <img
                        src={team.img}
                        alt={team.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    )}

                    {/* Nome della squadra */}
                    <p className="font-semibold text-sm">{team.name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* ID della squadra, utile per debug o spiegazioni tecniche */}
                    <span className="text-[11px] text-gray-400">ID: {team.id}</span>

                    {/* Bottone riutilizzabile per eliminare la squadra */}
                    <DeleteButton
                      onConfirm={() => deleteTeamMutation.mutate(team.id)}
                      label="Elimina squadra"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamListPage;
