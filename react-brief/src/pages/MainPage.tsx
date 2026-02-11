// TeamPage è la pagina principale dell'applicazione, che mostra una panoramica dei tornei e delle squadre disponibili.
// Utilizza i componenti TournamentList e TeamList per visualizzare rispettivamente la lista dei tornei e la lista delle squadre, organizzati in una griglia responsive.

import TeamList from "@/features/team/TeamList";
import TournamentListPage from "./TournamentListPage";


const MainPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-4 pb-4">
      <h1 className="font-bold text-center text-4xl mb-8">Benvenuto nel Sistema di Tornei</h1>
      <p className="text-center text-lg text-white">Sistema di gestione tornei a eliminazione diretta</p>
      <TournamentListPage />
      <TeamList />
    </div>
  );
};

export default MainPage;
