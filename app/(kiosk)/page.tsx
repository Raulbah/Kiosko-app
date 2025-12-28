// app/page.tsx (Ya no es app/kiosk/page.tsx por el cambio de ruta)
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { BannerCarousel } from "@/components/kiosk/banner-carousel";
import { CategoryNav } from "@/components/kiosk/category-nav";
import ProductCard from "@/components/kiosk/product-card";
import { BranchSelector } from "@/components/kiosk/branch-selector";

// Función para obtener productos reales de DB
async function getProducts(branchId: string | undefined, categorySlug?: string) {
    if (!branchId) return [];

    const whereClause: any = {
        isActive: true,
        OR: [
            { branchId: branchId },
            { branchId: null },
        ]
    };

    if (categorySlug && categorySlug !== 'all') {
        whereClause.category = { slug: categorySlug };
    }

    return await prisma.product.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        include: { 
            sizes: true,
            modifierGroups: {
                include: { options: true }
            }
        }
    });
}

async function getBranches() {
    return await prisma.branch.findMany({
        select: { id: true, name: true },
        where: { isActive: true }
    });
}

async function getCategories() {
    return await prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' } // O podrías agregar un campo 'order' en la BD
    });
}

export default async function KioskPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const cookieStore = await cookies();
    const currentBranchId = cookieStore.get("kiosk_branch_id")?.value;

    const resolvedParams = await searchParams;
    const category = (resolvedParams.category as string) || "all";

    // Ejecutamos las 3 peticiones en paralelo para máxima velocidad
    const [products, branches, categories] = await Promise.all([
        getProducts(currentBranchId, category),
        getBranches(),
        getCategories()
    ]);

    return (
        <div className="flex flex-col gap-2 pb-20">
            <BranchSelector branches={branches} currentBranchId={currentBranchId} />

            <BannerCarousel />
            
            {/* Pasamos las categorías reales al componente */}
            <CategoryNav categories={categories} />

            <section className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">
                        {category === 'all' 
                            ? 'Menú Completo' 
                            : categories.find(c => c.slug === category)?.name || category}
                    </h2>
                    
                    {currentBranchId && (
                        <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                            Sucursal: {branches.find(b => b.id === currentBranchId)?.name}
                        </span>
                    )}
                </div>
                
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const formattedGroups = product.modifierGroups.map(group => ({
                                ...group,
                                extraPrice: Number(group.extraPrice),
                                options: group.options.map(option => ({ ...option, price: Number(option.price) }))
                            }));
                            const formattedSizes = product.sizes.map(size => ({
                                ...size,
                                price: Number(size.price)
                            }));

                            return (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={Number(product.price)}
                                    description={product.description || ""}
                                    imageUrl={product.imageUrl || undefined}
                                    modifierGroups={formattedGroups}
                                    sizes={formattedSizes} // <--- PASAR TAMAÑOS
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        {currentBranchId 
                        ? "No hay productos en esta categoría para tu sucursal." 
                        : "Selecciona una sucursal para comenzar."}
                    </div>
                )}
            </section>
        </div>
    );
}