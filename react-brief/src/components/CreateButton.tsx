// CreateTeamForm
// --------------
// Questo componente rappresenta il piccolo form per creare una nuova squadra.
// Cosa fa, in sintesi:
// - gestisce in locale il nome della nuova squadra tramite useState
// - usa React Query per leggere la lista delle squadre esistenti (per evitare duplicati)
// - usa una mutation per chiamare TeamService.create quando invii il form
// - mostra un messaggio di successo o errore sotto al form.
// Lo usiamo nella pagina TeamListPage per permettere di aggiungere rapidamente una squadra.

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";

const CreateTeamForm = () => {
  // useState
  // -------
  // useState crea uno stato locale dentro il componente.
  // Qui lo usiamo per gestire:
  // - il valore dell'input (name)
  // - l'eventuale messaggio di errore/successo mostrato sotto il form.
  // Ogni volta che chiamiamo setName o setMessage, il componente viene ri-renderizzato.
  // Stato locale per il nome inserito e per il messaggio di feedback
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // useQueryClient ci permette di interagire con la cache di React Query
  const queryClient = useQueryClient();

  // useQuery
  // --------
  // Questa query legge la lista di tutte le squadre dal backend.
  // Qui ci serve solo per fare un controllo di unicità sul nome (niente squadre duplicate).
  // - queryKey: ["teams"] identifica questa query nella cache
  // - queryFn: TeamService.list esegue la richiesta HTTP.
  // Recuperiamo la lista delle squadre per controllare duplicati
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

  // useMutation
  // -----------
  // useMutation ci serve per eseguire l'operazione di creazione di una nuova squadra.
  // - mutationFn: cosa succede quando chiamiamo createTeamMutation.mutate(teamName)
  // - onSuccess: azioni da fare in caso di successo (svuota input, mostra messaggio, ricarica lista teams)
  // - onError: gestisce eventuali errori, mostrando un messaggio all'utente.
  const createTeamMutation = useMutation({
    mutationFn: async (teamName: string) => {
      return TeamService.create({ name: teamName });
    },
    onSuccess: () => {
      setName("");
      setMessage({ type: "success", text: "Squadra creata con successo!" });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => {
      setMessage({ type: "error", text: "Errore durante la creazione della squadra." });
    },
  });

  // Gestione invio form: controllo duplicato e lancio della mutation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Controllo duplicati
    const nameExists = teams?.some((team) => team.name.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      setMessage({ type: "error", text: "Esiste già una squadra con questo nome!" });
      return;
    }

    createTeamMutation.mutate(trimmedName);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex gap-2">
        <Input
          placeholder="Nome della squadra"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setMessage(null); // reset messaggi quando scrive
          }}
        />
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={!name.trim() || createTeamMutation.isPending}
        >
          {createTeamMutation.isPending ? "Creazione..." : "Crea squadra"}
        </Button>
      </div>

      {message && (
        <span
          className={`text-sm ${
            message.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message.text}
        </span>
      )}
    </form>
  );
};

export default CreateTeamForm;
