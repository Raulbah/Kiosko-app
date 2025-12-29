"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { ProductFormSchema } from "@/lib/schemas/product-schema";

async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });
    const permission = user?.role.permissions.find(p => p.module.slug === "products");
    if (!permission?.[action === "create" ? "canCreate" : action === "update" ? "canUpdate" : action === "delete" ? "canDelete" : "canRead"]) {
        throw new Error("Sin permisos");
    }
}

export async function createProductAction(formData: FormData) {
    try {
        await checkPermission("create");

        // 1. Preparar datos crudos (Raw Data)
        const rawSizes = formData.get("sizes") ? JSON.parse(formData.get("sizes") as string) : [];
        
        // CORRECCIÓN CRÍTICA: Convertir tipos String -> Number/Boolean antes de validar
        const rawData = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")), // "50" -> 50
            categoryId: formData.get("categoryId"),
            // Evitamos pasar null a Zod, pasamos cadena vacía si no hay valor
            branchId: formData.get("branchId")?.toString() || "", 
            isActive: formData.get("isActive") === "true",
            sizes: rawSizes,
            image: undefined // La imagen se procesa aparte
        };

        // 2. Validar con Zod (Ahora sí pasará porque los tipos coinciden)
        const validated = ProductFormSchema.parse(rawData);
        
        // 3. Subir Imagen (Solo si la validación pasó)
        const file = formData.get("image") as File;
        let imageUrl = null;

        if (file && file.size > 0) {
            imageUrl = await uploadImage(file, "kiosko/products");
        }

        // 4. Lógica de Branch para DB (Prisma espera NULL para global)
        const dbBranchId = (validated.branchId === "global" || validated.branchId === "") 
            ? null 
            : validated.branchId;

        await prisma.product.create({
            data: {
                name: validated.name,
                description: validated.description,
                price: validated.price,
                categoryId: validated.categoryId,
                branchId: dbBranchId,
                isActive: validated.isActive,
                imageUrl: imageUrl,
                sizes: {
                    create: validated.sizes?.map(s => ({
                        name: s.name,
                        price: s.price
                    }))
                }
            }
        });

        revalidatePath("/admin/products");
        return { success: true, message: "Producto creado" };
    } catch (error: any) {
        console.error("Error creating product:", error);
        // Si es error de Zod, lo formateamos bonito, si no, mensaje genérico
        const msg = error.errors ? "Datos inválidos (Revisa los campos)" : (error.message || "Error al crear");
        return { success: false, message: msg };
    }
}

export async function updateProductAction(id: string, formData: FormData) {
    try {
        await checkPermission("update");
        
        const rawSizes = formData.get("sizes") ? JSON.parse(formData.get("sizes") as string) : [];
        
        // CORRECCIÓN CRÍTICA: Conversión de tipos
        const rawData = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")), 
            categoryId: formData.get("categoryId"),
            branchId: formData.get("branchId")?.toString() || "",
            isActive: formData.get("isActive") === "true",
            sizes: rawSizes,
            image: undefined
        };

        const validated = ProductFormSchema.parse(rawData);
        
        const file = formData.get("image") as File;
        const dbBranchId = (validated.branchId === "global" || validated.branchId === "") 
            ? null 
            : validated.branchId;

        const updateData: any = {
            name: validated.name,
            description: validated.description,
            price: validated.price,
            categoryId: validated.categoryId,
            branchId: dbBranchId,
            isActive: validated.isActive,
        };

        if (file && file.size > 0) {
            updateData.imageUrl = await uploadImage(file, "kiosko/products");
        }

        await prisma.$transaction(async (tx) => {
            await tx.product.update({ where: { id }, data: updateData });

            await tx.productSize.deleteMany({ where: { productId: id } });
            
            if (validated.sizes && validated.sizes.length > 0) {
                await tx.productSize.createMany({
                    data: validated.sizes.map(s => ({
                        productId: id,
                        name: s.name,
                        price: s.price
                    }))
                });
            }
        });

        revalidatePath("/admin/products");
        return { success: true, message: "Producto actualizado" };
    } catch (error: any) {
        console.error("Error updating product:", error);
        const msg = error.errors ? "Datos inválidos" : (error.message || "Error al actualizar");
        return { success: false, message: msg };
  }
}

export async function deleteProductAction(id: string) {
    try {
        await checkPermission("delete");
        await prisma.product.update({ where: { id }, data: { isActive: false } });
        revalidatePath("/admin/products");
        return { success: true, message: "Producto desactivado" };
    } catch(e) { return { success: false, message: "Error al eliminar" }}
}