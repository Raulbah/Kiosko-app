"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";

// Definimos el tipo de dato que esperamos de la BD
interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
}

interface CategoryNavProps {
    categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const currentCategory = searchParams.get("category") || "all";

    const handleCategoryChange = (slug: string) => {
        const params = new URLSearchParams(searchParams);
        if (slug === "all") {
        params.delete("category");
        } else {
        params.set("category", slug);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full border-b bg-white sticky top-16 z-40 shadow-sm py-2">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-3 p-2 px-4">
                    
                    {/* 1. Botón "Todo" con Ícono estático */}
                    <Button
                        variant={currentCategory === "all" ? "default" : "outline"}
                        className={cn(
                            "rounded-full h-12 px-6 gap-2 transition-all border-2 cursor-pointer",
                            currentCategory === "all" 
                                ? "shadow-md scale-105 border-primary" 
                                : "hover:bg-slate-50 border-transparent bg-slate-100 text-slate-600"
                        )}
                        onClick={() => handleCategoryChange("all")}
                    >
                        <div className="bg-white/20 p-1 rounded-full">
                            <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <span className="text-base font-bold">Todo</span>
                    </Button>

                    {/* 2. Botones Dinámicos con Imagen de BD */}
                    {categories.map((cat) => {
                        const isSelected = currentCategory === cat.slug;
                        
                        return (
                            <Button
                                key={cat.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "rounded-full h-12 pl-2 pr-6 gap-3 transition-all border-2 cursor-pointer",
                                    isSelected 
                                    ? "shadow-md scale-105 border-primary" 
                                    : "hover:bg-slate-50 border-transparent bg-slate-100 text-slate-600"
                                )}
                                onClick={() => handleCategoryChange(cat.slug)}
                            >
                            {/* Contenedor de Imagen (Avatar Style) */}
                            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-white shadow-sm shrink-0">
                                {cat.image ? (
                                    <Image 
                                        src={cat.image} 
                                        alt={cat.name} 
                                        fill 
                                        className="object-cover" 
                                        sizes="40px"
                                    />
                                ) : (
                                    // Fallback si no tiene imagen (primera letra)
                                    <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-xs">
                                        {cat.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-base font-bold capitalize">{cat.name}</span>
                            </Button>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible sm:visible" />
            </ScrollArea>
        </div>
    );
}
