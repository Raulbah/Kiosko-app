"use client";

import { useState } from "react";
import { 
    useReactTable, 
    getCoreRowModel, 
    getFilteredRowModel, 
    getPaginationRowModel,
    flexRender,
    ColumnDef 
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StockEntryForm } from "./stock-entry-form"; // Formulario Entrada
import { StockAdjustmentForm } from "./stock-adjustment-form"; // Formulario Ajuste
import { ExportButtons } from "@/components/ui/export-buttons";

export type InventoryItem = {
    id: string; // Product ID
    name: string;
    category: string;
    quantity: number;
    minStock: number;
    status: string;
};

export function InventoryTable({ data }: { data: InventoryItem[] }) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [entryProduct, setEntryProduct] = useState<InventoryItem | null>(null);
    const [adjustProduct, setAdjustProduct] = useState<InventoryItem | null>(null);

    const columns: ColumnDef<InventoryItem>[] = [
        { accessorKey: "name", header: "Producto", cell: ({row}) => <span className="font-bold">{row.original.name}</span> },
        { accessorKey: "category", header: "Categoría" },
        { 
            accessorKey: "quantity", 
            header: "Stock Actual",
            cell: ({ row }) => {
                const qty = row.original.quantity;
                const min = row.original.minStock;
                let color = "bg-green-100 text-green-800";
                if(qty === 0) color = "bg-red-100 text-red-800 animate-pulse";
                else if(qty <= min) color = "bg-orange-100 text-orange-800";
                
                return <Badge className={`text-base px-3 ${color}`}>{qty}</Badge>
            }
        },
        { 
            accessorKey: "minStock", 
            header: "Mínimo", 
            cell: ({row}) => <span className="text-muted-foreground text-sm">{row.original.minStock}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEntryProduct(row.original)} title="Registrar Entrada">
                        <Plus className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAdjustProduct(row.original)} title="Ajuste / Merma">
                        <Settings2 className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            <Input 
                placeholder="Buscar producto..." 
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />

            <ExportButtons data={data} filename="inventario_productos" />

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL ENTRADA */}
            <Dialog open={!!entryProduct} onOpenChange={(v) => !v && setEntryProduct(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Entrada: {entryProduct?.name}</DialogTitle></DialogHeader>
                    {entryProduct && <StockEntryForm productId={entryProduct.id} onSuccess={() => setEntryProduct(null)} />}
                </DialogContent>
            </Dialog>

            {/* MODAL AJUSTE */}
            <Dialog open={!!adjustProduct} onOpenChange={(v) => !v && setAdjustProduct(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Ajuste de Inventario: {adjustProduct?.name}</DialogTitle></DialogHeader>
                    {adjustProduct && <StockAdjustmentForm product={adjustProduct} onSuccess={() => setAdjustProduct(null)} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}