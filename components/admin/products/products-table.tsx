"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProductForm } from "./product-form";
import { getColumns, ProductColumn } from "./columns";
import { deleteProductAction } from "@/lib/actions/product-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ExportButtons } from "@/components/ui/export-buttons";

interface ProductsTableProps {
    data: ProductColumn[];
    categories: any[];
    branches: any[];
    permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean };
}

export function ProductsTable({ data, categories, branches, permissions }: ProductsTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    
    // Estados Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

    const handleDelete = async () => {
        if (!deletingProduct) return;
        const res = await deleteProductAction(deletingProduct.id);
        if (res.success) {
            toast.success(res.message);
            setDeletingProduct(null);
        } else {
            toast.error(res.message);
        }
    };

    // Definir columnas pasándoles las funciones de estado
    const columns = getColumns({
        onEdit: (product) => setEditingProduct(product),
        onDelete: (product) => setDeletingProduct(product),
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
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Buscar productos..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <ExportButtons data={data} filename="productos_reporte" />
                    {permissions.canCreate && (
                        <Button className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay productos.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-end space-x-2 py-4 cursor-pointer">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Anterior
                </Button>
                <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Siguiente
                </Button>
            </div>

            {/* MODAL CREAR */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Crear Producto</DialogTitle></DialogHeader>
                    <ProductForm 
                        categories={categories} 
                        branches={branches} 
                        onSuccess={() => setIsCreateOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* MODAL EDITAR */}
            <Dialog open={!!editingProduct} onOpenChange={(val) => !val && setEditingProduct(null)}>
                <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Producto</DialogTitle></DialogHeader>
                    {editingProduct && (
                        <ProductForm 
                            product={editingProduct} 
                            categories={categories} 
                            branches={branches} 
                            onSuccess={() => setEditingProduct(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* MODAL ELIMINAR */}
            <AlertDialog open={!!deletingProduct} onOpenChange={(val) => !val && setDeletingProduct(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar Producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El producto <b>{deletingProduct?.name}</b> dejará de estar visible en el kiosko.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 cursor-pointer" onClick={handleDelete}>Desactivar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}