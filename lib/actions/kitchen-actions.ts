"use server";

import prisma from "../db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/src/generated/prisma/enums";
// Obtener ordenes activas para cocina
export async function getKitchenOrders(branchId: string) {
    const orders = await prisma.order.findMany({
        where: {
            branchId,
            status: {
                in: ["PENDING", "IN_PROGRESS"],
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // TRANSFORMACIÓN: Convertir Decimal a Number para que Next.js no explote
    return orders.map((order) => ({
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({
            ...item,
            price: Number(item.price),
            product: {
                ...item.product,
                price: Number(item.product.price),
            },
        })),
    }));
}

// Obtener ordenes para la pantalla de clientes
export async function getOrderBoard(branchId: string) {
    const [preparing, ready] = await prisma.$transaction([
        // 1. Preparando (Sin límite)
        prisma.order.findMany({
        where: { branchId, status: "IN_PROGRESS" },
        select: {
            id: true,
            customerName: true, // <--- IMPORTANTE
            status: true,
            updatedAt: true,
            items: { select: { quantity: true, product: { select: { name: true } } } }
        },
        orderBy: { updatedAt: "asc" },
        }),

        // 2. Listas (Límite 12)
        prisma.order.findMany({
            where: { branchId, status: "READY" },
            select: {
                id: true,
                customerName: true, // <--- IMPORTANTE
                status: true,
                updatedAt: true,
                items: { select: { quantity: true, product: { select: { name: true } } } }
            },
            orderBy: { updatedAt: "desc" },
            take: 12, // Mantenemos el límite de cantidad que pediste antes
        })
    ]);
    
    return [...preparing, ...ready];
}

// Cambiar estatus (Acción del Cocinero)
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });
        
        // Revalidamos ambas rutas para que se actualicen "al instante" si usan Server Components
        revalidatePath("/kitchen");
        revalidatePath("/orders");
        
        return { success: true };
    } catch (error) {
        return { success: false, message: "Error al actualizar" };
    }
}