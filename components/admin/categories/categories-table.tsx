"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CategoryForm } from "./category-form";
import { getColumns, CategoryColumn } from "./columns";
import { deleteCategoryAction } from "@/lib/actions/category-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CategoriesTableProps {
    data: CategoryColumn[];
    permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean };
}

export function CategoriesTable({ data, permissions }: CategoriesTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

    const handleDelete = async () => {
        if (!deletingCategory) return;
        const res = await deleteCategoryAction(deletingCategory.id);
        if (res.success) {
            toast.success(res.message);
            setDeletingCategory(null);
        } else {
            toast.error(res.message);
        }
    };

    const columns = getColumns({
        onEdit: (cat) => setEditingCategory(cat),
        onDelete: (cat) => setDeletingCategory(cat),
        permissions
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Buscar categorías..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {permissions.canCreate && (
                    <Button className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                )}
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow className="bg-gray-50" key={headerGroup.id}>
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
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay categorías.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MODALES */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader><DialogTitle>Crear Categoría</DialogTitle></DialogHeader>
                    <CategoryForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingCategory} onOpenChange={(val) => !val && setEditingCategory(null)}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader><DialogTitle>Editar Categoría</DialogTitle></DialogHeader>
                    {editingCategory && <CategoryForm category={editingCategory} onSuccess={() => setEditingCategory(null)} />}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingCategory} onOpenChange={(val) => !val && setDeletingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Asegúrate de que <b>{deletingCategory?.name}</b> no tenga productos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 cursor-pointer" onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}