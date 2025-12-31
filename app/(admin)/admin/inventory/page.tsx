import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { SuppliesTable } from "@/components/admin/inventory/supplies-table"; // Nuevo Componente
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function InventoryPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Productos Simples (Stock directo)
    const products = await prisma.product.findMany({
        where: { isActive: true, isCompound: false }, // Solo lo que se cuenta físicamente
        include: {
            category: true,
            inventoryStocks: { where: { branchId: session.branchId } }
        }
    });

    const inventoryData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        quantity: Number(p.inventoryStocks[0]?.quantity || 0),
        minStock: Number(p.inventoryStocks[0]?.minStock || 5),
        unit: "PZA", // Productos simples suelen ser piezas
        status: "OK" // Puedes agregar tu lógica de status aquí
    }));

    // 2. Insumos (Materia Prima)
    const supplies = await prisma.supply.findMany({
        include: {
            stocks: { where: { branchId: session.branchId } }
        }
    });

    const suppliesData = supplies.map(s => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        quantity: Number(s.stocks[0]?.quantity || 0),
        minStock: Number(s.stocks[0]?.minStock || 0),
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
            </div>

            <Tabs defaultValue="supplies" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-100">
                    <TabsTrigger value="supplies">Materia Prima (Insumos)</TabsTrigger>
                    <TabsTrigger value="products">Productos de Reventa</TabsTrigger>
                </TabsList>
                
                <TabsContent value="supplies" className="mt-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Almacén de Insumos</h2>
                            <p className="text-sm text-muted-foreground">Ingredientes para preparación (Fresas, Crema, Vasos...)</p>
                        </div>
                        <SuppliesTable data={suppliesData} />
                    </div>
                </TabsContent>

                <TabsContent value="products" className="mt-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Almacén de Reventa</h2>
                            <p className="text-sm text-muted-foreground">Productos listos para vender (Refrescos, Papas...)</p>
                        </div>
                        <InventoryTable data={inventoryData} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}