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
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: { recipeItems: true } // Traemos la receta
                });

                if (!product) throw new Error("Producto no encontrado");

                // LÓGICA DE DESCUENTO
                if (product.isCompound) {
                    // --- CASO A: PRODUCTO COMPUESTO (Descontar Insumos) ---
                    if (product.recipeItems.length === 0) {
                        // Opcional: Permitir venta sin receta, o lanzar warning
                        console.warn(`Producto compuesto ${product.name} no tiene receta configurada.`);
                    }
                    for (const ingredient of product.recipeItems) {
                        // Cantidad a descontar = (Cantidad en receta * Cantidad vendida)
                        const totalNeeded = Number(ingredient.quantity) * item.quantity;

                        // Buscar stock del insumo
                        const supplyStock = await tx.supplyStock.findUnique({
                            where: { supplyId_branchId: { supplyId: ingredient.supplyId, branchId } }
                        });
                        if (!supplyStock || Number(supplyStock.quantity) < totalNeeded) {
                            throw new Error(`Insumo insuficiente: ${totalNeeded} de ingrediente ID ${ingredient.supplyId}`);
                        }
                        // Descontar Insumo
                        await tx.supplyStock.update({
                            where: { supplyId_branchId: { supplyId: ingredient.supplyId, branchId } },
                            data: { quantity: { decrement: totalNeeded } }
                        });
                    }

                } else {
                    // --- CASO B: PRODUCTO SIMPLE (Descontar Directo) ---
                    const stockEntry = await tx.inventoryStock.findUnique({
                        where: { productId_branchId: { productId: item.productId, branchId } }
                    });

                    if (!stockEntry || Number(stockEntry.quantity) < item.quantity) {
                        throw new Error(`Stock insuficiente para: ${item.name}`);
                    }

                    await tx.inventoryStock.update({
                        where: { productId_branchId: { productId: item.productId, branchId } },
                        data: { quantity: { decrement: item.quantity } }
                    });
                }
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