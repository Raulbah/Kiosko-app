"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { OrderStatus } from "@/src/generated/prisma/browser";

async function checkPermission(action: "read" | "update" | "delete") {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = user?.role.permissions.find(p => p.module.slug === "orders");
    // Mapeamos 'update' tanto para editar como para cambiar estatus
    if (!permission?.[action === "update" ? "canUpdate" : action === "delete" ? "canDelete" : "canRead"]) {
        throw new Error("Sin permisos");
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
    try {
        await checkPermission("update");
        
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        revalidatePath("/admin/orders");
        return { success: true, message: "Estatus actualizado" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar" };
    }
}

// En lugar de borrar físicamente, solemos "Cancelar" la orden para mantener historial
export async function cancelOrderAction(orderId: string) {
    try {
        await checkPermission("update"); // Cancelar suele ser un update de estado
        
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" }
        });

        revalidatePath("/admin/orders");
        return { success: true, message: "Orden cancelada" };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al cancelar" };
    }
}