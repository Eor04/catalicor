// src/app/components/CreateStoreForm.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from '@/utils/firebaseConfig';

const auth = getAuth(app);

export default function CreateStoreForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (session?.user?.role !== 'admin') {
      setError("Acceso denegado. Solo los administradores pueden crear licorerías.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "store",
        storeName: storeName,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "stores", user.uid), {
        name: storeName,
        userId: user.uid,
        isActive: true,
      });

      alert('¡Licorería creada con éxito!');
      setEmail('');
      setPassword('');
      setStoreName('');
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al crear la licorería:", err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 border rounded-md shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Crear Licorería</h2>
      
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="mb-4">
        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Nombre de la Licorería</label>
        <input
          type="text"
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Licorería'}
      </button>
    </form>
  );
}