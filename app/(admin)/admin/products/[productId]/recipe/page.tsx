import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RecipeManager } from "@/components/admin/products/recipe/recipe-manager";

export default async function ProductRecipePage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;

    // 1. Obtener Producto y su Receta
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            recipeItems: {
                include: { supply: true }, // Incluir info del insumo (nombre, costo)
                orderBy: { supply: { name: 'asc' } }
            }
        }
    });

    if (!product) return <div>Producto no encontrado</div>;

    // 2. Obtener Catálogo de Insumos para el Select
    const supplies = await prisma.supply.findMany({
        orderBy: { name: 'asc' }
    });

    // 3. Sanitizar Datos (Decimal -> Number)
    const sanitizedItems = product.recipeItems.map(item => ({
        id: item.id,
        quantity: Number(item.quantity),
        supply: {
            id: item.supply.id,
            name: item.supply.name,
            unit: item.supply.unit,
            cost: Number(item.supply.cost)
        }
    }));

    const sanitizedSupplies = supplies.map(s => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        cost: Number(s.cost)
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Receta / Composición</h1>
                    <p className="text-slate-500">Definiendo ingredientes para: <span className="font-bold text-primary">{product.name}</span></p>
                </div>
            </div>

            <RecipeManager 
                productId={product.id} 
                items={sanitizedItems} 
                supplies={sanitizedSupplies} 
            />
        </div>
    );
}