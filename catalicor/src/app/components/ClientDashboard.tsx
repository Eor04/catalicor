// src/app/components/ClientDashboard.tsx
'use client';

export default function ClientDashboard() {
  // Aquí se mostrarán las licorerías y productos disponibles,
  // así como el carrito de compras del usuario.
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-4">¡Bienvenido a tu cuenta!</h2>
      <p className="text-lg text-gray-600">
        Ahora puedes agregar productos a tu carrito y realizar pedidos.
      </p>
      {/* Componentes para ver productos, carrito de compras, etc. */}
    </div>
  );
}