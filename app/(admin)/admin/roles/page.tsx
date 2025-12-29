import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RolesTable } from "@/components/admin/roles/roles-table";
import { RoleColumn } from "@/components/admin/roles/columns";

export default async function RolesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Verificar Permisos
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    const permission = user?.role.permissions.find(p => p.module.slug === "roles");
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }

    // 2. Obtener Datos (Roles con conteo de usuarios y Permisos)
    const [roles, modules] = await Promise.all([
        prisma.role.findMany({
            include: {
                permissions: true,
                _count: { select: { users: true } } // Contamos usuarios
            },
            orderBy: { name: 'asc' }
        }),
        prisma.module.findMany({ orderBy: { name: 'asc' } })
    ]);

    const formattedRoles: RoleColumn[] = roles.map(r => ({
        id: r.id,
        name: r.name,
        usersCount: r._count.users,
        originalRole: r
    }));

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles y Permisos</h1>
            <RolesTable 
                data={formattedRoles} 
                modules={modules}
                permissions={{
                    canCreate: permission.canCreate,
                    canUpdate: permission.canUpdate,
                    canDelete: permission.canDelete
                }} 
            />
        </div>
    );
}