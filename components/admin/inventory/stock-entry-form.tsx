"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStockAction } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";

export function StockEntryForm({ productId, onSuccess }: { productId: string, onSuccess: () => void }) {
    const [qty, setQty] = useState(1);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await addStockAction(productId, Number(qty), reason);
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
            <div>
                <Label>Cantidad a ingresar</Label>
                <Input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} required />
            </div>
            <div>
                <Label>Motivo / Referencia (Opcional)</Label>
                <Input placeholder="Ej. Factura F-1234" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Confirmar Entrada"}
            </Button>
        </form>
    );
}