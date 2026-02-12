// TournamentBracket
// ------------------
// Componente "feature" che gestisce tutto il tabellone di un singolo torneo:
// - legge i dati del torneo, delle squadre iscritte e delle squadre totali (React Query)
// - genera in modo casuale gli accoppiamenti dei quarti di finale (8 squadre)
// - propaga i vincitori a semifinali e finale in base ai gol inseriti
// - quando esiste un campione:
//   - chiama il backend per marcare il torneo come completato (winner_team_id)
//   - aggiorna lo stato dei round nella tabella "rounds"
//   - salva tutte le partite (quarti, semifinali, finale) nella tabella "games".

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import { TournamentService } from "@/features/tournament/tournament.service";
import type { Tournament } from "@/features/tournament/tournament.type";
import { TournamentTeamService } from "@/features/tournament_team/tournament_team.service";
import type { TournamentTeam } from "@/features/tournament_team/tournament_team.type";
import { RoundService } from "@/features/round/round.service";
import { GameService } from "@/features/game/game.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Tipo interno per rappresentare il punteggio di una partita
export type Score = {
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

export type TournamentBracketProps = {
  tournamentId: number;
};

/**
 * TournamentBracket
 * -----------------
 * Riceve in ingresso l'id di un torneo e costruisce tutta l'esperienza di tabellone:
 * - usa 3 query per ottenere torneo, iscrizioni (tournament_teams) e squadre
 * - usa stato locale per punteggi di quarti / semifinali / finale
 * - quando i punteggi sono completi, calcola dinamicamente i vincitori e il campione
 * - sincronizza questi risultati con il database tramite i vari service (RoundService, GameService, TournamentService).
 */
export const TournamentBracket = ({ tournamentId }: TournamentBracketProps) => {
  const queryClient = useQueryClient();

  // 1) Carichiamo la lista dei tornei per trovare il torneo con l'ID giusto.
  // Questo ci serve anche per avere a disposizione tutte le informazioni del torneo (nome, data, luogo, winner_team_id).
  const {
    data: tournaments,
    isLoading: isTournamentsLoading,
    isError: isTournamentsError,
  } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: () => TournamentService.list(),
  });

  // 2) Carichiamo le squadre iscritte a questo torneo
  // Questo ci serve per sapere quali squadre partecipano e poter generare gli accoppiamenti.
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
  // Questo ci serve per mostrare i nomi delle squadre nel tabellone, partendo dai soli idTeam salvati in tournamentTeams.
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // che cos'è useMutation?
  // useMutation è un hook di React Query che ci permette di gestire operazioni di scrittura (POST/PUT/DELETE) verso il backend.
  // Mutation che invia al backend il vincitore finale del torneo.
  // Quando va a buon fine, invalidiamo sia la lista generale dei tornei
  // sia quella filtrata per "completed" (storico tornei).
  const completeTournamentMutation = useMutation({
    mutationFn: (winnerTeamId: number) =>
      TournamentService.completeTournament(tournamentId, winnerTeamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments", "completed"] });
    },
  });

  // Funzione di utilità per aggiornare lo stato dei round nel DB
  // ------------------------------------------------------------
  // Viene chiamata quando decretiamo il campione: prende tutti i round
  // associati a questo torneo e li marca come "completed" nella tabella "rounds".
  const markRoundsCompleted = async () => {
    try {
      const allRounds = await RoundService.list();
      const tournamentRounds = allRounds.filter(
        (round) => round.idTournament === tournamentId
      );

      for (const round of tournamentRounds) {
        await RoundService.update({
          id: round.id,
          data: { status: "completed" },
        });
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei round del torneo:", error);
    }
  };

  // updateFinalGame
  // ---------------
  // Quando abbiamo il vincitore della finale, aggiorniamo anche il game di finale
  // nella tabella "games" con:
  // - id del round "Finale"
  // - id delle due squadre finaliste
  // - gol segnati
  // - winner_team_id
  const updateFinalGame = async (winnerTeamId: number, score: Score) => {
    try {
      const allRounds = await RoundService.list();
      const finalRound = allRounds.find(
        (round) => round.idTournament === tournamentId && round.name === "Finale"
      );

      // Se non troviamo il round di finale, non possiamo procedere con l'aggiornamento del game.
      if (!finalRound) {
        console.warn("Round 'Finale' non trovato per il torneo", tournamentId);
        return;
      }

      // Troviamo gli id delle squadre finaliste a partire dai loro nomi.
      const finalTeam1Id =
        teams?.find((team) => team.name === finalTeam1Name)?.id ?? null;
      const finalTeam2Id =
        teams?.find((team) => team.name === finalTeam2Name)?.id ?? null;

        // Se non riusciamo a determinare gli id delle squadre finaliste, non possiamo procedere con l'aggiornamento del game.
      if (!finalTeam1Id || !finalTeam2Id) {
        console.warn("Impossibile determinare gli ID delle squadre di finale");
        return;
      }

      // Controlliamo se esiste già un game di finale per questo round e queste squadre.
      const allGames = await GameService.list();
      let finalGame = allGames.find(
        (game) =>
          game.idRound === finalRound.id &&
          ((game.team1Id === finalTeam1Id && game.team2Id === finalTeam2Id) ||
            (game.team1Id === finalTeam2Id &&
              game.team2Id === finalTeam1Id))
      );

      if (!finalGame) {

        // Se non esiste un game di finale, lo creiamo.
        finalGame = await GameService.create({
          data: {
            idRound: finalRound.id,
            team1Id: finalTeam1Id,
            team2Id: finalTeam2Id,
            goalsTeam1: score.goals1,
            goalsTeam2: score.goals2,
            winnerTeamId: winnerTeamId,
          },
        });
      }

      // Se il game di finale esiste già, lo aggiorniamo con i nuovi dati.
      await GameService.update({
        id: finalGame.id,
        data: {
          goalsTeam1: score.goals1,
          goalsTeam2: score.goals2,
          winnerTeamId: winnerTeamId,
        },
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento del game di finale:", error);
    }
  };

  // Da TournamentTeam e Team ricaviamo un semplice array di nomi squadra.
  // Questo ci consente poi di lavorare solo con i nomi nel tabellone,
  // e riconvertirli in id quando dobbiamo scrivere su DB.
  const teamNames: string[] = [];
  if (tournamentTeams && teams) {
    for (const tournamentTeam of tournamentTeams) {
      const foundTeam = teams.find(
        (teamItem) => teamItem.id === tournamentTeam.idTeam
      );
      if (foundTeam) {
        teamNames.push(foundTeam.name);
      }
    }
  }

  // Le 8 squadre che parteciperanno al tabellone, già mescolate in modo casuale.
  // quarterTeams contiene quindi solo i nomi delle squadre usate nel bracket.
  const [quarterTeams, setQuarterTeams] = useState<string[]>([]);

  // useEffect che genera in modo casuale gli accoppiamenti dei quarti di finale.
  // Viene eseguito una sola volta quando abbiamo i nomi delle squadre (teamNames) e quarterTeams è ancora vuoto.
  useEffect(() => {
    if (quarterTeams.length > 0) return;
    if (teamNames.length < 8) return;


    // Mescoliamo in modo casuale le squadre e prendiamo le prime 8 per il tabellone.
    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);
    setQuarterTeams(selected);
  }, [teamNames, quarterTeams.length]);

  // Gol dei quarti (4 partite)
  // Ogni elemento dell'array corrisponde a una partita dei quarti.
  const [quarterScores, setQuarterScores] = useState<Score[]>(() =>
    Array.from({ length: 4 }, () => ({ goals1: null, goals2: null }))
  );

  // Gol delle semifinali (2 partite)
  const [semiScores, setSemiScores] = useState<Score[]>(() =>
    Array.from({ length: 2 }, () => ({ goals1: null, goals2: null }))
  );

  // Gol della finale (1 partita)
  const [finalScore, setFinalScore] = useState<Score>({
    goals1: null,
    goals2: null,
  });
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);

  // Stato globale di caricamento/errore delle 3 query principali.
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

  // Cerchiamo il torneo di interesse sulla base dell'id passato come prop.
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

  // quarterPairs definisce gli accoppiamenti delle 8 squadre nei quarti:
  // - match 1: squadre 0 e 1
  // - match 2: squadre 2 e 3
  // - match 3: squadre 4 e 5
  // - match 4: squadre 6 e 7
  const quarterPairs: [number, number][] = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
  ];

  // quarterMatches
  // --------------
  // Costruiamo l'elenco delle 4 partite dei quarti con:
  // - nomi delle squadre
  // - punteggio corrente
  // - winnerName calcolato dinamicamente da getWinnerName.
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

  // semiMatches
  // -----------
  // Le semifinali prendono come input i vincitori dei quarti:
  // - semi 1: vincente match 1 vs vincente match 2
  // - semi 2: vincente match 3 vs vincente match 4
  const semiMatches = [0, 1].map((index) => {
    const qIndex1 = index === 0 ? 0 : 2;
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

  // I due finalisti sono i vincitori delle due semifinali.
  const finalTeam1Name = semiMatches[0].winnerName;
  const finalTeam2Name = semiMatches[1].winnerName;
  const championName = getWinnerName(finalTeam1Name, finalTeam2Name, finalScore);

  // saveQuarterAndSemiGames
  // -----------------------
  // Quando decretiamo il campione salviamo anche tutte le partite di quarti e semifinale
  // nella tabella "games". Per evitare duplicati, controlliamo prima se esistono già
  // game associati ai round di quarti o semifinali.
  const saveQuarterAndSemiGames = async () => {
    try {
      const allRounds = await RoundService.list();
      const roundsForTournament = allRounds.filter(
        (round) => round.idTournament === tournamentId
      );

      const quarterRound = roundsForTournament.find(
        (round) => round.name === "Quarti di finale"
      );
      const semiRound = roundsForTournament.find(
        (round) => round.name === "Semifinali"
      );

      if (!quarterRound || !semiRound) {
        console.warn(
          "Round per quarti o semifinali non trovati per il torneo",
          tournamentId
        );
        return;
      }

      const allGames = await GameService.list();
      const hasQuarterOrSemiGames = allGames.some(
        (game) =>
          game.idRound === quarterRound.id || game.idRound === semiRound.id
      );

      if (hasQuarterOrSemiGames) {
        return;
      }

      // Funzione helper per convertire il nome squadra in id letti da TeamService.list.
      const findTeamIdByName = (name: string): number | null => {
        if (!teams) return null;
        const found = teams.find((team) => team.name === name);
        return found ? found.id : null;
      };

      // Creazione partite dei QUARTI di finale
      for (const match of quarterMatches) {
        const { team1Name, team2Name, score } = match;
        const { goals1, goals2 } = score;

        if (!team1Name || !team2Name) continue;
        if (goals1 === null || goals2 === null) continue;

        const team1Id = findTeamIdByName(team1Name);
        const team2Id = findTeamIdByName(team2Name);

        if (!team1Id || !team2Id) {
          console.warn(
            "Impossibile determinare gli ID per una partita dei quarti"
          );
          continue;
        }

        const winnerName = getWinnerName(team1Name, team2Name, score);
        const winnerId = winnerName ? findTeamIdByName(winnerName) : null;

        await GameService.create({
          data: {
            idRound: quarterRound.id,
            team1Id,
            team2Id,
            goalsTeam1: goals1,
            goalsTeam2: goals2,
            winnerTeamId: winnerId,
          },
        });
      }

      // Creazione partite delle SEMIFINALI
      for (const match of semiMatches) {
        const { team1Name, team2Name, score } = match;
        const { goals1, goals2 } = score;

        if (!team1Name || !team2Name) continue;
        if (goals1 === null || goals2 === null) continue;

        const team1Id = findTeamIdByName(team1Name);
        const team2Id = findTeamIdByName(team2Name);

        if (!team1Id || !team2Id) {
          console.warn(
            "Impossibile determinare gli ID per una partita di semifinale"
          );
          continue;
        }

        const winnerName = getWinnerName(team1Name, team2Name, score);
        const winnerId = winnerName ? findTeamIdByName(winnerName) : null;

        await GameService.create({
          data: {
            idRound: semiRound.id,
            team1Id,
            team2Id,
            goalsTeam1: goals1,
            goalsTeam2: goals2,
            winnerTeamId: winnerId,
          },
        });
      }
    } catch (error) {
      console.error(
        "Errore durante il salvataggio delle partite di bracket:",
        error
      );
    }
  };

  // handleQuarterScoreChange
  // -------------------------
  // Aggiorna in stato locale il punteggio di una specifica partita dei quarti.
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

  // handleSemiScoreChange
  // ----------------------
  // Aggiorna in stato locale il punteggio di una specifica semifinale.
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

  // handleFinalScoreChange
  // ----------------------
  // Aggiorna in stato locale il punteggio della finale.
  // Quando i dati permettono di determinare un campione, scatena la pipeline di:
  // - completamento torneo
  // - aggiornamento round
  // - salvataggio finale + quarti + semifinali
  const handleFinalScoreChange = (field: keyof Score, value: string) => {
    const parsed = value === "" ? null : Number(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;
    setFinalScore((prev) => {
      const next: Score = { ...prev, [field]: parsed };

      const maybeChampion = getWinnerName(
        finalTeam1Name,
        finalTeam2Name,
        next
      );
      if (maybeChampion && !hasMarkedCompleted) {
        const winnerTeam = teams?.find(
          (team) => team.name === maybeChampion
        );
        if (winnerTeam) {
          completeTournamentMutation.mutate(winnerTeam.id);
          markRoundsCompleted();
          updateFinalGame(winnerTeam.id, next);
          saveQuarterAndSemiGames();
        }
        setHasMarkedCompleted(true);
      }

      return next;
    });
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 {tournament.name}
        </h1>
        <p className="text-white/70 mt-2">
          Tabellone ufficiale – Inserisci i risultati e decreta il campione
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 justify-between">
        <div className="flex-1 space-y-4">
          <h3 className="text-center font-bold text-yellow-400 tracking-wide uppercase">
            Quarti di Finale
          </h3>

          {quarterMatches.map((match, index) => (
            <div
              key={match.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl space-y-2"
            >
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Match {match.id}
              </p>

              {[match.team1Name, match.team2Name].map((team, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex-1 text-sm truncate text-white">
                    {team}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={
                      i === 0
                        ? match.score.goals1 ?? ""
                        : match.score.goals2 ?? ""
                    }
                    onChange={(e) =>
                      handleQuarterScoreChange(
                        index,
                        i === 0 ? "goals1" : "goals2",
                        e.target.value
                      )
                    }
                    className="w-16 h-9 text-center bg-black/30 border-white/20 text-white"
                  />
                </div>
              ))}

              {match.winnerName && (
                <p className="text-xs text-yellow-400 font-semibold mt-2">
                  ⚡ Avanza: {match.winnerName}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-center font-bold text-yellow-400 tracking-wide uppercase">
            Semifinali
          </h3>

          {semiMatches.map((match, index) => (
            <div
              key={match.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl space-y-2"
            >
              {[
                match.team1Name || "In attesa...",
                match.team2Name || "In attesa...",
              ].map((team, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex-1 text-sm truncate text-white">
                    {team}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={
                      i === 0
                        ? match.score.goals1 ?? ""
                        : match.score.goals2 ?? ""
                    }
                    onChange={(e) =>
                      handleSemiScoreChange(
                        index,
                        i === 0 ? "goals1" : "goals2",
                        e.target.value
                      )
                    }
                    disabled={!match.team1Name || !match.team2Name}
                    className="w-16 h-9 text-center bg-black/30 border-white/20 text-white disabled:opacity-40"
                  />
                </div>
              ))}

              {match.winnerName && (
                <p className="text-xs text-yellow-400 font-semibold mt-2">
                  ⚡ Avanza: {match.winnerName}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-center font-bold text-yellow-400 tracking-wide uppercase">
            Finale
          </h3>

          <div className="bg-white/10 backdrop-blur-md border border-yellow-400/40 rounded-2xl p-5 shadow-2xl space-y-3">
            {[
              finalTeam1Name || "In attesa...",
              finalTeam2Name || "In attesa...",
            ].map((team, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 text-sm truncate text-white font-medium">
                  {team}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={
                    i === 0
                      ? finalScore.goals1 ?? ""
                      : finalScore.goals2 ?? ""
                  }
                  onChange={(e) =>
                    handleFinalScoreChange(
                      i === 0 ? "goals1" : "goals2",
                      e.target.value
                    )
                  }
                  disabled={!finalTeam1Name || !finalTeam2Name}
                  className="w-16 h-9 text-center bg-black/40 border-yellow-400/40 text-white disabled:opacity-40"
                />
              </div>
            ))}

            {championName && (
              <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-4 text-center shadow-lg animate-pulse">
                <p className="text-xs uppercase tracking-widest text-yellow-300">
                  🏆 Campione del Torneo
                </p>
                <p className="text-xl font-extrabold text-yellow-400 mt-1">
                  {championName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
