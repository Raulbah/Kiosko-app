// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "./types/auth-types";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(payload: Omit<SessionPayload, "exp">) {
    const token = await new SignJWT(payload as any) // Casteo controlado solo al firmar
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function verifySession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}

// Helper para verificar permisos en Server Actions (Backend Gatekeeper)
export async function checkPermission(
    moduleSlug: string, 
    action: "create" | "read" | "update" | "delete"
) {
    const session = await verifySession();
    if (!session) throw new Error("Unauthorized");

    const modulePerm = session.permissions.find(p => p.module === moduleSlug);
    
    if (!modulePerm || !modulePerm.actions[action]) {
        throw new Error(`Forbidden: Missing ${action} permission for ${moduleSlug}`);
    }
    
    return session; // Retorna la sesión si es válido
}