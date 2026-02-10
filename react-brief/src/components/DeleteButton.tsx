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

import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  // Funzione che verrà chiamata SOLO se l'utente conferma l'eliminazione
  onConfirm: () => void;
  // Testo del bottone, di default "Elimina"
  label?: string;
};

const DeleteButton = ({ onConfirm, label = "Elimina" }: DeleteButtonProps) => {
  const handleClick = () => {
    const confirmed = window.confirm("Sei sicuro di voler eliminare?");
    if (!confirmed) return;

    onConfirm();
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};

export default DeleteButton;
