// src/app/components/SignInButton.tsx
'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center justify-center gap-2 rounded-md bg-white p-2 text-gray-700 shadow-md transition-colors hover:bg-gray-100"
    >
      <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
      <span>Iniciar sesión con Google</span>
    </button>
  );
}