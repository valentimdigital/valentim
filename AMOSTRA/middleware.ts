import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware para verificar autenticação e permissões
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Definir rotas públicas que não precisam de autenticação
  const publicPaths = ['/login', '/api/auth'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Se for uma rota pública, permitir acesso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = await getToken({ req: request });

  // Se não estiver autenticado, redirecionar para login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Verificar permissões para rotas específicas
  if (path.startsWith('/admin') && token.nivelAcesso !== 'total') {
    // Redirecionar para dashboard se tentar acessar área de admin sem permissão
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Permitir acesso para usuários autenticados com permissões adequadas
  return NextResponse.next();
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: [
    // Aplicar a todas as rotas exceto arquivos estáticos, favicon e api/auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
