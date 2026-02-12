// TournamentCreate
// ----------------
// Componente feature responsabile della CREAZIONE di un nuovo torneo.
// Si occupa di:
// - raccogliere dal form nome, data e luogo del torneo
// - permettere la selezione fino a 8 squadre partecipanti
// - chiamare il backend per:
//   1) creare il torneo (tournaments)
//   2) creare i 3 round standard (rounds: Quarti, Semifinali, Finale)
//   3) iscrivere le squadre selezionate al torneo (tournament_team)
// - ripulire i campi e mostrare un messaggio di successo quando tutto va a buon fine.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";
import { TournamentService } from "@/features/tournament/tournament.service";
import { TournamentTeamService } from "@/features/tournament_team/tournament_team.service";
import { RoundService } from "@/features/round/round.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

export const TournamentCreate = () => {
  // Stato locale per i campi del form (controllati)
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  const queryClient = useQueryClient();

  // createTournamentMutation
  // ------------------------
  // Incapsula tutta la logica di creazione torneo lato backend:
  // - crea il record nella tabella tournaments
  // - crea i 3 round standard associati al torneo
  // - crea le righe di iscrizione nella tabella tournament_team
  // In onSuccess ripuliamo il form e invalidiamo la lista dei tornei.
  const createTournamentMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      date?: string;
      place: string;
      teamIds: number[];
    }) => {
      const tournament = await TournamentService.create({
        name: payload.name,
        date: payload.date,
        place: payload.place,
      });

      await RoundService.create({
        data: {
          idTournament: tournament.id,
          name: "Quarti di finale",
          status: "pending",
        },
      });

      await RoundService.create({
        data: {
          idTournament: tournament.id,
          name: "Semifinali",
          status: "pending",
        },
      });

      await RoundService.create({
        data: {
          idTournament: tournament.id,
          name: "Finale",
          status: "pending",
        },
      });

      for (let index = 0; index < payload.teamIds.length; index++) {
        const teamId = payload.teamIds[index];
        await TournamentTeamService.create({
          teamId,
          tournamentId: tournament.id,
          position: index + 1,
        });
      }

      return tournament;
    },
    onSuccess: () => {
      setName("");
      setDate("");
      setPlace("");
      setSelectedTeamIds([]);
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  // Query che carica tutte le squadre disponibili, così l'utente può selezionarle
  // per inserirle nel nuovo torneo.
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    error: teamsError,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // toggleTeamSelection
  // --------------------
  // Aggiunge o rimuove una squadra dalla selezione locale,
  // limitando il numero massimo a 8.
  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeamIds((current) => {
      const isAlreadySelected = current.includes(teamId);

      if (isAlreadySelected) {
        return current.filter((id) => id !== teamId);
      }

      if (current.length >= 8) {
        return current;
      }

      return [...current, teamId];
    });
  };

  // handleSubmit
  // ------------
  // Intercetta l'invio del form, valida i dati minimi (nome non vuoto)
  // e poi lancia la mutation di creazione torneo con tutti i dati necessari.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPlace = place.trim();
    if (!trimmedName) return;

    createTournamentMutation.mutate({
      name: trimmedName,
      date: date || undefined,
      teamIds: selectedTeamIds,
      place: trimmedPlace,
    });
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          🏆 Organizza Nuovo Torneo
        </h1>
        <p className="text-white/70 mt-2">
          Crea un evento ufficiale e seleziona le squadre partecipanti
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="pt-2 flex items-center justify-between">
            {createTournamentMutation.isSuccess && !createTournamentMutation.isPending && (
              <p className="text-sm text-green-400">
                ✅ Torneo creato correttamente!
              </p>
            )}

            <Button
              type="submit"
              disabled={createTournamentMutation.isPending}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 shadow-lg shadow-yellow-400/30"
            >
              {createTournamentMutation.isPending
                ? "Creazione in corso..."
                : "Crea torneo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentCreate;
