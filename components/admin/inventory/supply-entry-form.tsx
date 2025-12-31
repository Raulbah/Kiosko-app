"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSupplyStockAction } from "@/lib/actions/supply-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SupplyEntryFormProps {
    supplyId: string;
    unit: string; // Para mostrar KG, L, UNIT al usuario
    onSuccess: () => void;
}

export function SupplyEntryForm({ supplyId, unit, onSuccess }: SupplyEntryFormProps) {
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const qtyNum = parseFloat(quantity);

        if (isNaN(qtyNum) || qtyNum <= 0) {
            toast.error("La cantidad debe ser mayor a 0");
            return;
        }

        setLoading(true);
        try {
            // Llamamos a la server action
            const result = await addSupplyStockAction(supplyId, qtyNum, reason);
            
            if (result.success) {
                toast.success(result.message);
                onSuccess(); // Cierra el modal y refresca la tabla
            } else {
                toast.error(result.message || "Error al registrar entrada");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        
            <div className="grid gap-2">
                <Label htmlFor="quantity">Cantidad a ingresar</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="quantity"
                        type="number"
                        step="0.001" // Permite miligramos/mililitros (3 decimales)
                        placeholder="0.000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={loading}
                        required
                        className="flex-1"
                    />
                    <div className="bg-slate-100 border px-3 py-2 rounded-md text-sm font-bold text-slate-600 min-w-12 text-center">
                        {unit}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="reason">Motivo / Referencia (Opcional)</Label>
                <Input
                    id="reason"
                    placeholder="Ej. Compra Factura A-123 o Reposición"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                    </>
                ) : (
                    "Confirmar Entrada"
                )}
            </Button>
        </form>
    );
}