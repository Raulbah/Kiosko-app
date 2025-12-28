import { z } from "zod";

export const UserFormSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    employeeId: z.string().min(3, "ID requerido"),
    password: z.string().optional().or(z.literal("")), 
    roleId: z.string().uuid("Selecciona un rol válido"),
    branchId: z.string().uuid("Selecciona una sucursal válida"),
    isActive: z.boolean(), 
    image: z.any().optional(), 
});

export type UserFormValues = z.infer<typeof UserFormSchema>;