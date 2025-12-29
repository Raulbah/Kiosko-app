"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BranchFormSchema, BranchFormValues } from "@/lib/schemas/branch-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { createBranchAction, updateBranchAction } from "@/lib/actions/branch-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface BranchFormProps {
    branch?: any;
    onSuccess: () => void;
}

export function BranchForm({ branch, onSuccess }: BranchFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(BranchFormSchema),
        defaultValues: {
            name: branch?.name || "",
            address: branch?.address || "",
            isActive: branch?.isActive ?? true,
        },
    });

    const onSubmit = async (data: BranchFormValues) => {
        setLoading(true);
        try {
            let result;
            if (branch) {
                result = await updateBranchAction(branch.id, data);
            } else {
                result = await createBranchAction(data);
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
                            <FormLabel>Nombre de Sucursal</FormLabel>
                            <FormControl><Input placeholder="Ej. Sucursal Centro" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl><Input placeholder="Ej. Av. Reforma 123..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel className="cursor-pointer">Sucursal Operativa</FormLabel>
                            </div>
                            <FormControl>
                                <Switch className="cursor-pointer" checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {branch ? "Actualizar Sucursal" : "Crear Sucursal"}
                </Button>
            </form>
        </Form>
    );
}