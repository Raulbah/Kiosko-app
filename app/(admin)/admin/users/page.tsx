import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserColumn } from "@/components/admin/users/columns";

export default async function UsersAdminPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Obtener datos del usuario actual para validar permisos y rol
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = currentUser?.role.permissions.find(p => p.module.slug === "users");
    
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }

    const isSuperAdmin = currentUser?.role.name === "Super Admin"; // Ajusta el string exacto según tu Seed
    const whereClause = isSuperAdmin ? {} : { isActive: true };

    // 2. Obtener Datos (Usuarios, Roles, Sucursales)
    const [users, roles, branches] = await Promise.all([
        prisma.user.findMany({
            where: whereClause, // <--- APLICAMOS EL FILTRO AQUÍ
            include: { role: true, branch: true },
            orderBy: { name: 'asc' }
        }),
        prisma.role.findMany({ orderBy: { name: 'asc' } }),
        prisma.branch.findMany({ orderBy: { name: 'asc' } })
    ]);

    // 3. Formatear para la tabla
    const formattedUsers: UserColumn[] = users.map(u => ({
        id: u.id,
        name: u.name,
        employeeId: u.employeeId,
        role: u.role.name,
        branch: u.branch.name,
        isActive: u.isActive,
        image: u.image,
        originalUser: u 
    }));

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                {/* Feedback visual para el Super Admin */}
                {isSuperAdmin && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                        Modo Super Admin: Viendo inactivos
                    </span>
                )}
            </div>
            
            <UsersTable 
                data={formattedUsers} 
                roles={roles} 
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