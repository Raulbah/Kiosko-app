"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

// Definimos el tipo de dato para la tabla
export type UserColumn = {
    id: string;
    name: string;
    employeeId: string;
    role: string;
    branch: string;
    isActive: boolean;
    image: string | null;
    // Pasamos los objetos completos por si el modal los necesita
    originalUser: any; 
};

// Necesitamos pasar funciones de callback para las acciones
interface ColumnsProps {
    onEdit: (user: any) => void;
    onDelete: (user: any) => void;
    permissions: { canUpdate: boolean; canDelete: boolean };
}

export const getColumns = ({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<UserColumn>[] => [
    {
        accessorKey: "image",
        header: "Avatar",
        cell: ({ row }) => (
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-100">
                {row.original.image ? (
                    <Image src={row.original.image} alt={row.original.name} fill className="object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        {row.original.name.charAt(0)}
                    </div>
                )}
            </div>
        )
    },
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "employeeId",
        header: "ID",
    },
    {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>
    },
    {
        accessorKey: "branch",
        header: "Sucursal",
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "destructive"} className={row.original.isActive ? "bg-blue-500 text-white dark:bg-blue-600" : ""}>
                {row.original.isActive ? "Activo" : "Inactivo"}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
        const user = row.original.originalUser;
    
        return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                
                {permissions.canUpdate && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                )}
                
                {permissions.canDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)} className="cursor-pointer">
                        <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
        )
        },
    },
]