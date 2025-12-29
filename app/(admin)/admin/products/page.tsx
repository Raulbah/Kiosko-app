import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/admin/products/products-table"; // Asegúrate de crear este archivo
import { ProductColumn } from "@/components/admin/products/columns";

export default async function ProductsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Verificar Permisos
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    if (!user) redirect("/login");

    const permission = user.role.permissions.find(p => p.module.slug === "products");
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }

    const isSuperAdmin = user.role.name === "Super Admin";
    const whereClause = isSuperAdmin ? {} : { isActive: true };

    // 2. Obtener Datos
    // Traemos productos con sus relaciones para mostrar info en la tabla
    const [products, categories, branches] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            include: { 
                category: true, 
                branch: true,
                modifierGroups: { select: { id: true } }, // Solo queremos saber si tiene
                sizes: true 
            },
            orderBy: { name: 'asc' }
        }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
        prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
    ]);

    // 3. Formatear para la tabla
    const formattedProducts: ProductColumn[] = products.map(p => {
        // Creamos una copia limpia del producto para el formulario de edición
        // Convirtiendo explícitamente todos los Decimals a numbers
        const cleanProductForEdit = {
            ...p,
            price: Number(p.price), // Conversión Clave 1
            sizes: p.sizes.map(s => ({
                ...s,
                price: Number(s.price) // Conversión Clave 2 (Array anidado)
            }))
        };
        return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category.name,
            branch: p.branch?.name || "Global (Todas)",
            isActive: p.isActive,
            image: p.imageUrl,
            hasToppings: p.modifierGroups.length > 0 || p.sizes.length > 0,
            originalProduct: cleanProductForEdit // <--- Pasamos la versión limpia, no 'p'
        };
    });

    return (
        <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
            {isSuperAdmin && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                    Modo Super Admin
                </span>
            )}
        </div>

        <ProductsTable 
            data={formattedProducts} 
            categories={categories}
            branches={branches}
            permissions={{
                canCreate: permission.canCreate,
                canUpdate: permission.canUpdate,
                canDelete: permission.canDelete
            }} 
        />
        </div>
    );
}