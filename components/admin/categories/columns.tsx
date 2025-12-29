"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

export type CategoryColumn = {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    productsCount: number;
    originalCategory: any;
};

interface ColumnsProps {
    onEdit: (cat: any) => void;
    onDelete: (cat: any) => void;
    permissions: { canUpdate: boolean; canDelete: boolean };
}

export const getColumns = ({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<CategoryColumn>[] => [
    {
        accessorKey: "image",
        header: "Icono",
        cell: ({ row }) => (
            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-slate-100 border">
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
        cell: ({ row }) => (
            <div>
                <p className="font-bold">{row.original.name}</p>
                <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
            </div>
        )
    },
    {
        accessorKey: "productsCount",
        header: "Productos",
        cell: ({ row }) => <Badge variant="secondary">{row.original.productsCount} items</Badge>
    },
    {
        id: "actions",
        cell: ({ row }) => {
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(row.original.originalCategory)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                        )}
                        {permissions.canDelete && (
                            <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={() => onDelete(row.original.originalCategory)}>
                                <Trash className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]