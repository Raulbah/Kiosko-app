"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplyFormSchema, SupplyFormValues } from "@/lib/schemas/supply-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupplyAction } from "@/lib/actions/supply-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UnitType } from "@/src/generated/prisma/browser";

interface SupplyFormProps {
    onSuccess: () => void;
}

export function SupplyForm({ onSuccess }: SupplyFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<SupplyFormValues>({
        resolver: zodResolver(SupplyFormSchema),
        defaultValues: {
            name: "",
            unit: "UNIT", // Valor por defecto seguro
            cost: 0,
        },
    });

    const onSubmit = async (data: SupplyFormValues) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("unit", data.unit);
        formData.append("cost", String(data.cost));

        const res = await createSupplyAction(formData);

        if (res.success) {
        toast.success(res.message);
        onSuccess();
        } else {
        toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre del Insumo</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. Vasos 12oz, Azúcar, Fresas..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unidad de Medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.values(UnitType).map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Costo Base (Opcional)</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            step="0.01" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Insumo"}
            </Button>
        </form>
        </Form>
    );
}