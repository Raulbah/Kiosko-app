"use server";

import prisma from "../db";
import { getSession } from "@/lib/auth";
import { MovementType } from "@/src/generated/prisma/browser";
import { revalidatePath } from "next/cache";

// --- 1. REGISTRAR ENTRADA (COMPRAS) ---
export async function addStockAction(productId: string, quantity: number, reason: string) {
    const session = await getSession();
    if (!session) return { success: false, message: "No autorizado" };

    try {
        await prisma.$transaction(async (tx) => {
            // A. Actualizar o Crear Stock en esta sucursal
            const stock = await tx.inventoryStock.upsert({
                where: { productId_branchId: { productId, branchId: session.branchId } },
                update: { quantity: { increment: quantity } },
                create: { productId, branchId: session.branchId, quantity, minStock: 10 }
            });

            // B. Registrar Movimiento (Kardex)
            await tx.inventoryMovement.create({
                data: {
                    type: "IN_PURCHASE",
                    quantity: quantity,
                    reason: reason || "Compra / Entrada Manual",
                    productId,
                    branchId: session.branchId,
                    userId: session.userId
                }
            });
        });

        revalidatePath("/admin/inventory");
        return { success: true, message: "Entrada registrada exitosamente" };
    } catch (e) {
        return { success: false, message: "Error al registrar entrada" };
    }
}

// --- 2. AJUSTE DE INVENTARIO (MERMA O CONTEO FÍSICO) ---
export async function adjustStockAction(productId: string, realQuantity: number, reason: string) {
    const session = await getSession();
    if (!session) return { success: false, message: "No autorizado" };

    try {
        await prisma.$transaction(async (tx) => {
        // 1. Obtener stock actual
        const currentStock = await tx.inventoryStock.findUnique({
            where: { productId_branchId: { productId, branchId: session.branchId } }
        });

        const currentQty = currentStock?.quantity || 0;
        const difference = realQuantity - currentQty;

        if (difference === 0) return; // No hubo cambio

        // 2. Determinar tipo de movimiento
        const type: MovementType = difference > 0 ? "ADJUSTMENT" : "OUT_LOSS";

        // 3. Actualizar
        await tx.inventoryStock.upsert({
            where: { productId_branchId: { productId, branchId: session.branchId } },
            update: { quantity: realQuantity }, // Seteamos el valor real
            create: { productId, branchId: session.branchId, quantity: realQuantity }
        });

        // 4. Kardex
        await tx.inventoryMovement.create({
            data: {
            type,
            quantity: Math.abs(difference), // Guardamos magnitud
            reason: `Ajuste: Sistema(${currentQty}) vs Físico(${realQuantity}) - ${reason}`,
            productId,
            branchId: session.branchId,
            userId: session.userId
            }
        });
        });

        revalidatePath("/admin/inventory");
        return { success: true, message: "Inventario ajustado" };
    } catch (e) {
        return { success: false, message: "Error al ajustar" };
    }
}