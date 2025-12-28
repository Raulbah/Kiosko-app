"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getIcon } from "./icon-map";
import { NavItem } from "@/lib/actions/admin-nav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth-actions";
import Image from "next/image";

interface SidebarProps {
    items: NavItem[];
    user: { name: string; role: string; image?: string | null; };
}

export function AdminSidebar({ items, user }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false); // Estado para el menú móvil

    // Componente interno para los Links (DRY: Don't Repeat Yourself)
    const NavLinks = () => (
        <div className="space-y-1 py-4">
            {items.map((item) => {
                const Icon = getIcon(item.slug);
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)} // Cerrar menú móvil al hacer clic
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm",
                            isActive 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </div>
    );

    const UserFooter = () => (
        <div className="mt-auto border-t p-4 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="relative h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 overflow-hidden shrink-0">
                    {user.image ? (
                        <Image 
                            src={user.image} 
                            alt={user.name} 
                            fill 
                            className="object-cover" 
                            sizes="36px"
                        />
                    ) : (
                        <span>{user.name.charAt(0)}</span>
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-slate-800">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                </div>
            </div>
            
            {/* 2. USAR LA ACCIÓN EN EL FORMULARIO */}
            <form action={logoutAction}>
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-9 text-xs"
                    type="submit" // Es buena práctica ser explícito
                >
                    <LogOut className="mr-2 h-3 w-3" />
                    Cerrar Sesión
                </Button>
            </form>
        </div>
    );


    return (
        <>
            {/* --- MOBILE SIDEBAR (SHEET) --- */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    {/* Este botón solo se ve en móvil (md:hidden) */}
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-50">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b text-left">
                        <SheetTitle className="flex items-center gap-2 font-black text-xl">
                            <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center">A</span>
                            AdminPanel
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 px-4">
                        <NavLinks />
                    </ScrollArea>
                    <UserFooter />
                </SheetContent>
            </Sheet>

            {/* --- DESKTOP SIDEBAR (FIXED) --- */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-white">
                <div className="p-6 border-b h-16 flex items-center">
                    <h1 className="flex items-center gap-2 font-black text-xl text-slate-800">
                        <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">A</span>
                        AdminPanel
                    </h1>
                </div>
                
                <ScrollArea className="flex-1 px-4">
                    <NavLinks />
                </ScrollArea>
                <UserFooter />
            </aside>
        </>
    );
}