// TournamentListPage
// -------------------
// Questa pagina mostra una lista semplice dei tornei presenti nel sistema.
// Visualmente usiamo un contenitore "card" e una lista con leggere ombre
// per dare un aspetto più moderno, ma sempre molto leggibile.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import DeleteButton from "@/components/DeleteButton";

const TournamentListPage = () => {
  // queryClient ci serve per dire a React Query di ricaricare la lista dopo una cancellazione
  const queryClient = useQueryClient();
  // useQuery è lo strumento di React Query che usiamo per fare la chiamata API.
  // Qui gli diciamo:
  // - queryKey: una "chiave" per identificare questa richiesta nella cache ("tournaments")
  // - queryFn: la funzione che deve essere eseguita per recuperare i dati (TournamentService.list)
  // MUTATION PER ELIMINARE UN TORNEO
  // useMutation ci permette di definire un'operazione "di scrittura" (in questo caso DELETE).
  // Quando va a buon fine, chiediamo a React Query di ricaricare la lista "tournaments".
  const deleteTournamentMutation = useMutation({
    mutationFn: (id: number) => TournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const { data, isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    // Leggiamo tutti i tornei dal backend (inclusi i completati)
    // e filtriamo lato frontend solo quelli non completati.
    queryFn: () => TournamentService.list(),
  });

  // STATO DI CARICAMENTO (loading)
  // Finché i dati non sono ancora arrivati dal backend, mostriamo un piccolo box di caricamento.
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Caricamento tornei...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // STATO DI ERRORE
  // Se la richiesta al backend fallisce (ad esempio server giù, rete assente, ecc.),
  // React Query imposta isError a true e mostriamo un messaggio di errore semplice.
  if (isError) {
    // Possiamo anche stampare l'errore in console per il debug
    // (utile quando vuoi capire esattamente cosa risponde il backend)
    console.error("Errore nel caricamento dei tornei:", error);
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardContent>
            <p className="text-red-600 font-medium">Errore nel caricamento dei tornei.</p>
            {/* Se esiste un messaggio di errore, lo mostriamo in piccolo sotto */}
            {error instanceof Error && (
              <p className="text-xs text-red-500 mt-1">Dettaglio: {error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // STATO DI SUCCESSO
  // Se siamo qui significa che non siamo in loading e non c'è errore.
  // data può comunque essere undefined, quindi usiamo l'operatore ?? per avere sempre un array.
  const allTournaments = data ?? [];
  // Mostriamo solo i tornei che non sono completati lato backend.
  // In questo modo, appena il backend imposta status = "completed",
  // il torneo scompare dalla lista principale e finisce nello storico.
  const tournaments = allTournaments.filter((t) => t.status !== "completed");

  // RENDER DELLA PAGINA
  // Layout centrale racchiuso in una Card, con titolo, descrizione e lista tornei.
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 pb-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          {/* Titolo principale della pagina */}
          <CardTitle className="text-lg font-semibold">Lista tornei</CardTitle>
          <CardDescription>
            Tutti i tornei presenti nel sistema, con nome, luogo e data.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Se non ci sono tornei, mostriamo un messaggio informativo */}
          {tournaments.length === 0 ? (
            <p className="text-gray-600">Nessun torneo presente.</p>
          ) : (
            // Altrimenti mostriamo la lista dei tornei come righe con leggere ombre.
            <ul className="space-y-3">
              {tournaments.map((tournament) => (
                <li
                  key={tournament.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Cliccando sul blocco di sinistra entri nel dettaglio/bracket del torneo */}
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="flex flex-col flex-1 min-w-0 hover:underline-offset-2 hover:underline"
                  >
                    {/* Nome del torneo in evidenza */}
                    <p className="font-semibold text-sm truncate">{tournament.name}</p>

                    {/* Luogo del torneo, mostrato solo se presente nei dati */}
                    {tournament.place && (
                      <p className="text-xs text-gray-600 truncate">Luogo: {tournament.place}</p>
                    )}

                    {/* Data del torneo, mostrata solo se presente nei dati */}
                    {tournament.date && (
                      <p className="text-xs text-gray-600 truncate">Data: {tournament.date}</p>
                    )}
                  </Link>

                  <div className="flex items-center gap-3">
                    {/* ID del torneo, utile per debug o spiegazioni più tecniche */}
                    <span className="text-[11px] text-gray-400">ID: {tournament.id}</span>

                    {/* Bottone riutilizzabile per eliminare il torneo */}
                    <DeleteButton
                      onConfirm={() => deleteTournamentMutation.mutate(tournament.id)}
                      label="Elimina torneo"
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

export default TournamentListPage;
