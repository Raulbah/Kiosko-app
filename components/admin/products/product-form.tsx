"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormSchema, ProductFormValues } from "@/lib/schemas/product-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProductAction, updateProductAction } from "@/lib/actions/product-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
    product?: any;
    categories: any[];
    branches: any[];
    onSuccess: () => void;
}

export function ProductForm({ product, categories, branches, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            // Aseguramos que sea número
            price: product?.price ? Number(product.price) : 0,
            categoryId: product?.categoryId || "",
            branchId: product?.branchId || "global", // Default "global" para evitar vacío
            isActive: product?.isActive ?? true,
            image: undefined,
            sizes: product?.sizes?.map((s: any) => ({ 
                name: s.name, 
                price: Number(s.price), 
                id: s.id 
            })) || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sizes",
    });

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        const formData = new FormData();
        
        formData.append("name", data.name);
        if(data.description) formData.append("description", data.description);
        formData.append("price", String(data.price));
        formData.append("categoryId", data.categoryId);
        // Manejo especial para global
        formData.append("branchId", data.branchId === "global" ? "" : data.branchId);
        formData.append("isActive", String(data.isActive));

        const cleanSizes = data.sizes?.map(s => ({ name: s.name, price: s.price })) || [];
        formData.append("sizes", JSON.stringify(cleanSizes));

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput?.files?.[0]) formData.append("image", fileInput.files[0]);

        try {
            let result;
            if (product) result = await updateProductAction(product.id, formData);
            else result = await createProductAction(formData);

            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("🔥 Error en onSubmit:", error);
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* TABS CONTAINER */}
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger className="cursor-pointer" value="info">Información General</TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="sizes">Tamaños y Precios</TabsTrigger>
                    </TabsList>
                    
                    {/* TAB 1: INFO (Sin el input de imagen) */}
                    <TabsContent value="info" className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nombre del Producto</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* ... (Precios, Categoría, Sucursal, Descripción siguen igual) ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Base</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.50" 
                                                {...field} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl className="cursor-pointer"><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem className="cursor-pointer" key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="branchId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Disponibilidad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "global"}>
                                        <FormControl className="cursor-pointer"><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem className="cursor-pointer" value="global">Todas las Sucursales (Global)</SelectItem>
                                            {branches.map(b => <SelectItem className="cursor-pointer" key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-end pb-2">
                                        <div className="flex items-center gap-2">
                                            <Switch className="cursor-pointer" checked={field.value} onCheckedChange={field.onChange} />
                                            <FormLabel className="pb-0">Producto Activo</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    {/* TAB 2: TAMAÑOS (Igual que antes) */}
                    <TabsContent value="sizes" className="space-y-4 mt-4">
                        {/* ... lógica de sizes ... */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Configuración de Tamaños</h3>
                            <Button className="cursor-pointer" type="button" variant="outline" size="sm" onClick={() => append({ name: "", price: 0 })}>
                                <Plus className="mr-2 h-3 w-3" /> Agregar Tamaño
                            </Button>
                        </div>
                        
                        {fields.length === 0 && (
                            <div className="text-center p-6 border border-dashed rounded-md text-slate-500 text-sm">
                                Este producto usa precio único base.
                            </div>
                        )}

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <FormField
                                        control={form.control}
                                        name={`sizes.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                            <FormLabel className="text-xs">Nombre (Ej. Grande)</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`sizes.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem className="w-28">
                                            <FormLabel className="text-xs">Precio</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.50" 
                                                    {...field} 
                                                    onChange={(e) => {
                                                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                        field.onChange(val);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" className="mb-0.5 cursor-pointer" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* --- MOVIDO FUERA DE TABS --- */}
                <div className="border-t pt-4">
                    <FormItem>
                        <FormLabel>Imagen del Producto</FormLabel>
                        <FormControl className="cursor-pointer">
                            <Input type="file" accept="image/*" />
                        </FormControl>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Se subirá al guardar. (JPG, PNG)
                        </p>
                    </FormItem>
                </div>

                <Button type="submit" className="w-full mt-4 cursor-pointer" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {product ? "Guardar Cambios" : "Crear Producto"}
                </Button>
            </form>
        </Form>
    );
}