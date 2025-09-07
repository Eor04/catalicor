// src/app/components/PaymentWithQR.tsx
'use client';

import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebaseConfig';

interface PaymentWithQRProps {
  storeId: string;
  qrImageURL: string;
  onPaymentSuccess: (receiptURL: string) => void;
}

export default function PaymentWithQR({ storeId, qrImageURL, onPaymentSuccess }: PaymentWithQRProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!receiptFile) {
      setError("Por favor, sube el comprobante de pago.");
      setLoading(false);
      return;
    }

    try {
      // Subir el comprobante a Firebase Storage
      const receiptRef = ref(storage, `receipts/${storeId}/${Date.now()}-${receiptFile.name}`);
      await uploadBytes(receiptRef, receiptFile);
      const receiptURL = await getDownloadURL(receiptRef);

      // Llamar a la función de éxito con la URL del comprobante
      onPaymentSuccess(receiptURL);
    } catch (err: any) {
      console.error("Error al subir el comprobante:", err);
      setError("Error al subir el comprobante. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUploadReceipt} className="p-6 border rounded-md shadow-lg w-full max-w-sm mx-auto">
      <h3 className="text-xl font-bold mb-4">Realizar Pago</h3>
      {qrImageURL ? (
        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">Escanea el código QR para pagar:</p>
          <img src={qrImageURL} alt="Código QR de la tienda" className="mx-auto w-48 h-48 object-contain border p-2" />
        </div>
      ) : (
        <p className="text-red-500 mb-4 text-center">No se encontró el código QR de la tienda.</p>
      )}

      <div className="mb-4">
        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">Subir Comprobante de Pago</label>
        <input
          type="file"
          id="receipt"
          onChange={handleFileChange}
          required
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading || !qrImageURL}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Subiendo...' : 'Confirmar Pago'}
      </button>
    </form>
  );
}