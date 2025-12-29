"use server";
import prisma from "../db";
import { revalidatePath } from "next/cache";

// Crear Grupo
export async function createModifierGroupAction(productId: string, data: FormData) {
    try {
        const name = data.get("name") as string;
        const minSelect = Number(data.get("minSelect"));
        const maxSelect = Number(data.get("maxSelect"));
        const includedSelect = Number(data.get("includedSelect"));
        const extraPrice = Number(data.get("extraPrice"));

        await prisma.modifierGroup.create({
            data: { name, minSelect, maxSelect, includedSelect, extraPrice, productId }
        });
        revalidatePath(`/admin/products/${productId}/modifiers`);
        return { success: true, message: "Grupo creado" };
    } catch (e) { return { success: false, message: "Error al crear grupo" }; }
}

// Borrar Grupo
export async function deleteModifierGroupAction(groupId: string, productId: string) {
    try {
        await prisma.modifierGroup.delete({ where: { id: groupId } });
        revalidatePath(`/admin/products/${productId}/modifiers`);
        return { success: true, message: "Grupo eliminado" };
    } catch (e) { return { success: false, message: "Error" }; }
}

// Crear Opción (Ingrediente)
export async function createModifierOptionAction(groupId: string, productId: string, data: FormData) {
    try {
        const name = data.get("name") as string;
        const price = Number(data.get("price"));

        await prisma.modifierOption.create({
            data: { name, price, groupId }
        });
        revalidatePath(`/admin/products/${productId}/modifiers`);
        return { success: true, message: "Opción agregada" };
    } catch (e) { return { success: false, message: "Error" }; }
}

// Borrar Opción
export async function deleteModifierOptionAction(optionId: string, productId: string) {
    try {
        await prisma.modifierOption.delete({ where: { id: optionId } });
        revalidatePath(`/admin/products/${productId}/modifiers`);
        return { success: true, message: "Opción eliminada" };
    } catch (e) { return { success: false, message: "Error" }; }
}