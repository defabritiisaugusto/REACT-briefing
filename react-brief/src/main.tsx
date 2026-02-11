// main.tsx è il punto di ingresso dell'applicazione React, dove viene configurato il router con le diverse pagine e viene inizializzato il client di React Query.
// Utilizza React Router per definire le rotte dell'applicazione, con un layout principale (MainLayout) che include un header e un'area per il contenuto dinamico (Outlet).
// Inoltre, integra TanStack Devtools per il debugging di React Query, posizionandolo sul lato sinistro dello schermo.
// Le rotte principali includono la HomePage, la lista dei tornei, la gestione dei tornei, la creazione di nuovi tornei, il tabellone del torneo e la lista delle squadre.
// Importazione delle dipendenze necessarie per l'applicazione, tra cui React, React Router, React Query e i componenti delle pagine e del layout.




import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/MainPage";
import TournamentListPage from "./pages/TournamentListPage";
import TeamListPage from "./pages/TeamListPage";
import TournamentCreatePage from "./pages/TournamentCreatePage";
import TournamentBracketPage from "./pages/TournamentBracketPage";
import TournamentHistoryPage from "./pages/TournamentHistoryPage";
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, 
    children: [
      {
        index: true,
        element: <HomePage />, 
      },
      {
        path: "tournaments",
        element: <TournamentListPage />,
      },
      {
        path: "tournaments/history",
        element: <TournamentHistoryPage />,
      },
      {
        path: "tournaments/:id",
        element: <TournamentBracketPage />,
      },
      {
        path: "tournaments/create",
        element: <TournamentCreatePage />,
      },
      {
        path: "teams",
        element: <TeamListPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient()
// This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
    import("@tanstack/query-core").QueryClient;
  }
}
// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    < QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <TanStackDevtools config={{ position: 'middle-left' }} plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel />,
          defaultOpen: false,
        },
      ]} />
    </QueryClientProvider>
  </StrictMode>
)

