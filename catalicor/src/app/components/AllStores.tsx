// src/app/components/AllStores.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
}

export default function AllStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const storesCollection = collection(db, "stores");
        const storesSnapshot = await getDocs(storesCollection);
        const storesList = storesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Store));
        setStores(storesList);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError("Error al cargar las licorerías.");
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Cargando licorerías...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Nuestras Licorerías</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div key={store.id} className="border rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <Link href={`/store/${store.id}`}>
              <h3 className="text-2xl font-semibold text-indigo-700 hover:underline">{store.name}</h3>
            </Link>
            <p className="mt-2 text-gray-600">{store.description}</p>
            <p className="mt-2 text-sm text-gray-500">Dirección: {store.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}