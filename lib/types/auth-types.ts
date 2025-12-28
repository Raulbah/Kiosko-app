// lib/types/auth-types.ts
import { z } from "zod";

// Login Schema
export const LoginSchema = z.object({
    employeeId: z.string().min(1, "ID requerido"),
    password: z.string().min(1, "Contraseña requerida"),
});

// Tipo derivado seguro
export type LoginFormValues = z.infer<typeof LoginSchema>;

// Tipo para la sesión decodificada (JWT)
export interface SessionPayload {
    userId: string;
    role: string;
    branchId: string;
    permissions: {
        module: string;
        actions: {
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
        };
    }[];
    exp: number;
}

// Result genérico para Server Actions
export type ActionState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};