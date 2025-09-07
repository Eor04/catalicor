// src/app/store/[storeId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { useCart } from '@/app/context/CartContext'; // Importa el hook del carrito
import { useSession } from 'next-auth/react'; // Importa el hook de la sesión

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageURL: string;
  storeId: string;
}

interface Store {
  name: string;
  description: string;
}

export default function StorePage({ params }: { params: { storeId: string } }) {
  const { storeId } = params;
  const { data: session, status } = useSession(); // Usa el hook de la sesión
  const { addToCart } = useCart(); // Usa el hook del carrito
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // La lógica de la llamada a la base de datos es la misma
    async function fetchData() {
      try {
        const storeDocRef = doc(db, "stores", storeId);
        const storeDoc = await getDoc(storeDocRef);
        if (storeDoc.exists()) {
          setStore(storeDoc.data() as Store);
        }

        const productsCollection = collection(db, "products");
        const q = query(productsCollection, where("storeId", "==", storeId));
        const productsSnapshot = await getDocs(q);
        const productsList = productsSnapshot.docs.map(pDoc => ({
          id: pDoc.id,
          ...pDoc.data()
        } as Product));
        setProducts(productsList);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos de la tienda.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [storeId]);

  if (loading || status === 'loading') {
    return <p className="text-center mt-20">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-20">{error}</p>;
  }

  if (!store) {
    return <p className="text-center mt-20">Tienda no encontrada.</p>;
  }

  const isClient = session?.user?.role === 'client';

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{store.description}</p>
      <hr className="my-6" />

      <h2 className="text-3xl font-bold mb-4">Productos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <p>Esta tienda aún no tiene productos.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="border rounded-lg shadow-md p-4 flex flex-col items-center text-center">
              <img src={product.imageURL} alt={product.name} className="w-40 h-40 object-cover mb-4" />
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600 mt-1">Precio: **${product.price}**</p>
              <p className="text-gray-500 text-sm">Stock: {product.stock}</p>
              {isClient && product.stock > 0 && (
                <button
                  onClick={() => addToCart({ ...product, quantity: 1 })}
                  className="mt-4 py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Añadir al Carrito
                </button>
              )}
              {!isClient && <p className="mt-4 text-sm text-gray-500">Inicia sesión para agregar al carrito</p>}
              {product.stock === 0 && <p className="mt-4 text-sm text-red-500">Sin stock</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}