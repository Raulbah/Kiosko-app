import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModifierManager } from "@/components/admin/products/modifiers/modifier-manager";
import { redirect } from "next/navigation"; // Importante por si no existe el producto

export default async function ProductModifiersPage({ params }: { params: Promise<{ productId: string }> }) {
    // En Next.js 15 params es una promesa
    const { productId } = await params;

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            modifierGroups: {
                include: { options: true },
                orderBy: { name: 'asc' }
            }
        }
    });

    if (!product) return <div>Producto no encontrado</div>;

    // --- SOLUCIÓN DEL ERROR: Sanitizar datos (Decimal -> Number) ---
    const sanitizedGroups = product.modifierGroups.map((group) => ({
        ...group,
        extraPrice: Number(group.extraPrice), // Convertir Decimal a Number
        options: group.options.map((option) => ({
            ...option,
            price: Number(option.price) // Convertir Decimal a Number
        }))
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Configurar Toppings / Extras</h1>
                    <p className="text-slate-500">Producto: <span className="font-bold text-primary">{product.name}</span></p>
                </div>
            </div>

            {/* Pasamos los grupos YA sanitizados */}
            <ModifierManager productId={product.id} initialGroups={sanitizedGroups} />
        </div>
    );
}