"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary"; // Tu helper existente
import { getSession } from "@/lib/auth";
import { CategoryFormSchema } from "@/lib/schemas/category-schema";

// Helper para slugs
function generateSlug(name: string) {
    return name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = user?.role.permissions.find(p => p.module.slug === "categories");
    if (!permission?.[action === "create" ? "canCreate" : action === "update" ? "canUpdate" : action === "delete" ? "canDelete" : "canRead"]) {
        throw new Error("No tienes permiso.");
    }
}

export async function createCategoryAction(formData: FormData) {
    try {
        await checkPermission("create");
        
        const rawData = {
            name: formData.get("name"),
        };
        const file = formData.get("image") as File;
        
        const validated = CategoryFormSchema.parse(rawData);
        const slug = generateSlug(validated.name);

        // Validar duplicados
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) return { success: false, message: "Ya existe una categoría con ese nombre." };

        let imageUrl = null;
        if (file && file.size > 0) {
            imageUrl = await uploadImage(file, "kiosko/categories");
        }

        await prisma.category.create({
        data: {
            name: validated.name,
            slug: slug,
            image: imageUrl,
        }
        });

        revalidatePath("/admin/categories");
        return { success: true, message: "Categoría creada" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear" };
    }
}

export async function updateCategoryAction(id: string, formData: FormData) {
    try {
        await checkPermission("update");
        
        const rawData = { name: formData.get("name") };
        const file = formData.get("image") as File;
        const validated = CategoryFormSchema.parse(rawData);
        const slug = generateSlug(validated.name);

        // Verificar duplicado solo si cambia
        const existing = await prisma.category.findFirst({
            where: { slug, NOT: { id } }
        });
        if (existing) return { success: false, message: "Nombre duplicado." };

        const updateData: any = { 
            name: validated.name, 
            slug: slug 
        };

        if (file && file.size > 0) {
            updateData.image = await uploadImage(file, "kiosko/categories");
        }

        await prisma.category.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/categories");
        return { success: true, message: "Categoría actualizada" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar" };
    }
}

export async function deleteCategoryAction(id: string) {
    try {
        await checkPermission("delete");

        // Validación de Integridad: No borrar si tiene productos
        const productsCount = await prisma.product.count({ where: { categoryId: id } });
        if (productsCount > 0) {
            return { success: false, message: `No se puede eliminar: Hay ${productsCount} productos en esta categoría.` };
        }

        await prisma.category.delete({ where: { id } });
        revalidatePath("/admin/categories");
        return { success: true, message: "Categoría eliminada" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al eliminar" };
    }
}