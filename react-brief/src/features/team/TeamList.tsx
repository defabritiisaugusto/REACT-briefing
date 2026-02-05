import { useQuery } from "@tanstack/react-query";
import { TeamService } from "./team.service";
import type { Team } from "./team.type";


const TeamList = () => {
  const { data: teams = [], isPending, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: TeamService.list,
  })

  if (isPending) {
    return <div>Caricamento...</div>;
  }

  if (isError) {
    return <div>Errore nel caricamento delle squadre.</div>;
  }

  return (
    <div>
      <h1>Elenco Squadre</h1>
      </div>
  );
};

export default TeamList;
