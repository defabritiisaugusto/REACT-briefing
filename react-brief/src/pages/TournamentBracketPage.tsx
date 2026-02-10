// TournamentBracketPage (versione semplice, con squadre dal torneo)
// -----------------------------------------------------------------
// Questa pagina mostra un tabellone a 8 squadre (quarti → semifinali → finale)
// gestito lato frontend per quanto riguarda i punteggi/singole partite.
// Quando però esiste un vincitore in finale, il risultato viene comunicato
// al backend che salva: status = "completed" e winner_team_id per il torneo.
// Le squadre NON le scrivo a mano: vengono prese automaticamente dalle
// squadre iscritte al torneo e posizionate in modo casuale nei quarti.
//
// Flusso da spiegare:
// 1) Quando entri nella pagina, le 8 squadre iscritte al torneo vengono
//    posizionate in modo random nei quarti di finale.
// 2) Nei quarti inserisci i gol: in base ai gol viene calcolato
//    subito il nome della squadra vincente.
// 3) Le semifinali usano automaticamente i vincitori dei quarti.
// 4) La finale usa automaticamente i vincitori delle semifinali.
// 5) Sotto la finale compare la scritta con il nome della squadra campione.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import { TournamentTeamService } from "@/features/tournament_team/tournament_team.service";
import type { TournamentTeam } from "@/features/tournament_team/tournament_team.type";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";

type Score = {
  goals1: number | null;
  goals2: number | null;
};

// Funzione di utilità: dato il nome delle due squadre e i gol,
// restituisce il nome della squadra vincente oppure stringa vuota se
// i dati non sono completi o c'è pareggio.
function getWinnerName(team1: string, team2: string, score: Score): string {
  const { goals1, goals2 } = score;
  if (!team1 || !team2) return "";
  if (goals1 === null || goals2 === null) return "";
  if (goals1 === goals2) return ""; // niente pareggi, serve un vincitore chiaro
  return goals1 > goals2 ? team1 : team2;
}

