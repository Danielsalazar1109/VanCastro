import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas públicas que siempre son accesibles
const publicRoutes = ['/', '/login', '/register', '/plans', '/faq', '/contact', '/booking', '/contracts', '/privacy-policy', '/complete-profile'];
const studentRoutes = ['/student', '/tracking'];
const instructorRoutes = ['/instructor'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es de API
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Verificar si es una ruta de recursos estáticos
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Log request cookies for debugging
    console.log('Middleware cookies:', request.cookies);
    
    // Obtener el token JWT y decodificarlo con configuración explícita
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      cookieName: "next-auth.session-token" // Ensure this matches the cookie name in NextAuth config
    });
    
    // Enhanced logging for debugging
    console.log('Middleware token:', token ? 'exists' : 'not found');
    if (!token) {
      console.log('Middleware cookies available:', Object.keys(request.cookies));
    }
    
    // No hay token (usuario no autenticado)
    if (!token) {
      console.log('No authenticated user detected in middleware');
      
      // Si intenta acceder a una ruta protegida, redirigir a login
      if (
        pathname.startsWith('/student') || 
        pathname.startsWith('/instructor') ||
        pathname.startsWith('/admin')
      ) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Permitir acceso a rutas públicas
      return NextResponse.next();
    }

    // Usuario autenticado
    console.log('Authenticated user detected in middleware, role:', token.role);
    
    // Redirigir usuarios autenticados en páginas públicas a su dashboard correspondiente
    if (publicRoutes.some(route => pathname === route)) {
      // Redirigir basado en el rol del usuario
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (token.role === 'instructor') {
        return NextResponse.redirect(new URL('/instructor', request.url));
      } else {
        // Por defecto, redirigir a estudiante
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }

    // Verificar acceso basado en roles para rutas protegidas
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      // Si no es admin, redirigir según su rol
      if (token.role === 'instructor') {
        return NextResponse.redirect(new URL('/instructor', request.url));
      } else {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }

    if (pathname.startsWith('/instructor') && token.role !== 'instructor' && token.role !== 'admin') {
      // Si no es instructor ni admin, redirigir a estudiante
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Permitir el acceso al usuario autenticado a las rutas permitidas según su rol
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of error, allow the request to proceed
    return NextResponse.next();
  }
}

// Configurar sobre qué rutas se aplica el middleware
export const config = {
  matcher: [
    /*
     * Hacer coincidir todas las rutas excepto:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /fonts (recursos estáticos)
     * 4. /favicon.ico (archivos de favicon)
     */
    '/((?!api|_next|fonts|favicon.ico).*)',
  ],
};