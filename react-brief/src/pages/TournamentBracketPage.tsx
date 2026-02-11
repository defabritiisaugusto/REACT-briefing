// Pagina sottile: legge l'ID del torneo dalla URL
// e delega tutta la logica del tabellone al componente
// TournamentBracket dentro le feature.

import { TournamentBracket } from "@/features/tournament/TournamentBracket";
import { useParams } from "react-router-dom";

const TournamentBracketPage = () => {
  const params = useParams();
  const tournamentId = Number(params.id);

  if (Number.isNaN(tournamentId)) {
    return <p className="mt-8 text-center">ID torneo non valido.</p>;
  }

  return <TournamentBracket tournamentId={tournamentId} />;
};

export default TournamentBracketPage;
