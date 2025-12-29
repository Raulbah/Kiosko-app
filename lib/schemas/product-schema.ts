import { z } from "zod";

// Validación de Tamaños
const ProductSizeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nombre del tamaño requerido"),
    // CORRECCIÓN: Usamos z.number() directo. El formulario ya garantiza que es número.
    price: z.number().min(0, "El precio no puede ser negativo"),
});

// Validación de Producto
export const ProductFormSchema = z.object({
    name: z.string().min(2, "Nombre requerido"),
    description: z.string().optional(),
    // CORRECCIÓN: Usamos z.number() directo.
    price: z.number().min(0, "Precio base requerido"),
    categoryId: z.string().uuid("Selecciona una categoría"),
    // CORRECCIÓN: Aceptamos UUID O string vacío O literal "global"
    branchId: z.union([z.string().uuid(), z.literal("global"), z.literal("")]),
    isActive: z.boolean(),
    image: z.any().optional(),
    
    // Array de Tamaños
    sizes: z.array(ProductSizeSchema).optional(),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;