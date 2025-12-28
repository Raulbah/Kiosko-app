"use server";

import prisma from "../db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logout } from "@/lib/auth";

const LoginSchema = z.object({
    employeeId: z.string().min(1, "El ID es requerido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

export async function loginAction(prevState: any, formData: FormData) {
    // 1. Validar inputs
    const result = LoginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: "Datos inválidos" };
    }

    const { employeeId, password } = result.data;

    try {
        // 2. Buscar usuario
        const user = await prisma.user.findUnique({
            where: { employeeId },
            include: { role: true }, // Traemos el rol para guardarlo en sesión
        });

        if (!user || !user.isActive) {
            return { error: "Credenciales incorrectas o usuario inactivo" };
        }

        // 3. Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: "Credenciales incorrectas" };
        }

        // 4. Crear Sesión (Cookie)
        await createSession({
            userId: user.id,
            name: user.name,
            role: user.role.name,
            branchId: user.branchId,
        });

    } catch (error) {
        console.error("Login error:", error);
        return { error: "Error del servidor" };
    }

    // 5. Redirigir (Fuera del try-catch por el funcionamiento de Next.js redirect)
    redirect("/admin/dashboard");
}

export async function logoutAction() {
    await logout();
    redirect("/login");
}