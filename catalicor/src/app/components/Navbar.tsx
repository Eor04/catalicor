// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useSession } from 'next-auth/react';
import SignInButton from './SignInButton';

export default function Navbar() {
  const { cart } = useCart();
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <Link href="/" className="text-2xl font-bold text-indigo-600">
        Catalicor
      </Link>
      <div className="flex items-center space-x-4">
        {session?.user?.role === 'client' && (
          <Link href="/cart" className="relative text-lg text-gray-700 hover:text-gray-900">
            Carrito ({cart.length})
          </Link>
        )}
        <SignInButton />
      </div>
    </nav>
  );
}