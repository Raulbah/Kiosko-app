"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrderStatus } from "@/src/generated/prisma/browser";

export type OrderColumn = {
    id: string;
    shortId: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
    branch: string;
    itemsCount: number;
    originalOrder: any;
};

interface ColumnsProps {
    onView: (order: any) => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
    permissions: { canUpdate: boolean };
}

// Helper para colores de estado
const getStatusColor = (status: OrderStatus) => {
    switch(status) {
        case "PENDING": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
        case "IN_PROGRESS": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
        case "READY": return "bg-green-100 text-green-700 hover:bg-green-100";
        case "COMPLETED": return "bg-slate-100 text-slate-700 hover:bg-slate-100";
        case "CANCELLED": return "bg-red-100 text-red-700 hover:bg-red-100";
        default: return "secondary";
    }
};

export const getColumns = ({ onView, onStatusChange, permissions }: ColumnsProps): ColumnDef<OrderColumn>[] => [
    {
        accessorKey: "shortId",
        header: "Folio",
        cell: ({ row }) => <span className="font-mono font-bold">#{row.original.shortId}</span>
    },
    {
        accessorKey: "customerName",
        header: "Cliente",
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-bold">${row.original.total.toFixed(2)}</span>
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
            <Badge className={getStatusColor(row.original.status)}>
                {row.original.status}
            </Badge>
        )
    },
    {
        accessorKey: "branch",
        header: "Sucursal",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.branch}</span>
    },
    {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdAt.toLocaleDateString()} {row.original.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
        
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
                        
                        <DropdownMenuItem className="cursor-pointer" onClick={() => onView(order.originalOrder)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                        </DropdownMenuItem>
                        {permissions.canUpdate && order.status !== "CANCELLED" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => onStatusChange(order.id, "COMPLETED")}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcar Completada
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={() => onStatusChange(order.id, "CANCELLED")}>
                                    <Ban className="mr-2 h-4 w-4" /> Cancelar Orden
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]