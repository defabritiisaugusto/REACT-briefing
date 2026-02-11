import { useQuery } from "@tanstack/react-query";
import { TeamService } from "./team.service";

const TeamList = () => {
  const { data: teams, isPending, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: TeamService.list,
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-yellow-400 text-lg font-semibold tracking-wide">
          ⚽ Caricamento squadre...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-6 rounded-2xl text-center shadow-xl">
        ❌ Errore nel caricamento delle squadre.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Titolo sezione */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-400 drop-shadow-lg">
          ⚽ Elenco Squadre
        </h1>
        <p className="text-white/70 mt-2">
          Le squadre partecipanti al torneo
        </p>
      </div>

      {/* Griglia squadre */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team: any) => (
          <div
            key={team.id}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              
              <h2 className="text-lg font-bold tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                {team.name}
              </h2>

              <span className="text-2xl">⚽</span>
            </div>

            <div className="mt-4 text-sm text-white/70">
              ID Squadra: {team.id}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TeamList;
