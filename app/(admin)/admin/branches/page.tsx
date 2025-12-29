import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BranchesTable } from "@/components/admin/branches/branches-table";
import { BranchColumn } from "@/components/admin/branches/columns";

export default async function BranchesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Verificar Permisos
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    // CORRECCIÓN: Validación explícita de usuario nulo
    if (!user) {
        redirect("/login");
    }

    const permission = user.role.permissions.find(p => p.module.slug === "branches");
    
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }

    // Ahora TypeScript sabe que 'user' existe
    const isSuperAdmin = user.role.name === "Super Admin";
    
    const whereClause = isSuperAdmin ? {} : { isActive: true };

    // 2. Obtener Datos
    const branches = await prisma.branch.findMany({
        where: whereClause,
        include: {
            _count: { select: { users: true } } 
        },
        orderBy: { name: 'asc' }
    });

    const formattedBranches: BranchColumn[] = branches.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        address: b.address,
        isActive: b.isActive,
        usersCount: b._count.users,
        originalBranch: b
    }));

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Sucursales</h1>
                {isSuperAdmin && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                        Modo Super Admin: Viendo inactivas
                    </span>
                )}
            </div>

            <BranchesTable 
                data={formattedBranches} 
                permissions={{
                    canCreate: permission.canCreate,
                    canUpdate: permission.canUpdate,
                    canDelete: permission.canDelete
                }} 
            />
        </div>
    );
}