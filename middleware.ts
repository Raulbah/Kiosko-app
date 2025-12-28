import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Proteger rutas administrativas
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get("session_token")?.value;

        // Si no hay token, fuera
        if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
        }

        // Si el token es inválido, fuera
        const payload = await verifySessionToken(token);
        if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url));
        }
        
        // Opcional: Validar roles específicos aquí si fuera necesario
        return NextResponse.next();
    }

    // 2. Redirigir si ya está logueado e intenta entrar al login
    if (pathname === "/login") {
        const token = request.cookies.get("session_token")?.value;
        if (token) {
            // Verificar validez antes de redirigir
            const payload = await verifySessionToken(token);
            if (payload) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }
        }
    }

    return NextResponse.next();
}

// Configuración: A qué rutas afecta
export const config = {
    matcher: ["/admin/:path*", "/login"],
};