"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { RoleFormSchema } from "@/lib/schemas/role-schema";

// Helper de seguridad
async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = user?.role.permissions.find(p => p.module.slug === "roles");
    if (!permission?.[action === "create" ? "canCreate" : action === "update" ? "canUpdate" : action === "delete" ? "canDelete" : "canRead"]) {
        throw new Error("No tienes permiso para realizar esta acción");
    }
}

export async function createRoleAction(data: any) {
    try {
        await checkPermission("create");
        
        // Validación Zod
        const validated = RoleFormSchema.parse(data);

        await prisma.$transaction(async (tx) => {
        // 1. Crear Rol
        const newRole = await tx.role.create({
            data: { name: validated.name }
        });

        // 2. Crear Permisos asociados
        const permissionsData = validated.permissions.map(p => ({
            roleId: newRole.id,
            moduleId: p.moduleId,
            canCreate: p.canCreate,
            canRead: p.canRead,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete
        }));

        await tx.permission.createMany({ data: permissionsData });
        });

        revalidatePath("/admin/roles");
        return { success: true, message: "Rol creado correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear rol" };
    }
}

export async function updateRoleAction(roleId: string, data: any) {
    try {
        await checkPermission("update");
        const validated = RoleFormSchema.parse(data);

        await prisma.$transaction(async (tx) => {
            // 1. Actualizar nombre del Rol
            await tx.role.update({
                where: { id: roleId },
                data: { name: validated.name }
            });

            // 2. Actualizar Permisos (Iteramos uno por uno con Upsert)
            // Upsert: Si existe lo actualiza, si no (nuevo módulo) lo crea.
            for (const p of validated.permissions) {
                await tx.permission.upsert({
                    where: {
                        roleId_moduleId: { roleId, moduleId: p.moduleId } // Llave compuesta única
                    },
                    update: {
                        canCreate: p.canCreate,
                        canRead: p.canRead,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete
                    },
                    create: {
                        roleId,
                        moduleId: p.moduleId,
                        canCreate: p.canCreate,
                        canRead: p.canRead,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete
                    }
                });
            }
        });

        revalidatePath("/admin/roles");
        return { success: true, message: "Rol actualizado correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar" };
    }
}

export async function deleteRoleAction(roleId: string) {
    try {
        await checkPermission("delete");

        // Validación extra: No borrar roles que tengan usuarios asignados
        const usersCount = await prisma.user.count({ where: { roleId } });
        if (usersCount > 0) {
            return { success: false, message: `No se puede eliminar: Hay ${usersCount} usuarios con este rol.` };
        }

        await prisma.role.delete({ where: { id: roleId } });
        
        revalidatePath("/admin/roles");
        return { success: true, message: "Rol eliminado correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al eliminar" };
    }
}