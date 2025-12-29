import { z } from "zod";

// Validamos cada fila de la matriz
const PermissionSchema = z.object({
    moduleId: z.string(),
    moduleName: z.string().optional(),
    canCreate: z.boolean(),
    canRead: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
});

export const RoleFormSchema = z.object({
    name: z.string().min(2, "El nombre del rol es requerido"),
    permissions: z.array(PermissionSchema),
});

export type RoleFormValues = z.infer<typeof RoleFormSchema>;