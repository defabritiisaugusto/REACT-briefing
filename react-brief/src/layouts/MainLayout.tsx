// MainLayout
// ----------
// Questo layout definisce l'aspetto "di base" di tutta l'app:
// - sfondo stile campo da calcio
// - header con il titolo del torneo e il menu di navigazione principale
// - area centrale dove React Router inserisce dinamicamente la pagina corrente tramite <Outlet />.
// In pratica: tutto ciò che è comune a tutte le pagine sta qui, mentre i contenuti cambiano all'interno dell'Outlet.

import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen text-white bg-[repeating-linear-gradient(0deg,#2f7d32_0_30px,#238b31_30px_60px),linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.05))] bg-[length:100%_60px] bg-fixed">
      <header className="px-4 w-full max-w-6xl mx-auto">
        <div className="p-4 mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex items-center justify-between">
          <p className="font-extrabold text-2xl tracking-wider uppercase text-yellow-400 drop-shadow-lg">
            🏆 TORNEO DEFA
          </p>

          <nav className="flex flex-wrap gap-6 text-sm font-semibold tracking-wide">
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors duration-200 hover:scale-105 transform"
            >
              Pagina Iniziale
            </Link>

            <Link
              to="/tournaments/create"
              className="hover:text-yellow-400 transition-colors duration-200 hover:scale-105 transform"
            >
              Crea Nuovo Torneo
            </Link>

            <Link
              to="/tournaments"
              className="hover:text-yellow-400 transition-colors duration-200 hover:scale-105 transform"
            >
              Tornei
            </Link>

            <Link
              to="/tournaments/history"
              className="hover:text-yellow-400 transition-colors duration-200 hover:scale-105 transform"
            >
              Storico Tornei
            </Link>

            <Link
              to="/teams"
              className="hover:text-yellow-400 transition-colors duration-200 hover:scale-105 transform"
            >
              Squadre
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 w-full max-w-6xl mx-auto mt-10 pb-16">
        {/* Qui React Router renderizza la pagina corrispondente alla rotta attuale */}
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
