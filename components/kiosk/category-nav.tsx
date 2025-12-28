"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Definimos el tipo de dato que esperamos de la BD
interface Category {
    id: string;
    name: string;
    slug: string;
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
        <div className="w-full border-b bg-white sticky top-16 z-40 shadow-sm">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-4">
                    {/* 1. Botón "Todo" (Estático) */}
                    <Button
                        variant={currentCategory === "all" ? "default" : "outline"}
                        className={cn(
                            "rounded-full px-6 transition-all cursor-pointer",
                            currentCategory === "all" ? "shadow-md scale-105" : "hover:bg-slate-100"
                        )}
                        onClick={() => handleCategoryChange("all")}
                    >
                        Todo
                    </Button>

                    {/* 2. Botones Dinámicos (Desde BD) */}
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={currentCategory === cat.slug ? "default" : "outline"}
                            className={cn(
                                "rounded-full px-6 transition-all cursor-pointer",
                                currentCategory === cat.slug ? "shadow-md scale-105" : "hover:bg-slate-100"
                            )}
                            onClick={() => handleCategoryChange(cat.slug)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible sm:visible" />
            </ScrollArea>
        </div>
    );
}