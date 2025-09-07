// src/app/components/StoreProfileForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/utils/firebaseConfig';
import Image from 'next/image';

export default function StoreProfileForm() {
  const { data: session } = useSession();
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    address: '',
    qrImageURL: '',
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const storeId = session?.user?.id;

  useEffect(() => {
    async function fetchStoreData() {
      if (!storeId) return;
      try {
        const storeDocRef = doc(db, "stores", storeId);
        const storeDoc = await getDoc(storeDocRef);
        if (storeDoc.exists()) {
          setStoreData(storeDoc.data() as typeof storeData);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching store data:", err.message);
          setError("Error al cargar los datos de la tienda.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStoreData();
  }, [storeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQrFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!storeId) {
      setError("No se pudo obtener el ID de la tienda.");
      setLoading(false);
      return;
    }

    let qrImageURL = storeData.qrImageURL;
    try {
      if (qrFile) {
        const storageRef = ref(storage, `store-qrs/${storeId}`);
        await uploadBytes(storageRef, qrFile);
        qrImageURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "stores", storeId), {
        ...storeData,
        qrImageURL,
      }, { merge: true });

      setSuccess("¡Perfil actualizado con éxito!");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error saving store data:", err.message);
        setError(err.message || "Error al actualizar el perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 border rounded-md shadow-lg w-full max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-4">Editar Perfil</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Licorería</label>
        <input type="text" id="name" name="name" value={storeData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea id="description" name="description" value={storeData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
        <input type="text" id="address" name="address" value={storeData.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div className="mb-4">
        <label htmlFor="qrImage" className="block text-sm font-medium text-gray-700">Subir Código QR</label>
        <input type="file" id="qrImage" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
        {storeData.qrImageURL && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">QR actual:</p>
            <Image src={storeData.qrImageURL} alt="QR de la tienda" width={128} height={128} className="mt-1 w-32 h-32 object-contain" />
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}