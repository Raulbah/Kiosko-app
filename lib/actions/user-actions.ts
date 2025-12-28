"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserFormSchema } from "@/lib/schemas/user-schema";

// Helper para verificar permisos
async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Buscamos permisos del usuario actual para el módulo "users"
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    if (!user || !user.isActive) {
        throw new Error("Tu cuenta ha sido desactivada. Contacta al administrador.");
    }

    const permission = user?.role.permissions.find(p => p.module.slug === "users");
    
    if (!permission) throw new Error("Sin permisos para este módulo");
    
    const map = {
        create: permission.canCreate,
        read: permission.canRead,
        update: permission.canUpdate,
        delete: permission.canDelete,
    };

    if (!map[action]) throw new Error("No tienes permiso para realizar esta acción");
}

export async function createUserAction(formData: FormData) {
    try {
        await checkPermission("create");

        // Extracción y Validación
        const rawData = Object.fromEntries(formData);
        const file = formData.get("image") as File;
        const isActive = formData.get("isActive") === "true";
        
        // Validar contraseña obligatoria al crear
        if (!rawData.password) return { success: false, message: "La contraseña es obligatoria" };

        // Subir imagen
        let imageUrl = null;
        if (file && file.size > 0) {
            imageUrl = await uploadImage(file, "kiosko/users");
        }

        const hashedPassword = await bcrypt.hash(rawData.password as string, 10);

        await prisma.user.create({
            data: {
                name: rawData.name as string,
                employeeId: rawData.employeeId as string,
                password: hashedPassword,
                roleId: rawData.roleId as string,
                branchId: rawData.branchId as string,
                isActive: isActive,
                image: imageUrl, // Campo nuevo en tu schema User (si no existe, agrégalo a Prisma)
            },
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Usuario creado correctamente" };

    } catch (error: any) {
        console.error(error);
        return { success: false, message: error.message || "Error al crear usuario" };
    }
}

export async function updateUserAction(userId: string, formData: FormData) {
    try {
        await checkPermission("update");
        const rawData = Object.fromEntries(formData);
        const file = formData.get("image") as File;
        const isActive = formData.get("isActive") === "true";

        const updateData: any = {
            name: rawData.name,
            employeeId: rawData.employeeId,
            roleId: rawData.roleId,
            branchId: rawData.branchId,
            isActive: isActive,
        };

        // Solo hashear si mandaron nueva contraseña
        if (rawData.password && (rawData.password as string).trim() !== "") {
            updateData.password = await bcrypt.hash(rawData.password as string, 10);
        }

        // Solo subir si hay nueva imagen
        if (file && file.size > 0) {
            updateData.image = await uploadImage(file, "kiosko/users");
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Usuario actualizado correctamente" };

    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar" };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        await checkPermission("delete");
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Usuario desactivado correctamente" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al eliminar" };
    }
}