const TournamentBracketPage = () => {
  const params = useParams();
  const tournamentId = Number(params.id);

  // queryClient ci permette di invalidare/ricaricare i dati React Query
  // (es. la lista tornei) dopo aver marcato un torneo come completato.
  const queryClient = useQueryClient();

  // 1) Carichiamo la lista dei tornei per trovare il torneo con l'ID giusto.
  // e poi qui dentro cerchiamo il torneo con l'ID corretto.
  const {
    data: tournaments,
    isLoading: isTournamentsLoading,
    isError: isTournamentsError,
  } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: () => TournamentService.list(),
  });

  // 2) Carichiamo le squadre iscritte a questo torneo
  const {
    data: tournamentTeams,
    isLoading: isTournamentTeamsLoading,
    isError: isTournamentTeamsError,
  } = useQuery<TournamentTeam[]>({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: () => TournamentTeamService.listByTournament(tournamentId),
    enabled: !Number.isNaN(tournamentId),
  });

  // 3) Carichiamo tutte le squadre per poter trasformare idTeam → nome squadra
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // Mutation che invia al backend il vincitore finale del torneo.
  // Alla fine, status diventa "completed" e winner_team_id viene impostato nel DB.
  // useMutation è il modo in cui React Query gestisce le operazioni di scrittura (POST/PUT/DELETE) verso il backend, con supporto per stati di caricamento, successo ed errore.
  // useMutation accetta un oggetto di configurazione con almeno mutationFn, che definisce la funzione da eseguire quando lanciamo la mutation (in questo caso, chiamare l'endpoint per completare il torneo).
  // useMutation restituisce un oggetto con diverse proprietà e funzioni, tra cui mutate, che è la funzione che dobbiamo chiamare per eseguire la mutation (es. mutate(winnerTeamId)).
  const completeTournamentMutation = useMutation({
    // Questa mutation viene "lanciata" quando nella finale abbiamo un vincitore chiaro (non pareggio).
    // winnerTeamId è l'ID della squadra vincente, che passiamo al backend per completare il torneo.
    mutationFn: (winnerTeamId: number) =>
      TournamentService.completeTournament(tournamentId, winnerTeamId),
    onSuccess: () => {
      // Ricarichiamo la lista tornei in cache (pagina Tornei / Storico)
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  // 4) Da TournamentTeam e Team ricaviamo un semplice array di nomi squadra.
 
  const teamNames: string[] = [];
  if (tournamentTeams && teams) {
    for (const tournamentTeam of tournamentTeams) {
      const foundTeam = teams.find((teamItem) => teamItem.id === tournamentTeam.idTeam);
      if (foundTeam) {
        teamNames.push(foundTeam.name);
      }
    }
  }

  // 5) Le 8 squadre che parteciperanno al tabellone, già mescolate in modo casuale.
  // Questo stato viene inizializzato UNA SOLA VOLTA quando i dati delle squadre sono pronti.
  const [quarterTeams, setQuarterTeams] = useState<string[]>([]);

  useEffect(() => {
    // se abbiamo già deciso l'ordine, non fare nulla
    if (quarterTeams.length > 0) return;
    // se non abbiamo ancora 8 squadre iscritte, non generiamo il tabellone
    if (teamNames.length < 8) return;

    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8); // prendiamo le prime 8 dopo lo shuffle
    setQuarterTeams(selected);
  }, [teamNames, quarterTeams.length]);

  // Gol dei quarti (4 partite)
  const [quarterScores, setQuarterScores] = useState<Score[]>(() =>
    Array.from({ length: 4 }, () => ({ goals1: null, goals2: null }))
  );

  // Gol delle semifinali (2 partite)
  const [semiScores, setSemiScores] = useState<Score[]>(() =>
    Array.from({ length: 2 }, () => ({ goals1: null, goals2: null }))
  );

  // Gol della finale (1 partita)
  const [finalScore, setFinalScore] = useState<Score>({ goals1: null, goals2: null });
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);

  if (Number.isNaN(tournamentId)) {
    return <p className="mt-8 text-center">ID torneo non valido.</p>;
  }

  const isLoading =
    isTournamentsLoading || isTournamentTeamsLoading || isTeamsLoading;
  const isError = isTournamentsError || isTournamentTeamsError || isTeamsError;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Caricamento dati del torneo e delle squadre...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Impossibile caricare i dati del torneo o delle squadre.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tournament = tournaments?.find((t) => t.id === tournamentId);

  if (!tournament) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Torneo non trovato.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se non abbiamo almeno 8 squadre iscritte, spieghiamo il perché il tabellone non parte
  if (teamNames.length < 8) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-lg font-semibold">
              Tabellone semplice: {tournament.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-700">
              Per generare il tabellone servono 8 squadre iscritte al torneo.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Attualmente le squadre iscritte sono: {teamNames.length}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se abbiamo i dati ma non abbiamo ancora generato l'ordine casuale, mostriamo un piccolo messaggio di attesa
  if (quarterTeams.length < 8) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        <Card className="shadow-sm">
          <CardContent>
            <p>Generazione del tabellone in corso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nomi delle squadre per i quarti (semplicemente 1vs2, 3vs4, 5vs6, 7vs8)
  const quarterPairs: [number, number][] = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
  ];

  const quarterMatches = quarterPairs.map(([i1, i2], index) => {
    const team1Name = quarterTeams[i1];
    const team2Name = quarterTeams[i2];
    return {
      id: index + 1,
      team1Name,
      team2Name,
      score: quarterScores[index],
      winnerName: getWinnerName(team1Name, team2Name, quarterScores[index]),
    };
  });

  // Semifinali: vincitore quarto 1 vs vincitore quarto 2, e vincitore quarto 3 vs vincitore quarto 4
  const semiMatches = [0, 1].map((index) => {
    const qIndex1 = index === 0 ? 0 : 2; // (0,1) oppure (2,3)
    const qIndex2 = index === 0 ? 1 : 3;
    const team1Name = quarterMatches[qIndex1].winnerName;
    const team2Name = quarterMatches[qIndex2].winnerName;
    const score = semiScores[index];
    return {
      id: index + 1,
      team1Name,
      team2Name,
      score,
      winnerName: getWinnerName(team1Name, team2Name, score),
    };
  });

  // Finale: vincitore semifinale 1 vs vincitore semifinale 2
  const finalTeam1Name = semiMatches[0].winnerName;
  const finalTeam2Name = semiMatches[1].winnerName;
  const championName = getWinnerName(finalTeam1Name, finalTeam2Name, finalScore);

  const handleQuarterScoreChange = (
    matchIndex: number,
    field: keyof Score,
    value: string
  ) => {
    const parsed = value === "" ? null : Number(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;

    setQuarterScores((prev) => {
      const next = prev.map((item) => ({ ...item }));
      next[matchIndex][field] = parsed;
      return next;
    });
  };

  const handleSemiScoreChange = (
    matchIndex: number,
    field: keyof Score,
    value: string
  ) => {
    const parsed = value === "" ? null : Number(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;

    setSemiScores((prev) => {
      const next = prev.map((item) => ({ ...item }));
      next[matchIndex][field] = parsed;
      return next;
    });
  };

  const handleFinalScoreChange = (field: keyof Score, value: string) => {
    const parsed = value === "" ? null : Number(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;
    setFinalScore((prev) => {
      const next: Score = { ...prev, [field]: parsed };

      // Se con questo nuovo risultato abbiamo un vincitore chiaro in finale,
      // segniamo il torneo come "concluso" lato backend (solo la prima volta).
      const maybeChampion = getWinnerName(finalTeam1Name, finalTeam2Name, next);
      if (maybeChampion && !hasMarkedCompleted) {
        // Troviamo l'oggetto Team corrispondente al nome calcolato dal tabellone
        const winnerTeam = teams?.find((team) => team.name === maybeChampion);
        if (winnerTeam) {
          // Comunichiamo al backend quale squadra ha vinto il torneo
          completeTournamentMutation.mutate(winnerTeam.id);
        }
        setHasMarkedCompleted(true);
      }

      return next;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-4 pb-8">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-lg font-semibold">
            Tabellone semplice: {tournament.name}
          </CardTitle>
          <CardDescription>
            Le squadre iscritte al torneo vengono posizionate in modo casuale nei quarti.
            Inserisci i risultati e guarda chi avanza fino alla finale.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Tabellone: quarti, semifinali, finale */}
          <section>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-between">
              {/* Quarti di finale */}
              <div className="flex-1 min-w-55">
                <h3 className="font-semibold text-base mb-3 text-center">Quarti di finale</h3>
                <div className="space-y-3">
                  {quarterMatches.map((match, index) => (
                    <div
                      key={match.id}
                      className="border rounded-lg p-3 bg-card shadow-sm flex flex-col gap-2"
                    >
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Quarto {match.id}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">{match.team1Name}</span>
                        <Input
                          type="number"
                          className="w-14 h-8 text-center text-sm"
                          min={0}
                          value={match.score.goals1 ?? ""}
                          onChange={(e) =>
                            handleQuarterScoreChange(index, "goals1", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">{match.team2Name}</span>
                        <Input
                          type="number"
                          className="w-14 h-8 text-center text-sm"
                          min={0}
                          value={match.score.goals2 ?? ""}
                          onChange={(e) =>
                            handleQuarterScoreChange(index, "goals2", e.target.value)
                          }
                        />
                      </div>
                      {match.winnerName && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          Avanza: {match.winnerName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Semifinali */}
              <div className="flex-1 min-w-55">
                <h3 className="font-semibold text-base mb-3 text-center">Semifinali</h3>
                <div className="space-y-3">
                  {semiMatches.map((match, index) => (
                    <div
                      key={match.id}
                      className="border rounded-lg p-3 bg-card shadow-sm flex flex-col gap-2"
                    >
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Semifinale {match.id}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">
                          {match.team1Name || "In attesa vincente quarti"}
                        </span>
                        <Input
                          type="number"
                          className="w-14 h-8 text-center text-sm"
                          min={0}
                          value={match.score.goals1 ?? ""}
                          onChange={(e) =>
                            handleSemiScoreChange(index, "goals1", e.target.value)
                          }
                          disabled={!match.team1Name || !match.team2Name}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">
                          {match.team2Name || "In attesa vincente quarti"}
                        </span>
                        <Input
                          type="number"
                          className="w-14 h-8 text-center text-sm"
                          min={0}
                          value={match.score.goals2 ?? ""}
                          onChange={(e) =>
                            handleSemiScoreChange(index, "goals2", e.target.value)
                          }
                          disabled={!match.team1Name || !match.team2Name}
                        />
                      </div>
                      {match.winnerName && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          Avanza: {match.winnerName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Finale */}
              <div className="flex-1 min-w-55">
                <h3 className="font-semibold text-base mb-3 text-center">Finale</h3>
                <div className="border rounded-lg p-3 bg-card shadow-sm flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">Finale</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">
                      {finalTeam1Name || "In attesa vincente semifinale"}
                    </span>
                    <Input
                      type="number"
                      className="w-14 h-8 text-center text-sm"
                      min={0}
                      value={finalScore.goals1 ?? ""}
                      onChange={(e) => handleFinalScoreChange("goals1", e.target.value)}
                      disabled={!finalTeam1Name || !finalTeam2Name}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">
                      {finalTeam2Name || "In attesa vincente semifinale"}
                    </span>
                    <Input
                      type="number"
                      className="w-14 h-8 text-center text-sm"
                      min={0}
                      value={finalScore.goals2 ?? ""}
                      onChange={(e) => handleFinalScoreChange("goals2", e.target.value)}
                      disabled={!finalTeam1Name || !finalTeam2Name}
                    />
                  </div>
                  {championName && (
                    <div className="mt-3 border border-emerald-300 bg-emerald-50 rounded-md p-2 text-center">
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        Il torneo è concluso!
                      </p>
                      <p className="text-sm font-bold text-emerald-900">
                        Squadra vincente: {championName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentBracketPage;
