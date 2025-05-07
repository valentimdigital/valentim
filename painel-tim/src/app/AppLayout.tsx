"use client";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";
import { ROUTES } from "@/config/routes";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#00348D] text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src="/logo-tim.png" alt="TIM" className="h-8" />
                <h1 className="text-xl font-bold">Painel de Vendas</h1>
              </div>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link 
                      href={ROUTES.DASHBOARD} 
                      className={`hover:text-gray-200 ${pathname === ROUTES.DASHBOARD ? 'font-bold' : ''}`}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={ROUTES.CLIENTES} 
                      className={`hover:text-gray-200 ${pathname.startsWith(ROUTES.CLIENTES) ? 'font-bold' : ''}`}
                    >
                      Clientes
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={ROUTES.ATENDIMENTO} 
                      className={`hover:text-gray-200 ${pathname === ROUTES.ATENDIMENTO ? 'font-bold' : ''}`}
                    >
                      Atendimento
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={ROUTES.CONFIGURACAO} 
                      className={`hover:text-gray-200 ${pathname === ROUTES.CONFIGURACAO ? 'font-bold' : ''}`}
                    >
                      Configuração
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </Providers>
  );
} 