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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserForm } from "./user-form";
import { getColumns, UserColumn } from "./columns";
import { deleteUserAction } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface UsersTableProps {
    data: UserColumn[];
    roles: any[];
    branches: any[];
    permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean };
}

export function UsersTable({ data, roles, branches, permissions }: UsersTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    
    // Estados para Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [deletingUser, setDeletingUser] = useState<any | null>(null);

    // Handlers
    const handleDelete = async () => {
        if (!deletingUser) return;
        const res = await deleteUserAction(deletingUser.id);
        if (res.success) {
            toast.success(res.message);
            setDeletingUser(null);
        } else {
            toast.error(res.message);
        }
    };

    const columns = getColumns({
        onEdit: (user) => setEditingUser(user),
        onDelete: (user) => setDeletingUser(user),
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
                    placeholder="Buscar usuarios..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {permissions.canCreate && (
                    <Button className="cursor-pointer" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                )}
            </div>

            {/* Tabla */}
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
                                    No se encontraron resultados.
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

            {/* --- MODAL CREAR --- */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    </DialogHeader>
                    <UserForm 
                        roles={roles} 
                        branches={branches} 
                        onSuccess={() => setIsCreateOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* --- MODAL EDITAR --- */}
            <Dialog open={!!editingUser} onOpenChange={(val) => !val && setEditingUser(null)}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <UserForm 
                            user={editingUser} 
                            roles={roles} 
                            branches={branches} 
                            onSuccess={() => setEditingUser(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* --- MODAL ELIMINAR --- */}
            <AlertDialog open={!!deletingUser} onOpenChange={(val) => !val && setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará a <b>{deletingUser?.name}</b> permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}