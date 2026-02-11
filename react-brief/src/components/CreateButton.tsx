import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamService } from "@/features/team/team.service";
import type { Team } from "@/features/team/team.type";

const CreateTeamForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const queryClient = useQueryClient();

  // Recuperiamo la lista delle squadre per controllare duplicati
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => TeamService.list(),
  });

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
