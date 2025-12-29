"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RoleForm } from "./role-form";
import { getColumns, RoleColumn } from "./columns";
import { deleteRoleAction } from "@/lib/actions/role-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface RolesTableProps {
    data: RoleColumn[];
    modules: any[];
    permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean };
}

export function RolesTable({ data, modules, permissions }: RolesTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any | null>(null);
    const [deletingRole, setDeletingRole] = useState<any | null>(null);

    const handleDelete = async () => {
        if (!deletingRole) return;
        const res = await deleteRoleAction(deletingRole.id);
        if (res.success) {
            toast.success(res.message);
            setDeletingRole(null);
        } else {
            toast.error(res.message);
        }
    };

    const columns = getColumns({
        onEdit: (role) => setEditingRole(role),
        onDelete: (role) => setDeletingRole(role),
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
                    placeholder="Buscar roles..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {permissions.canCreate && (
                    <Button className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
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
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay roles.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MODALES */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-175">
                    <DialogHeader><DialogTitle>Crear Nuevo Rol</DialogTitle></DialogHeader>
                    <RoleForm modules={modules} onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingRole} onOpenChange={(val) => !val && setEditingRole(null)}>
                <DialogContent className="sm:max-w-175">
                    <DialogHeader><DialogTitle>Editar Rol y Permisos</DialogTitle></DialogHeader>
                    {editingRole && <RoleForm role={editingRole} modules={modules} onSuccess={() => setEditingRole(null)} />}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingRole} onOpenChange={(val) => !val && setDeletingRole(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Rol?</AlertDialogTitle>
                        <AlertDialogDescription>Si eliminas <b>{deletingRole?.name}</b>, asegúrate de que no haya usuarios asignados a este rol.</AlertDialogDescription>
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