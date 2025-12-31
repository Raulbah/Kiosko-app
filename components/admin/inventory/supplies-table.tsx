"use client";

import { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplyEntryForm } from "./supply-entry-form"; // Debes crear este formulario similar a stock-entry-form
import { SupplyForm } from "./supply-form"; // <--- Importar el nuevo formulario

export type SupplyItem = {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    minStock: number;
};

interface SuppliesTableProps {
    data: SupplyItem[];
    canCreate?: boolean; 
}

export function SuppliesTable({ data }: SuppliesTableProps) {
    const [entrySupply, setEntrySupply] = useState<SupplyItem | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false); // Estado para modal de crear
    
    const columns: ColumnDef<SupplyItem>[] = [
        { accessorKey: "name", header: "Insumo", cell: ({row}) => <span className="font-bold">{row.original.name}</span> },
        { 
            accessorKey: "quantity", 
            header: "Existencia", 
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="text-lg font-mono font-bold">{row.original.quantity.toFixed(3)}</span>
                    <Badge variant="outline" className="text-[10px]">{row.original.unit}</Badge>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button size="sm" variant="outline" onClick={() => setEntrySupply(row.original)} className="gap-2">
                    <Plus className="h-4 w-4" /> Entrada
                </Button>
            )
        }
    ];

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div>
            {/* Toolbar con Botón de Crear */}
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-sm font-medium text-slate-500">Listado de Materia Prima</h3>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Insumo
                </Button>
            </div>
            <div className="rounded-md border">
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

            {/* Modal de Entrada de Insumo */}
            <Dialog open={!!entrySupply} onOpenChange={(v) => !v && setEntrySupply(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Entrada: {entrySupply?.name}</DialogTitle></DialogHeader>
                    {/* Reutiliza o adapta SupplyEntryForm para llamar a addSupplyStockAction */}
                    {entrySupply && <SupplyEntryForm supplyId={entrySupply.id} unit={entrySupply.unit} onSuccess={() => setEntrySupply(null)} />}
                </DialogContent>
            </Dialog>
            {/* Modal de Crear Insumo */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Registrar Nueva Materia Prima</DialogTitle></DialogHeader>
                    <SupplyForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}