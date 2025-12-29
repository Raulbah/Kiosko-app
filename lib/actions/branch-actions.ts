"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { BranchFormSchema } from "@/lib/schemas/branch-schema";

// Helper para convertir "Sucursal Norte" a "sucursal-norte"
function generateSlug(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-") // Reemplaza espacios y caracteres raros con guiones
        .replace(/^-+|-+$/g, ""); // Elimina guiones al inicio/final
}

// Helper de seguridad RBAC
async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = user?.role.permissions.find(p => p.module.slug === "branches");
    
    if (!permission) throw new Error("Sin permisos para este módulo");

    const map = {
        create: permission.canCreate,
        read: permission.canRead,
        update: permission.canUpdate,
        delete: permission.canDelete,
    };

    if (!map[action]) throw new Error("No tienes permiso para realizar esta acción");
}

export async function createBranchAction(data: any) {
    try {
        await checkPermission("create");
        const validated = BranchFormSchema.parse(data);
        const slug = generateSlug(validated.name);

        // Validar slug único
        const existing = await prisma.branch.findUnique({ where: { slug } });
        if (existing) {
            return { success: false, message: "Ya existe una sucursal con nombre similar (slug duplicado)." };
        }

        await prisma.branch.create({
        data: {
            name: validated.name,
            address: validated.address,
            isActive: validated.isActive,
            slug: slug,
        }
        });

        revalidatePath("/admin/branches");
        return { success: true, message: "Sucursal creada correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear sucursal" };
    }
}

export async function updateBranchAction(id: string, data: any) {
    try {
        await checkPermission("update");
        const validated = BranchFormSchema.parse(data);
        
        // Opcional: Regenerar slug si cambia el nombre. 
        // Riesgo: Si cambias el slug, las URLs viejas (si las usaras) fallarían.
        // Para este sistema interno, regenerarlo está bien para mantener consistencia.
        const slug = generateSlug(validated.name);

        // Verificar duplicado solo si el slug cambió y ya existe en OTRO ID
        const existing = await prisma.branch.findFirst({
            where: { slug, NOT: { id } }
        });
        if (existing) {
            return { success: false, message: "El nombre genera un slug duplicado con otra sucursal." };
        }

        await prisma.branch.update({
        where: { id },
        data: {
            name: validated.name,
            address: validated.address,
            isActive: validated.isActive,
            slug: slug
        }
        });

        revalidatePath("/admin/branches");
        return { success: true, message: "Sucursal actualizada correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar" };
    }
}

export async function deleteBranchAction(id: string) {
    try {
        await checkPermission("delete");

        // Soft Delete (recomendado para sucursales con historial)
        await prisma.branch.update({
            where: { id },
            data: { isActive: false }
        });
        
        revalidatePath("/admin/branches");
        return { success: true, message: "Sucursal desactivada correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al eliminar" };
    }
}