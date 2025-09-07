// src/app/components/OrderManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/utils/firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod?: string;
  receiptURL?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function OrderManagement() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeId = session?.user?.id;

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, where("storeId", "==", storeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList: Order[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Order));
      setOrders(ordersList);
      setLoading(false);
    }, (err) => {
      if (err instanceof Error) {
        console.error("Error fetching orders:", err.message);
        setError("Error al cargar los pedidos.");
      }
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error updating order status:", err.message);
        setError("No se pudo actualizar el estado del pedido.");
      }
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Cargando pedidos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold mb-4">Pedidos Recibidos</h3>
      {orders.length === 0 ? (
        <p>No tienes pedidos pendientes.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-md shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">Pedido #{order.id.slice(0, 6)}</h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  order.status === 'pending_payment_verification' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Total: **${order.total.toFixed(2)}**</p>
              
              {order.paymentMethod === 'qr_transfer' && order.receiptURL && (
                <div className="my-4">
                  <p className="text-sm font-semibold mb-2">Comprobante de Pago:</p>
                  <a href={order.receiptURL} target="_blank" rel="noopener noreferrer">
                    <Image src={order.receiptURL} alt="Comprobante de Pago" width={192} height={192} className="w-48 h-auto border rounded-md" />
                  </a>
                </div>
              )}
              <div className="border-t pt-2">
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm">
                    {item.name} x{item.quantity} (${item.price.toFixed(2)})
                  </p>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                {order.status === 'pending_payment_verification' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'accepted')}
                      className="py-1 px-3 rounded-md bg-green-600 text-white text-sm"
                    >
                      Verificar y Aceptar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      className="py-1 px-3 rounded-md bg-red-600 text-white text-sm"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    className="py-1 px-3 rounded-md bg-blue-600 text-white text-sm"
                  >
                    Marcar como entregado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}