import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import TournamentList from './features/tournament/TournamentList';
import TeamList from './features/team/TeamList';

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
        path: '/tournaments',
        element: <TournamentList />,
      },
      {
        path: '/teams',
        element: <TeamList />,
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

