import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <>

      <header className="px-4 w-full max-w-4xl mx-auto">
        <div className="p-2 mt-4 border rounded-2xl flex items-center justify-between">
          <p className="font-bold text-xl pl-2">Tournament Manager</p>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/tournaments" className="hover:underline">Tornei</Link>
            <Link to="/teams" className="hover:underline">Squadre</Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </>
  )
}

export default MainLayout