"use server";

import prisma from "../db";
import { getSession } from "@/lib/auth";

export interface NavItem {
    title: string;
    href: string;
    slug: string; // Para mapear el icono
}

export async function getAdminMenu(): Promise<NavItem[]> {
    const session = await getSession();
    if (!session?.userId) return [];

    // 1. Consulta Robusta: Usamos el ID del usuario (Fuente de verdad)
    // en lugar de confiar en el nombre del rol de la cookie.
    const userWithPermissions = await prisma.user.findUnique({
        where: { 
            id: session.userId 
        },
        include: {
            role: {
                include: {
                    permissions: {
                        where: { canRead: true }, // Solo lo que puede ver
                        include: { module: true }, // Traemos datos del módulo para el nombre/slug
                        orderBy: { module: { name: 'asc' } } // Orden alfabético
                    }
                }
            }
        }
    });
    
    // Si el usuario no existe o está inactivo, retornamos menú vacío
    if (!userWithPermissions || !userWithPermissions.isActive) {
        return []; // Retorna menú vacío, efectivamente dejando al usuario sin navegación
    }
    // Validación de seguridad por si el usuario fue borrado mientras tenía sesión
    if (!userWithPermissions || !userWithPermissions.role) {
        return [];
    }

    // 2. Mapeo seguro
    const permissions = userWithPermissions.role.permissions;

    const menu: NavItem[] = permissions.map((p) => ({
        title: p.module.name,
        href: `/admin/${p.module.slug}`,
        slug: p.module.slug,
    }));

    // Agregamos Dashboard (siempre visible) + Módulos Dinámicos
    return [
        { title: "Dashboard", href: "/admin/dashboard", slug: "dashboard" },
        ...menu
    ];
}