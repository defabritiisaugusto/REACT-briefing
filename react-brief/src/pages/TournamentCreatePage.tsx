// TournamentCreatePage
// ---------------------
// Questa pagina permette di creare un nuovo torneo.
// È pensata per essere molto semplice da spiegare:
// - c'è un piccolo form con alcuni campi di base (nome, data)
// - possiamo anche selezionare le squadre da inserire nel torneo
// - quando invii il form, chiamiamo TournamentService.create
// - se va bene, svuotiamo i campi, aggiorniamo la lista dei tornei
// - e iscriviamo le squadre selezionate al nuovo torneo tramite TournamentTeamService

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TournamentService } from "@/features/tournament/tournament.service";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import { TournamentTeamService } from "@/features/tournament_team/tournament_team.service";

const TournamentCreatePage = () => {
  // stato locale per gestire il valore dei campi del form
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  // array di ID delle squadre selezionate per il torneo (max 8 per semplicità)
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  // queryClient ci serve per invalidare la lista "tournaments" dopo una creazione
  const queryClient = useQueryClient();

  // useMutation per creare un nuovo torneo E iscrivere le squadre selezionate
  // mutationFn definisce cosa succede quando "lanciamo" la mutation:
  // 1) creiamo il torneo
  // 2) per ogni squadra selezionata chiamiamo TournamentTeamService.create
  const createTournamentMutation = useMutation({
    mutationFn: async (payload: { name: string; date?: string; teamIds: number[] }) => {
      // 1) creiamo il torneo sul backend
      const tournament = await TournamentService.create({
        name: payload.name,
        date: payload.date,
      });

      // 2) iscriviamo le squadre selezionate, una alla volta
      //    usiamo l'ordine dell'array per assegnare la "position" (1, 2, 3, ...)
      for (let index = 0; index < payload.teamIds.length; index++) {
        const teamId = payload.teamIds[index];
        await TournamentTeamService.create({
          teamId,
          tournamentId: tournament.id,
          position: index + 1,
        });
      }

      // Ritorniamo il torneo creato in modo che React Query lo abbia come "data" della mutation
      return tournament;
    },
    onSuccess: () => {
      // Quando la creazione va a buon fine:
      // - svuotiamo i campi di input
      // - azzeriamo le squadre selezionate
      // - diciamo a React Query di ricaricare la lista dei tornei
      setName("");
      setDate("");
      setSelectedTeamIds([]);
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  // useQuery per caricare la lista di tutte le squadre disponibili
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    error: teamsError,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // Funzione di utilità per selezionare/deselezionare una squadra
  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeamIds((current) => {
      const isAlreadySelected = current.includes(teamId);

      if (isAlreadySelected) {
        // se è già selezionata, la togliamo
        return current.filter((id) => id !== teamId);
      }

      // se non è selezionata e abbiamo già 8 squadre, non aggiungiamo altre
      if (current.length >= 8) {
        return current;
      }

      return [...current, teamId];
    });
  };

  // Gestore dell'invio del form
  // Qui rendiamo la logica molto lineare:
  // 1. blocchiamo il comportamento predefinito del form (niente refresh pagina)
  // 2. creiamo una variabile "trimmedName" già ripulita
  // 3. se è vuota non facciamo nulla, altrimenti lanciamo la mutation
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Inviamo nome, data (se presente) e l'elenco delle squadre selezionate.
    createTournamentMutation.mutate({
      name: trimmedName,
      date: date || undefined,
      teamIds: selectedTeamIds,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 pb-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-lg font-semibold">Crea un nuovo torneo</CardTitle>
          <CardDescription>
            Inserisci il nome del torneo, la data e le squadre che ci partecipano... poi clicca su "Crea torneo".
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Form molto semplice con un input di testo e un bottone */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tournament-name">
                Nome del torneo
              </label>
              <Input
                id="tournament-name"
                placeholder="Es. Torneo Serie A 2026"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tournament-date">
                Data del torneo (opzionale)
              </label>
              <Input
                id="tournament-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            {/* Sezione per la selezione delle squadre */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Seleziona le squadre da inserire nel torneo
                <span className="ml-1 text-xs text-gray-500">
                  (max 8, selezionate: {selectedTeamIds.length})
                </span>
              </p>

              {/* Gestione stati caricamento/errore delle squadre */}
              {isTeamsLoading && (
                <p className="text-xs text-gray-600">Caricamento squadre...</p>
              )}

              {isTeamsError && (
                <p className="text-xs text-red-600">
                  Errore nel caricamento delle squadre.
                  {teamsError instanceof Error && (
                    <span className="block text-[10px] text-red-500">
                      Dettaglio: {teamsError.message}
                    </span>
                  )}
                </p>
              )}

              {/* Lista delle squadre con checkbox per la selezione */}
              {!isTeamsLoading && !isTeamsError && teams && (
                <ul className="max-h-60 overflow-auto rounded-md border bg-card px-3 py-2 space-y-1 text-sm">
                  {teams.map((team) => {
                    const checked = selectedTeamIds.includes(team.id);
                    return (
                      <li
                        key={team.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="size-3.5"
                            checked={checked}
                            onChange={() => toggleTeamSelection(team.id)}
                          />
                          <span>{team.name}</span>
                        </label>
                        <span className="text-[10px] text-gray-400">ID: {team.id}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={createTournamentMutation.isPending || !name.trim()}
              >
                {createTournamentMutation.isPending ? "Creazione in corso..." : "Crea torneo"}
              </Button>

              {/* Messaggi di feedback molto semplici */}
              {createTournamentMutation.isSuccess && (
                <span className="text-xs text-green-600">
                  Torneo creato con successo!
                </span>
              )}

              {createTournamentMutation.isError && (
                <span className="text-xs text-red-600">
                  Errore nella creazione del torneo.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentCreatePage;
