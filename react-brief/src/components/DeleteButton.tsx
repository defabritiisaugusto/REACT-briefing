// DeleteButton
// ------------
// Questo componente rappresenta un bottone "Elimina" riutilizzabile.
// L'idea è: invece di riscrivere ogni volta il markup del bottone e la
// finestra di conferma, usi sempre questo componente e gli passi solo
// cosa deve succedere quando l'utente conferma l'eliminazione.
//
// Esempio d'uso:
// <DeleteButton onConfirm={() => deleteTeamMutation.mutate(team.id)} />
//
// - visualmente usa il Button "destructive" già definito nel progetto
// - mostra una conferma con window.confirm
// - se l'utente conferma, chiama la funzione onConfirm

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  onConfirm: () => void;
  label?: string;
};

const DeleteButton = ({ onConfirm, label = "Elimina" }: DeleteButtonProps) => {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    onConfirm();
    setConfirming(false);
  };

  return (
    <Button
      size="sm"
      onClick={handleDelete}
      className={`
        transition-all duration-200 border backdrop-blur-md
        ${
          confirming
            ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
            : "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
        }
      `}
    >
      {confirming ? "Confermi?" : `❌ ${label}`}
    </Button>
  );
};

export default DeleteButton;
