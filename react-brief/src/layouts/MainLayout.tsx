import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: "#2f7d32", // verde base del campo
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            #2f7d32 0 30px,
            #238b31 30px 60px
          ),
          linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.05))
        `,
        backgroundSize: "100% 60px",
        backgroundAttachment: "fixed",
      }}
    >
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
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
