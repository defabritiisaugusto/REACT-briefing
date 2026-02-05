import TournamentList from "../features/tournament/TournamentList";
import TeamList from "../features/team/TeamList";

const HomePage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-4 pb-4">
      <h1 className="font-bold text-center text-4xl mb-8">Dashboard Tornei</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-semibold text-2xl mb-4">Tornei</h2>
          <TournamentList />
        </section>
        <section>
          <h2 className="font-semibold text-2xl mb-4">Squadre</h2>
          <TeamList />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
