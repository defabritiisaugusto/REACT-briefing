// MainLayout è un componente React che definisce la struttura principale dell'applicazione, includendo un header con un menu di navigazione e un'area per il contenuto dinamico (Outlet)
//  che viene popolata dalle pagine figlie in base alla route.
// Utilizza React Router per gestire la navigazione tra le pagine, con link a Home, Organizza, Tornei e Squadre. Il layout è responsivo e centrato, con uno stile semplice e pulito.


import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <>

      <header className="px-4 w-full max-w-4xl mx-auto">
        <div className="p-2 mt-4 border rounded-2xl flex items-center justify-between">
          <p className="font-bold text-xl pl-2">Torneo Serie A</p>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/tournaments/manage" className="hover:underline">Organizza</Link>
            <Link to="/tournaments" className="hover:underline">Tornei</Link>
            <Link to="/teams" className="hover:underline">Squadre</Link>
          </nav>
        </div>
      </header>

      <Outlet  />
    </>
  )
}

export default MainLayout