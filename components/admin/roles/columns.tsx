"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type RoleColumn = {
    id: string;
    name: string;
    usersCount: number;
    originalRole: any;
};

interface ColumnsProps {
    onEdit: (role: any) => void;
    onDelete: (role: any) => void;
    permissions: { canUpdate: boolean; canDelete: boolean };
}

export const getColumns = ({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<RoleColumn>[] => [
    {
        accessorKey: "name",
        header: "Nombre del Rol",
        cell: ({ row }) => <span className="font-bold">{row.original.name}</span>
    },
    {
        accessorKey: "usersCount",
        header: "Usuarios Asignados",
        cell: ({ row }) => (
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                {row.original.usersCount} usuarios
            </span>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const role = row.original.originalRole;
            // Proteger rol Super Admin (evitar edición accidental si así lo deseas, o por lo menos borrado)
            const isSuperAdmin = role.name === "Super Admin";

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        
                        {permissions.canUpdate && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(role)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar Permisos
                            </DropdownMenuItem>
                        )}
                        
                        {permissions.canDelete && !isSuperAdmin && (
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(role)} className="cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]