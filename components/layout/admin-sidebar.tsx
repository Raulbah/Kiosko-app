// components/layout/admin-sidebar.tsx
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { cn } from "@/lib/utils"; // Shadcn utility

// Definición estática de items, se filtrarán dinámicamente
const MENU_ITEMS = [
    { label: "Dashboard", href: "/dashboard", module: "dashboard", icon: "LayoutDashboard" },
    { label: "Usuarios", href: "/dashboard/users", module: "users", icon: "Users" },
    { label: "Inventario", href: "/dashboard/products", module: "inventory", icon: "Package" },
    { label: "Ventas", href: "/dashboard/sales", module: "pos", icon: "ShoppingCart" },
];

export default async function AdminSidebar() {
    const session = await verifySession();
    
    if (!session) return null;

    // Filtrar módulos donde el usuario tenga al menos permiso de lectura ('read')
    const allowedModules = new Set(
        session.permissions
        .filter(p => p.actions.read)
        .map(p => p.module)
    );

    return (
        <aside className="w-64 bg-slate-900 text-white h-screen p-4 flex flex-col">
            <div className="mb-8 px-2 text-xl font-bold">BusinessOS</div>
            
            <nav className="space-y-2 flex-1">
                {MENU_ITEMS.map((item) => {
                    // Si el módulo no es 'common' y no está en permitidos, no renderizar
                    if (item.module !== 'dashboard' && !allowedModules.has(item.module)) {
                        return null;
                    }

                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors",
                                // Aquí podrías agregar lógica para 'active state'
                            )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            
            <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">Sucursal: {session.branchId}</p>
                <p className="text-sm font-medium">{session.userId}</p>
                {/* Aquí iría el botón de Logout (Form action) */}
            </div>
        </aside>
    );
}