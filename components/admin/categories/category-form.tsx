"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryFormSchema, CategoryFormValues } from "@/lib/schemas/category-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/category-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
    category?: any;
    onSuccess: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(CategoryFormSchema),
        defaultValues: {
            name: category?.name || "",
            image: undefined,
        },
    });

    const onSubmit = async (data: CategoryFormValues) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("name", data.name);
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput?.files?.[0]) {
            formData.append("image", fileInput.files[0]);
        }

        try {
            let result;
            if (category) {
                result = await updateCategoryAction(category.id, formData);
            } else {
                result = await createCategoryAction(formData);
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
                            <FormLabel>Nombre</FormLabel>
                            <FormControl><Input placeholder="Ej. Bebidas, Postres..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <FormLabel>Icono / Imagen</FormLabel>
                    <FormControl className="cursor-pointer">
                        <Input type="file" accept="image/*" />
                    </FormControl>
                    <p className="text-[0.8rem] text-muted-foreground">Recomendado: PNG Transparente o SVG.</p>
                </FormItem>
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {category ? "Actualizar" : "Crear"}
                </Button>
            </form>
        </Form>
    );
}