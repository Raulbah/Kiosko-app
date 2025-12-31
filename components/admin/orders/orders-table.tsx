"use client";

import { useState } from "react";
import { 
    flexRender, 
    getCoreRowModel, 
    useReactTable, 
    getPaginationRowModel, 
    getFilteredRowModel 
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderDetailsSheet } from "./order-details-sheet";
import { getColumns, OrderColumn } from "./columns";
import { updateOrderStatusAction, cancelOrderAction } from "@/lib/actions/order-admin-actions";
import { toast } from "sonner";
import { OrderStatus } from "@/src/generated/prisma/browser";

interface OrdersTableProps {
    data: OrderColumn[];
    permissions: { canUpdate: boolean };
}

export function OrdersTable({ data, permissions }: OrdersTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null); // Estado para el Sheet

    // Manejador de cambio de estatus (pasado a las columnas)
    const handleStatusChange = async (id: string, status: OrderStatus) => {
        const loadingToast = toast.loading("Actualizando...");
        
        // Si es cancelar, usamos la acción específica
        const res = status === "CANCELLED" 
            ? await cancelOrderAction(id) 
            : await updateOrderStatusAction(id, status);

        toast.dismiss(loadingToast);

        if (res.success) {
            toast.success(res.message);
            // Opcional: Cerrar el sheet si estaba abierto y se canceló la orden
            if (status === "CANCELLED") setSelectedOrder(null);
        } else {
            toast.error(res.message);
        }
    };

    const columns = getColumns({
        onView: (order) => setSelectedOrder(order),
        onStatusChange: handleStatusChange,
        permissions
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
        {/* Filtro Global */}
        <div className="flex items-center justify-between">
            <Input
            placeholder="Buscar por folio, cliente o sucursal..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
            />
        </div>

        {/* Tabla Shadcn */}
        <div className="rounded-md border bg-white">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                    ))}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                    No se encontraron órdenes.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
            </Button>
        </div>

        {/* Sheet de Detalles (Offcanvas) */}
        <OrderDetailsSheet 
            order={selectedOrder} 
            isOpen={!!selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
        />
        </div>
    );
}