import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas públicas que siempre son accesibles
const publicRoutes = ['/', '/login', '/register', '/plans', '/faq', '/contact', '/booking', '/contracts'];
const studentRoutes = ['/student'];
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
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Log token for debugging
    console.log('Middleware token:', token);
    
    // No hay sesión (usuario no autenticado)
    if (!token) {
      console.log('No authenticated user detected in middleware');
      // Si intenta acceder a una ruta protegida, redirigir a login
      if (
        pathname.startsWith('/student') || 
        pathname.startsWith('/instructor') ||
        pathname.startsWith('/admin')
      ) {
        return NextResponse.redirect(new URL('/plans', request.url));
      }
      
      // Permitir acceso a rutas públicas
      return NextResponse.next();
    }

    // Usuario autenticado
    console.log('Authenticated user detected in middleware');
    
    // Access role directly from token
    const userRole = token.role as string || 'user';
    console.log('User role:', userRole);

    // Temporarily disable middleware redirection for authenticated users on public pages
    // to let the client-side redirection logic in the login page handle it
    console.log('Authenticated user detected, but letting client-side handle redirection');
    
    // Uncomment this block if you want to re-enable middleware redirection later
    /*
    // Si el usuario autenticado intenta acceder a páginas públicas como login o registro,
    // redirigir al dashboard correspondiente según su rol
    if (
      pathname === '/login' || 
      pathname === '/register' ||
      pathname === '/'
    ) {
      console.log('Authenticated user accessing public page, redirecting based on role');
      
      // Check if user has a phone number
      if (!token.phone || token.phone === "") {
        console.log("User doesn't have a phone number, redirecting to complete profile page");
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
      
      // Force redirection based on role
      let redirectUrl = '/student'; // Default for regular users
      
      if (userRole === 'admin') {
        console.log('Redirecting admin to admin dashboard');
        redirectUrl = '/admin';
      } else if (userRole === 'instructor') {
        console.log('Redirecting instructor to instructor dashboard');
        redirectUrl = '/instructor';
      }
      
      console.log(`Redirecting to: ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    */

    // Verificar permisos según el rol del usuario
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      if (userRole === 'instructor') {
        return NextResponse.redirect(new URL('/instructor', request.url));
      } else {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }

    if (pathname.startsWith('/instructor') && !['admin', 'instructor'].includes(userRole)) {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Permitir el acceso al usuario autenticado a las rutas permitidas
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