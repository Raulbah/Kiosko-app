"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BranchForm } from "./branch-form";
import { getColumns, BranchColumn } from "./columns";
import { deleteBranchAction } from "@/lib/actions/branch-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface BranchesTableProps {
    data: BranchColumn[];
    permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean };
}

export function BranchesTable({ data, permissions }: BranchesTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any | null>(null);
    const [deletingBranch, setDeletingBranch] = useState<any | null>(null);

    const handleDelete = async () => {
        if (!deletingBranch) return;
        const res = await deleteBranchAction(deletingBranch.id);
        if (res.success) {
            toast.success(res.message);
            setDeletingBranch(null);
        } else {
            toast.error(res.message);
        }
    };

    const columns = getColumns({
        onEdit: (branch) => setEditingBranch(branch),
        onDelete: (branch) => setDeletingBranch(branch),
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
                    placeholder="Buscar sucursales..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {permissions.canCreate && (
                    <Button className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Sucursal
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
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay resultados.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modales */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader><DialogTitle>Crear Sucursal</DialogTitle></DialogHeader>
                    <BranchForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingBranch} onOpenChange={(val) => !val && setEditingBranch(null)}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader><DialogTitle>Editar Sucursal</DialogTitle></DialogHeader>
                    {editingBranch && <BranchForm branch={editingBranch} onSuccess={() => setEditingBranch(null)} />}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingBranch} onOpenChange={(val) => !val && setDeletingBranch(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar Sucursal?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La sucursal <b>{deletingBranch?.name}</b> dejará de estar disponible para operaciones.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={handleDelete}>Desactivar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}