import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { CategoryColumn } from "@/components/admin/categories/columns";

export default async function CategoriesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    if (!user) redirect("/login");

    const permission = user.role.permissions.find(p => p.module.slug === "categories");
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }

    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true } }
        },
        orderBy: { name: 'asc' }
    });

    const formattedCategories: CategoryColumn[] = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        productsCount: c._count.products,
        originalCategory: c
    }));

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h1>
            <CategoriesTable 
                data={formattedCategories} 
                permissions={{
                    canCreate: permission.canCreate,
                    canUpdate: permission.canUpdate,
                    canDelete: permission.canDelete
                }} 
            />
        </div>
    );
}