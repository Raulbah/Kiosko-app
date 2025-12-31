import { z } from "zod";
import { UnitType } from "@/src/generated/prisma/browser"; 

export const SupplyFormSchema = z.object({
    name: z.string().min(2, "El nombre del insumo es requerido"),
    unit: z.nativeEnum(UnitType),
    cost: z.number().min(0, "El costo no puede ser negativo"),
});

export type SupplyFormValues = z.infer<typeof SupplyFormSchema>;