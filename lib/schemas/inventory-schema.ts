import { z } from "zod";

export const StockEntrySchema = z.object({
    productId: z.string().uuid("Selecciona un producto"),
    quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
    reason: z.string().optional(),
});

export const StockAdjustmentSchema = z.object({
    productId: z.string().uuid(),
    currentPhysical: z.coerce.number().min(0), // Lo que contaste físicamente
    reason: z.string().min(3, "Justifica el ajuste (ej. Merma, Robo)"),
});