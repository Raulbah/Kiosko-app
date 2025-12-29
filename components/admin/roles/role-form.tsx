"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoleFormSchema, RoleFormValues } from "@/lib/schemas/role-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { createRoleAction, updateRoleAction } from "@/lib/actions/role-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RoleFormProps {
    role?: any;
    modules: { id: string; name: string }[];
    onSuccess: () => void;
}

export function RoleForm({ role, modules, onSuccess }: RoleFormProps) {
    const [loading, setLoading] = useState(false);

    // Generamos los valores iniciales asegurando booleanos estrictos
    const defaultPermissions = modules.map(mod => {
        const existingPerm = role?.permissions?.find((p: any) => p.moduleId === mod.id);
        return {
            moduleId: mod.id,
            moduleName: mod.name,
            canRead: existingPerm?.canRead ?? false,
            canCreate: existingPerm?.canCreate ?? false,
            canUpdate: existingPerm?.canUpdate ?? false,
            canDelete: existingPerm?.canDelete ?? false,
        };
    });

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(RoleFormSchema),
        defaultValues: {
            name: role?.name || "",
            permissions: defaultPermissions,
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "permissions",
    });

    const onSubmit = async (data: RoleFormValues) => {
        setLoading(true);
        try {
            let result;
            if (role) {
                result = await updateRoleAction(role.id, data);
            } else {
                result = await createRoleAction(data);
            }

            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    // Definimos las acciones como constante para mejor tipado en el map
    const actions = ["canRead", "canCreate", "canUpdate", "canDelete"] as const;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Nombre del Rol */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Rol</FormLabel>
                            <FormControl><Input placeholder="Ej. Cajero, Gerente..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Matriz de Permisos */}
                <div className="border rounded-md max-h-100 overflow-y-auto bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Módulo</TableHead>
                                <TableHead className="text-center w-20">Ver</TableHead>
                                <TableHead className="text-center w-20">Crear</TableHead>
                                <TableHead className="text-center w-20">Editar</TableHead>
                                <TableHead className="text-center w-20">Borrar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell className="font-medium">
                                        {field.moduleName} 
                                        {/* Input oculto para mantener el ID en el form data */}
                                        <input type="hidden" {...form.register(`permissions.${index}.moduleId`)} />
                                    </TableCell>
                                    
                                    {/* Iteramos sobre las acciones con tipado correcto */}
                                    {actions.map((action) => (
                                        <TableCell key={action} className="text-center">
                                            <FormField
                                                control={form.control}
                                                // Usamos template literal types para el path correcto
                                                name={`permissions.${index}.${action}`} 
                                                render={({ field: cbField }) => (
                                                    <FormControl>
                                                        <Checkbox
                                                            className="cursor-pointer"
                                                            checked={cbField.value}
                                                            onCheckedChange={cbField.onChange}
                                                        />
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {role ? "Actualizar Rol" : "Crear Rol"}
                </Button>
            </form>
        </Form>
    );
}