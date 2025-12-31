"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adjustStockAction } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdjustmentProps {
    product: {
        id: string; // Product ID
        name: string;
        quantity: number; // Stock actual del sistema
    };
    onSuccess: () => void;
}

export function StockAdjustmentForm({ product, onSuccess }: AdjustmentProps) {
    const [realQty, setRealQty] = useState(product.quantity);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (realQty < 0) {
            toast.error("El stock no puede ser negativo");
            return;
        }
        if (!reason.trim()) {
            toast.error("Debes indicar el motivo del ajuste");
            return;
        }

        setLoading(true);
        // Llamamos a la server action
        const res = await adjustStockAction(product.id, Number(realQty), reason);
        
        if (res.success) {
            toast.success(res.message);
            onSuccess();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-100 p-3 rounded text-sm text-slate-600 mb-4">
                Stock actual en sistema: <strong>{product.quantity}</strong>
            </div>

            <div>
                <Label>Conteo Físico Real</Label>
                <Input 
                    type="number" 
                    min="0" 
                    value={realQty} 
                    onChange={e => setRealQty(Number(e.target.value))} 
                    required 
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Ingresa la cantidad que contaste físicamente. El sistema calculará la diferencia.
                </p>
            </div>

            <div>
                <Label>Motivo del Ajuste</Label>
                <Textarea 
                    placeholder="Ej. Merma por caducidad, Error de conteo, Robo..." 
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Ajuste"}
            </Button>
        </form>
    );
}