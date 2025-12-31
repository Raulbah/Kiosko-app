import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PackageCheck, PackageX } from "lucide-react";

export default async function InventoryPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Obtener Inventario
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
            category: true,
            // CORRECCIÓN: Usar el nombre real de la relación en el schema
            inventoryStocks: {
                where: { branchId: session.branchId }
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Procesar datos
    const inventoryData = products.map(p => {
        // CORRECCIÓN: Acceder a p.inventoryStocks[0]
        const stockData = p.inventoryStocks[0]; 
        
        const qty = stockData?.quantity || 0;
        const min = stockData?.minStock || 5;

        return {
            id: p.id,
            name: p.name,
            category: p.category.name, // Ahora sí existe porque el include anterior es correcto
            quantity: qty,
            minStock: min,
            status: qty === 0 ? "OUT" : qty <= min ? "LOW" : "OK",
            stockId: stockData?.id
        };
    });

    // 3. Métricas
    const lowStockCount = inventoryData.filter(i => i.status === "LOW").length;
    const outOfStockCount = inventoryData.filter(i => i.status === "OUT").length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Inventario de Sucursal</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Agotados</CardTitle>
                        <PackageX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{outOfStockCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">Stock Bajo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryData.length}</div>
                    </CardContent>
                </Card>
            </div>
            <InventoryTable data={inventoryData} />
        </div>
    );
}