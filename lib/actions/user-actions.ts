// lib/actions/user-actions.ts
"use server";

import { z } from "zod";
import prisma from "../db";
import { checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ActionState } from "@/lib/types/auth-types";

const CreateUserSchema = z.object({
    name: z.string().min(2),
    employeeId: z.string().min(3),
    roleId: z.string().uuid(),
    branchId: z.string().uuid(),
});

export async function createUserAction(
    prevState: ActionState, 
    formData: FormData
): Promise<ActionState> {
    // 1. Verificar Permisos (Lado Servidor - Seguridad Crítica)
    try {
        await checkPermission("users", "create");
    } catch (e) {
        return { success: false, message: "No tienes permisos para crear usuarios." };
    }

    // 2. Validar Datos
    const rawData = Object.fromEntries(formData.entries());
    const validated = CreateUserSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: "Error de validación",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    // 3. Lógica de Negocio
    try {
        const { employeeId, name, roleId, branchId } = validated.data;
        
        // Password por defecto = employeeId
        const hashedPassword = await bcrypt.hash(employeeId, 10);

        await prisma.user.create({
            data: {
                employeeId,
                name,
                roleId,
                branchId,
                password: hashedPassword,
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true, message: "Usuario creado exitosamente" };
    } catch (error) {
        // IMPORTANTE: No retornar el error crudo de la BD al cliente
        console.error(error);
        return { success: false, message: "Error al crear usuario. El ID podría estar duplicado." };
    }
}