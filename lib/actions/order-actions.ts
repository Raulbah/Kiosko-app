"use server";

import prisma from "../db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Definimos el tipo de entrada (lo que viene del carrito)
interface CheckoutItem {
    productId: string;
    quantity: number;
    basePrice: number;
    priceWithModifiers: number; // Precio unitario calculado en frontend
    name: string; // Nombre completo (ej. Fresas Grande)
    // Datos para el JSON
    details: {
        size?: string;
        modifiers: { name: string; price: number }[];
    }
}

export async function placeOrderAction(items: any[], total: number, customerName: string) {
    const cookieStore = await cookies();
    const branchId = cookieStore.get("kiosk_branch_id")?.value;

    if (!branchId) return { success: false, message: "Error: No se ha seleccionado una sucursal." };

    try {
        // Creación directa (Sin transacción de contador diario)
        const order = await prisma.order.create({
        data: {
            branchId,
            customerName: customerName, // <--- Guardamos el nombre
            total: total,
            status: "PENDING",
            items: {
                create: items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.priceWithModifiers,
                    options: item.details,
                })),
            },
        },
        });

        revalidatePath("/kitchen");
        revalidatePath("/orders");

        // Retornamos el UUID recortado como folio
        return { 
            success: true, 
            message: `Orden #${order.id.slice(0, 5).toUpperCase()} a nombre de ${customerName}`, 
            orderId: order.id 
        };

    } catch (error) {
        console.error("Error al crear orden:", error);
        return { success: false, message: "Error interno al procesar la orden." };
    }
}
