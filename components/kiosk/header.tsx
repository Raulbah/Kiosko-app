"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "./store/cart-store"; // Asegúrate de tener el store creado
import { useEffect, useState } from "react";
import { ChangeBranchBtn } from "./change-branch-btn";

export function KioskHeader() {
    // Hydration fix para Zustand en Next.js
    const [mounted, setMounted] = useState(false);
    const items = useCartStore((state) => state.items);
    const toggleCart = useCartStore((state) => state.toggleCart);
    
    useEffect(() => { setMounted(true); }, []);

    const itemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl md:text-2xl text-primary">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        K
                    </div>
                    <span className="hidden sm:inline-block">KioskoApp</span>
                </Link>

                {/* Buscador (Grande y accesible) */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="¿Qué buscas hoy?"
                            className="w-full bg-slate-50 pl-9 rounded-full focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                    <ChangeBranchBtn />
                    {/* Botón Usuario (Dropdown simplificado) */}
                    <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Usuario</span>
                    </Button>

                    {/* Botón Carrito con Badge */}
                    <Button 
                        variant="default" 
                        size="icon" 
                        className="rounded-full relative cursor-pointer"
                        onClick={toggleCart}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <Badge 
                                variant="destructive" 
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs animate-in zoom-in"
                            >
                                {itemCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
}