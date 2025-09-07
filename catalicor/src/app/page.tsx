// src/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import SignInButton from './components/SignInButton';
import AdminDashboard from './components/AdminDashboard';
import StoreDashboard from './components/StoreDashboard';
import ClientDashboard from './components/ClientDashboard';
import AllStores from './components/AllStores'; // ¡Importa AllStores!

export default function Home() {
  const { data: session, status } = useSession();

  // Muestra un estado de carga mientras se obtiene la sesión
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  // Muestra el panel de control correcto si el usuario está autenticado
  if (session) {
    // Si el usuario tiene sesión, renderiza el dashboard apropiado
    const role = session.user?.role;
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'store':
        return <StoreDashboard />;
      case 'client':
        // Si el cliente está autenticado, podría ver una vista diferente,
        // pero por ahora, que vea la lista de tiendas para poder comprar.
        return <AllStores />;
      default:
        return <p className="text-center mt-20">Bienvenido, usuario sin rol asignado.</p>;
    }
  }
  // Los usuarios no autenticados ven la lista de tiendas
  return <AllStores />;
}