import { z } from "zod";

export const BranchFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    address: z.string().min(5, "La dirección es muy corta"),
    isActive: z.boolean(),
    // El slug se genera en el servidor, no lo pedimos en el form
});

export type BranchFormValues = z.infer<typeof BranchFormSchema>;