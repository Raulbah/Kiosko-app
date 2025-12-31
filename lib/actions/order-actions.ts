"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface CheckoutItem {
    productId: string;
    quantity: number;
    basePrice: number;
    priceWithModifiers: number; 
    name: string; 
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
        // INICIO DE TRANSACCIÓN (tx)
        const order = await prisma.$transaction(async (tx) => {
            
            // 1. VALIDAR Y DESCONTAR INVENTARIO
            for (const item of items) {
                // Buscamos el registro de inventario para este producto en esta sucursal
                const stockEntry = await tx.inventoryStock.findUnique({
                    where: { 
                        productId_branchId: { 
                            productId: item.productId, 
                            branchId: branchId 
                        } 
                    }
                });

                // Si no existe registro o la cantidad es menor a la solicitada
                if (!stockEntry || stockEntry.quantity < item.quantity) {
                    throw new Error(`Stock insuficiente para: ${item.name}. Disponible: ${stockEntry?.quantity || 0}`);
                }

                // Descontamos del inventario
                await tx.inventoryStock.update({
                    where: { 
                        productId_branchId: { 
                            productId: item.productId, 
                            branchId: branchId 
                        } 
                    },
                    data: { 
                        quantity: { decrement: item.quantity } 
                    }
                });
            }

            // 2. CREAR LA ORDEN
            return await tx.order.create({
                data: {
                    branchId,
                    customerName: customerName,
                    total: total,
                    status: "PENDING",
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.priceWithModifiers || 0,
                            options: item.details || {},
                        })),
                    },
                },
            });
        });
        // FIN DE TRANSACCIÓN

        revalidatePath("/kitchen");
        revalidatePath("/orders");
        // Revalidamos inventario para que el admin vea la bajada de stock
        revalidatePath("/admin/inventory"); 

        return { 
            success: true, 
            message: `Orden #${order.id.slice(0, 5).toUpperCase()} creada correctamente`, 
            orderId: order.id 
        };

    } catch (error: any) {
        console.error("Error al crear orden:", error);
        // Devolvemos el mensaje de error específico (ej. "Stock insuficiente...")
        return { success: false, message: error.message || "Error interno al procesar la orden." };
    }
}