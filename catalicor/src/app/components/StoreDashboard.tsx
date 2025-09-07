// src/app/components/StoreDashboard.tsx
'use client';

import StoreProfileForm from './StoreProfileForm';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement'; // ¡Importa OrderManagement!

export default function StoreDashboard() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-4">Panel de tu Licorería</h2>
      <div className="w-full max-w-4xl">
        <StoreProfileForm />
        <div className="my-8 h-px bg-gray-300"></div>
        <ProductManagement />
        <div className="my-8 h-px bg-gray-300"></div>
        <OrderManagement /> {/* Añade el componente de gestión de pedidos */}
      </div>
    </div>
  );
}