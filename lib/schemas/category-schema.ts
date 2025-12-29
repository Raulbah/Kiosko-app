import { z } from "zod";

export const CategoryFormSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    // La imagen es opcional en edición, pero recomendada
    image: z.any().optional(), 
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;