import { TournamentService } from "./tournament.service";
import { useQuery } from "@tanstack/react-query";

const TournamentList = () => {
  const { data: tournaments = [], isPending, isError } = useQuery({
    queryKey: ['tournaments'],
    queryFn: TournamentService.prototype.list,
  })

  if (isPending) {
    return <div>Caricamento...</div>;
  }

  if (isError) {
    return <div>Errore nel caricamento dei tornei.</div>;
  }

  return (
    <div>
      <h1>Elenco Tornei</h1>
    </div>
  );

};

export default TournamentList;
