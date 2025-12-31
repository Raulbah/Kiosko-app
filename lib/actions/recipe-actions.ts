"use server";
import prisma from "../db";
import { revalidatePath } from "next/cache";

// 1. Agregar Ingrediente
export async function addRecipeItemAction(formData: FormData) {
    try {
        const productId = formData.get("productId") as string;
        const supplyId = formData.get("supplyId") as string;
        const quantity = Number(formData.get("quantity"));

        if (!supplyId || quantity <= 0) {
            return { success: false, message: "Datos inválidos" };
        }

        await prisma.recipeItem.create({
        data: {
            productId,
            supplyId,
            quantity
        }
        });

        // Asegurar que el producto se marque como compuesto
        await prisma.product.update({
            where: { id: productId },
            data: { isCompound: true }
        });

        revalidatePath(`/admin/products/${productId}/recipe`);
        return { success: true, message: "Ingrediente agregado" };
    } catch (error) {
        return { success: false, message: "Error al agregar ingrediente" };
    }
}

// 2. Eliminar Ingrediente
export async function removeRecipeItemAction(itemId: string, productId: string) {
    try {
        await prisma.recipeItem.delete({ where: { id: itemId } });
        
        // Verificar si quedan ingredientes, si no, marcar isCompound = false
        const count = await prisma.recipeItem.count({ where: { productId } });
        if (count === 0) {
            await prisma.product.update({ where: { id: productId }, data: { isCompound: false } });
        }

        revalidatePath(`/admin/products/${productId}/recipe`);
        return { success: true, message: "Ingrediente eliminado" };
    } catch (error) {
        return { success: false, message: "Error al eliminar" };
    }
}