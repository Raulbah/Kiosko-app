import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "secreto-super-seguro-cambialo-en-env");

export interface SessionPayload {
    userId: string;
    name: string;
    role: string;      // Nombre del rol (ej. "Super Admin")
    branchId: string;
    exp?: number;
}

export async function createSession(payload: Omit<SessionPayload, "exp">) {
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h") // La sesión dura 8 horas (turno laboral)
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    
    cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // maxAge: 60 * 60 * 8 // 8 horas
    });
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
}