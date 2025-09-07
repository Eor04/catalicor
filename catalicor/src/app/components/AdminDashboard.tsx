// src/app/components/AdminDashboard.tsx
'use client';

import CreateStoreForm from './CreateStoreForm';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-4">Panel de Administrador</h2>
      <p className="text-lg text-gray-600 mb-8">
        ¡Bienvenido! Aquí puedes gestionar las licorerías y a los clientes.
      </p>
      <div className="w-full max-w-2xl">
        <CreateStoreForm />
      </div>
    </div>
  );
}