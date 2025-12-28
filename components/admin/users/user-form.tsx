"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserFormSchema, UserFormValues } from "@/lib/schemas/user-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createUserAction, updateUserAction } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UserFormProps {
    user?: any; 
    roles: { id: string; name: string }[];
    branches: { id: string; name: string }[];
    onSuccess: () => void;
}

export function UserForm({ user, roles, branches, onSuccess }: UserFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            name: user?.name || "",
            employeeId: user?.employeeId || "",
            password: "", 
            roleId: user?.roleId || "",
            branchId: user?.branchId || "",
            isActive: user?.isActive ?? true, 
            image: undefined,
        },
    });

    const onSubmit = async (data: UserFormValues) => {
        setLoading(true);
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("employeeId", data.employeeId);
        
        // Solo enviamos password si el usuario escribió algo (si no es string vacío)
        if (data.password && data.password.trim() !== "") {
            formData.append("password", data.password);
        }
        
        formData.append("roleId", data.roleId);
        formData.append("branchId", data.branchId);
        formData.append("isActive", String(data.isActive));
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput?.files?.[0]) {
            formData.append("image", fileInput.files[0]);
        }

        try {
            let result;
            if (user) {
                result = await updateUserAction(user.id, formData);
            } else {
                result = await createUserAction(formData);
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. Empleado</FormLabel>
                                <FormControl><Input {...field} disabled={!!user} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{user ? "Nueva Contraseña (Opcional)" : "Contraseña"}</FormLabel>
                                <FormControl>
                                    {/* El value siempre será string gracias al defaultValues */}
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="roleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="branchId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sucursal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormItem>
                    <FormLabel>Foto de Perfil</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" />
                    </FormControl>
                    <p className="text-[0.8rem] text-muted-foreground">JPG, PNG. Máx 2MB.</p>
                </FormItem>
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Usuario Activo</FormLabel>
                            </div>
                            <FormControl>
                                <Switch 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {user ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
            </form>
        </Form>
    );
}