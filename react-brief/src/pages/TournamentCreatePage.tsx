// TournamentCreatePage
// ---------------------
// Questa pagina permette di creare un nuovo torneo.
// È pensata per essere molto semplice da spiegare:
// - c'è un piccolo form con alcuni campi di base (nome, data)
// - possiamo anche selezionare le squadre da inserire nel torneo
// - quando invii il form, chiamiamo TournamentService.create
// - se va bene, svuotiamo i campi, aggiorniamo la lista dei tornei
// - e iscriviamo le squadre selezionate al nuovo torneo tramite TournamentTeamService

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import { TournamentService } from "@/features/tournament/tournament.service";
import { TournamentTeamService } from "@/features/tournament_team/tournament_team.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

const TournamentCreatePage = () => {
  // stato locale per gestire il valore dei campi del form
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  // array di ID delle squadre selezionate per il torneo (max 8 per semplicità)
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  // queryClient ci serve per invalidare la lista "tournaments" dopo una creazione
  const queryClient = useQueryClient();

  // useMutation per creare un nuovo torneo E iscrivere le squadre selezionate
  // mutationFn definisce cosa succede quando "lanciamo" la mutation:
  // 1) creiamo il torneo
  // 2) per ogni squadra selezionata chiamiamo TournamentTeamService.create
  const createTournamentMutation = useMutation({
    mutationFn: async (payload: { name: string; date?: string; place: string; teamIds: number[] }) => {
      // 1) creiamo il torneo sul backend
      const tournament = await TournamentService.create({
        name: payload.name,
        date: payload.date,
        place: payload.place,
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
    const trimnedPlace = place.trim();
    if (!trimmedName) return;

    // Inviamo nome, data (se presente) e l'elenco delle squadre selezionate.
    createTournamentMutation.mutate({
      name: trimmedName,
      date: date || undefined,
      teamIds: selectedTeamIds,
      place: trimnedPlace,

    });
  };

  return (
    <div className="space-y-10 pb-10">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 Organizza Nuovo Torneo
        </h1>
        <p className="text-white/70 mt-2">
          Crea un evento ufficiale e seleziona le squadre partecipanti
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nome torneo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Nome del torneo
            </label>
            <Input
              placeholder="Es. Torneo Defa Cup"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Data del torneo
            </label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-black/30 border-white/20 text-white"
            />
          </div>
          {/* Luogo del torneo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Luogo del torneo
            </label>
            <Input
              id="tournament-place"
              placeholder="Es. Campetto Defa"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Selezione squadre */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              ⚽ Seleziona le squadre
              <span className="ml-2 text-xs text-yellow-400">
                (max 8 – selezionate: {selectedTeamIds.length})
              </span>
            </p>

            {isTeamsLoading && (
              <p className="text-sm text-yellow-400 animate-pulse">
                Caricamento squadre...
              </p>
            )}

            {isTeamsError && (
              <p className="text-sm text-red-400">
                Errore nel caricamento delle squadre.
                {teamsError instanceof Error && (
                  <span className="block text-xs opacity-70">
                    {teamsError.message}
                  </span>
                )}
              </p>
            )}

            {!isTeamsLoading && !isTeamsError && teams && (
              <div className="grid sm:grid-cols-2 gap-3 max-h-72 overflow-auto pr-2">
                {teams.map((team) => {
                  const checked = selectedTeamIds.includes(team.id);

                  return (
                    <div
                      key={team.id}
                      onClick={() => toggleTeamSelection(team.id)}
                      className={`cursor-pointer rounded-xl p-3 border transition-all duration-200
                      ${checked
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">
                          {team.name}
                        </span>
                        <span className="text-xs text-white/40">
                          ID: {team.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTTONI E FEEDBACK */}
          <div className="flex items-center gap-4 pt-4">

            <Button
              type="submit"
              disabled={createTournamentMutation.isPending || !name.trim()}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold uppercase tracking-wide px-6"
            >
              {createTournamentMutation.isPending
                ? "Creazione in corso..."
                : "Crea Torneo"}
            </Button>

            {createTournamentMutation.isSuccess && (
              <span className="text-sm text-green-400 font-semibold">
                ✅ Torneo creato con successo!
              </span>
            )}

            {createTournamentMutation.isError && (
              <span className="text-sm text-red-400 font-semibold">
                ❌ Errore nella creazione del torneo.
              </span>
            )}
          </div>

        </form>
      </div>
    </div>
  );

};

export default TournamentCreatePage;
