import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminMenu } from "@/lib/actions/admin-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import prisma from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // 1. Verificación de Seguridad
    const session = await getSession();
    if (!session) redirect("/login");

    // 2. Obtener Datos del Menú (Server-Side Fetching)
    const navItems = await getAdminMenu();

    // 3. Obtener Datos del Usuario Actual
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            name: true,
            image: true,
            role: {
                select: { name: true }
            }
        }
    });
    if (!currentUser) redirect("/login");

    return (
        <div className="min-h-screen bg-slate-50/50">
        
            <AdminSidebar 
                items={navItems} 
                user={{ 
                    name: currentUser.name, // Usamos datos frescos de DB
                    role: currentUser.role.name, 
                    image: currentUser.image // Pasamos la imagen
                }} 
            />

            <main className="transition-all duration-300 md:ml-64 min-h-screen flex flex-col">
                <div className="md:hidden h-16 border-b bg-white flex items-center px-14 sticky top-0 z-40 shadow-sm">
                    <span className="font-bold text-lg">Menú</span>
                </div>

                <div className="p-4 md:p-8 flex-1">
                    {children}
                </div>
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}