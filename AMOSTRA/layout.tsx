import { type ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Painel de Vendas TIM',
  description: 'Sistema de gerenciamento de clientes empresariais da TIM',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(
        inter.className,
        "min-h-screen bg-gray-50"
      )}>
        {children}
      </body>
    </html>
  );
}
