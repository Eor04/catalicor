// src/app/cart/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import PaymentWithQR from '../components/PaymentWithQR';
import Image from 'next/image';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [qrImageURL, setQrImageURL] = useState<string | null>(null);

  const handleProceedToPayment = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }
    if (!session || !session.user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      router.push('/login');
      return;
    }
    const storeId = cart[0].storeId;
    if (cart.some(item => item.storeId !== storeId)) {
      alert("No puedes tener productos de más de una tienda en tu carrito.");
      return;
    }
    try {
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        if (storeData.qrImageURL) {
          setQrImageURL(storeData.qrImageURL);
          setIsPaymentStep(true);
        } else {
          alert("La tienda no tiene un código QR configurado.");
        }
      } else {
        alert("Información de la tienda no encontrada.");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching QR code:", err.message);
        alert("Error al obtener el código QR.");
      }
    }
  };

  const handleCheckout = async (receiptURL: string) => {
    try {
      const storeId = cart[0].storeId;
      const orderDoc = {
        userId: session?.user?.id,
        storeId: storeId,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getCartTotal(),
        status: 'pending_payment_verification',
        paymentMethod: 'qr_transfer',
        receiptURL: receiptURL,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "orders"), orderDoc);
      alert("¡Pedido realizado con éxito! El pago será verificado por la tienda.");
      clearCart();
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al procesar el pedido:", err.message);
        alert("Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.");
      }
    }
  };

  if (cart.length === 0) {
    return <p className="text-center mt-20 text-lg">Tu carrito está vacío.</p>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tu Carrito de Compras</h1>
      {!isPaymentStep ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <Image src={item.imageURL} alt={item.name} width={64} height={64} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-16 text-center border rounded-md"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                  <p className="text-lg font-semibold w-20 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end items-center space-x-6">
            <p className="text-xl font-bold">Total: ${getCartTotal().toFixed(2)}</p>
            <button
              onClick={handleProceedToPayment}
              className="py-3 px-6 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Pagar
            </button>
          </div>
        </>
      ) : (
        <PaymentWithQR
          storeId={cart[0].storeId}
          qrImageURL={qrImageURL || ''}
          onPaymentSuccess={handleCheckout}
        />
      )}
    </div>
  );
}