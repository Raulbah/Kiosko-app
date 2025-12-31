"use server";

import prisma from "../db";
import { getSession } from "@/lib/auth";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getDashboardStats() {
    const session = await getSession();
    if (!session) return null;

    const today = new Date();
    
    // 1. Ventas de Hoy
    const todayOrders = await prisma.order.aggregate({
        where: {
        createdAt: { gte: startOfDay(today), lte: endOfDay(today) },
        status: { not: "CANCELLED" }
        },
        _sum: { total: true },
        _count: { id: true }
    });

    // 2. Ventas últimos 7 días
    const last7Days = await prisma.order.findMany({
        where: {
        createdAt: { gte: subDays(today, 7) },
        status: { not: "CANCELLED" }
        },
        select: { createdAt: true, total: true }
    });

    // CORRECCIÓN 1: Tipado explícito del acumulador (Record<string, number>)
    const salesByDay = last7Days.reduce((acc: Record<string, number>, order) => {
        const date = format(order.createdAt, "dd/MM");
        if (!acc[date]) acc[date] = 0;
        // Aseguramos que sea número
        acc[date] += Number(order.total);
        return acc;
    }, {});

    const chartData = Object.entries(salesByDay).map(([name, total]) => ({ name, total }));

    // 3. Productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
    });

    const topProductsWithNames = await Promise.all(topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return { 
            name: product?.name, 
            // CORRECCIÓN 2: Manejo de nulos (si es null, es 0)
            quantity: item._sum.quantity || 0 
        };
    }));

    return {
        todaySales: Number(todayOrders._sum.total) || 0,
        todayCount: todayOrders._count.id,
        chartData,
        topProducts: topProductsWithNames
    };
}