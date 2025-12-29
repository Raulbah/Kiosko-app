"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Settings2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";

export type ProductColumn = {
    id: string;
    name: string;
    price: number;
    category: string;
    branch: string;
    isActive: boolean;
    image: string | null;
    hasToppings: boolean;
    originalProduct: any;
};

interface ColumnsProps {
    onEdit: (product: any) => void;
    onDelete: (product: any) => void;
    permissions: { canUpdate: boolean; canDelete: boolean };
}

export const getColumns = ({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<ProductColumn>[] => [
    {
        accessorKey: "image",
        header: "Img",
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
        header: "Producto",
        cell: ({ row }) => (
            <div>
                <p className="font-bold">{row.original.name}</p>
                {row.original.hasToppings && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-orange-50 text-orange-600 border-orange-200">
                        Con Toppings
                    </Badge>
                )}
            </div>
        )
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => <span className="font-mono text-sm">${row.original.price.toFixed(2)}</span>
    },
    { accessorKey: "category", header: "Categoría" },
    { 
        accessorKey: "branch", 
        header: "Sucursal",
        cell: ({ row }) => <Badge variant="secondary">{row.original.branch}</Badge>
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "destructive"} className="text-[10px]">
                {row.original.isActive ? "Activo" : "Inactivo"}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
        <div className="flex items-center gap-2">
            {/* Botón directo a Modificadores */}
            {permissions.canUpdate && (
                <Link href={`/admin/products/${row.original.id}/modifiers`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                </Link>
            )}

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menú</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                {permissions.canUpdate && (
                    <DropdownMenuItem onClick={() => onEdit(row.original.originalProduct)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                )}
                {permissions.canDelete && (
                    <DropdownMenuItem onClick={() => onDelete(row.original.originalProduct)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Desactivar
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        ),
    },
]