"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type BranchColumn = {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    isActive: boolean;
    usersCount: number;
    originalBranch: any;
};

interface ColumnsProps {
    onEdit: (branch: any) => void;
    onDelete: (branch: any) => void;
    permissions: { canUpdate: boolean; canDelete: boolean };
}

export const getColumns = ({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<BranchColumn>[] => [
    {
        accessorKey: "name",
        header: "Sucursal",
        cell: ({ row }) => (
            <div>
                <p className="font-bold">{row.original.name}</p>
                <p className="text-xs text-muted-foreground">slug: {row.original.slug}</p>
            </div>
        )
    },
    {
        accessorKey: "address",
        header: "Dirección",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-3 w-3" />
                {row.original.address || "Sin dirección"}
            </div>
        )
    },
    {
        accessorKey: "usersCount",
        header: "Personal",
        cell: ({ row }) => (
            <Badge variant="secondary">{row.original.usersCount} empleados</Badge>
        )
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "destructive"} className={row.original.isActive ? "bg-blue-500 text-white dark:bg-blue-600" : ""}>
                {row.original.isActive ? "Operativa" : "Clausurada/Inactiva"}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
        const branch = row.original.originalBranch;
    
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(branch)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                    )}
                    
                    {permissions.canDelete && (
                        <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={() => onDelete(branch)}>
                            <Trash className="mr-2 h-4 w-4" /> Desactivar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
        },
    },
]