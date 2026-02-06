import { useQuery } from "@tanstack/react-query";
import { TeamService } from "./team.service";

const TeamList = () => {
  const { data: _, isPending, isError } = useQuery({
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
    <div className="grid grid-cols-2 gap-6">
      
      <h1>Elenco Squadre</h1>
      </div>
  );
};

export default TeamList;
