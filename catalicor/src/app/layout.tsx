// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar'; // ¡Importa la barra de navegación!

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Catalicor',
  description: 'Página de visualización de productos para licorerías.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <Navbar /> {/* Coloca la barra de navegación aquí */}
            <main className="min-h-screen">
              {children}
            </main>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}