"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { SupplyFormSchema } from "@/lib/schemas/supply-schema";

// Helper de seguridad (Reutilizable o específico para inventario)
async function checkPermission(action: "create" | "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    // Usamos el módulo 'inventory' para controlar insumos
    const permission = user?.role.permissions.find(p => p.module.slug === "inventory"); // O "supplies" si creaste ese módulo específico
    
    if (!permission?.[action === "create" ? "canCreate" : "canRead"]) {
        throw new Error("No tienes permiso para realizar esta acción");
    }
}

// Crear Insumo (Catálogo Global)
export async function createSupplyAction(formData: FormData) {
    try {
        // 1. Verificar Permiso
        await checkPermission("create");

        // 2. Parsear Datos
        const rawData = {
            name: formData.get("name"),
            unit: formData.get("unit"),
            cost: Number(formData.get("cost")),
        };

        // 3. Validar con Zod
        const validated = SupplyFormSchema.parse(rawData);

        // 4. Crear en BD
        await prisma.supply.create({
            data: { 
                name: validated.name, 
                unit: validated.unit, 
                cost: validated.cost 
            }
        });

        revalidatePath("/admin/inventory");
        return { success: true, message: "Insumo registrado correctamente" };
    } catch (error: any) {
        console.error(error);
        // Mejora en el manejo de errores para que sea legible
        let msg = "Error al crear insumo";
        if (error.errors) {
            msg = error.errors.map((e: any) => e.message).join(", ");
        } else if (error.message) {
            msg = error.message;
        }
        return { success: false, message: msg };
    }
}

// Entrada de Stock de Insumo (Por sucursal)
export async function addSupplyStockAction(supplyId: string, quantity: number, reason: string) {
    const session = await getSession();
    if (!session) return { success: false };

    try {
        await prisma.$transaction(async (tx) => {
        // Upsert Stock
        await tx.supplyStock.upsert({
            where: { supplyId_branchId: { supplyId, branchId: session.branchId } },
            update: { quantity: { increment: quantity } },
            create: { supplyId, branchId: session.branchId, quantity }
        });

        // Registrar Kardex
        await tx.inventoryMovement.create({
            data: {
                type: "IN_PURCHASE",
                quantity,
                reason: reason || "Compra Insumo",
                supplyId,
                branchId: session.branchId,
                userId: session.userId
            }
        });
        });
        revalidatePath("/admin/inventory");
        return { success: true, message: "Entrada registrada" };
    } catch (e) { return { success: false, message: "Error" }; }
}