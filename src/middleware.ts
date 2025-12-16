// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pega o token do cookie (ou localStorage via cookie)
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Lista de rotas públicas (que não precisam de autenticação)
  const publicRoutes = [
    '/auth/login',
    '/auth/cadastro',
    '/auth/recuperar-senha',
    '/termos',
    '/privacidade'
  ];

  // Se está tentando acessar rota pública, deixa passar
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Se NÃO tem token e NÃO é rota pública → Redireciona pro login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    // Adiciona a URL original como parâmetro para redirecionar depois do login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se TEM token e está tentando acessar login/cadastro → Redireciona pra home
  if (token && isPublicRoute && pathname !== '/termos' && pathname !== '/privacidade') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Caso contrário, deixa passar
  return NextResponse.next();
}

// Configura quais rotas o middleware deve verificar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};