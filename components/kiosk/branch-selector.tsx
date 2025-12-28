"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <--- Importante
import { Loader2 } from "lucide-react"; // Icono de carga
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { setBranchCookie } from "@/lib/actions/kiosk-actions";

type SimpleBranch = { id: string; name: string };

interface BranchSelectorProps {
    branches: SimpleBranch[];
    currentBranchId?: string;
}

export function BranchSelector({ branches, currentBranchId }: BranchSelectorProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");
    const [isLoading, setIsLoading] = useState(false); // <--- Estado de carga
    const router = useRouter(); // <--- Hook de navegación

    useEffect(() => {
        // Solo abrimos si NO hay sucursal seleccionada
        if (!currentBranchId) {
            setOpen(true);
        }
    }, [currentBranchId]);

    const handleConfirm = async () => {
        if (!selected) return;

        try {
            setIsLoading(true);
            // 1. Guardamos la cookie en el servidor
            await setBranchCookie(selected);
            // 2. Cerramos el modal INMEDIATAMENTE (Mejor UX)
            setOpen(false);
            // 3. Refrescamos los Server Components (trae los productos nuevos)
            router.refresh(); 
        } catch (error) {
            console.error("Error al guardar sucursal", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (currentBranchId) setOpen(val) }}>
            <DialogContent 
                className="sm:max-w-md" 
                // Evitar cierre accidental si es obligatorio (no hay currentBranchId)
                onInteractOutside={(e) => { if (!currentBranchId) e.preventDefault() }}
                onEscapeKeyDown={(e) => { if (!currentBranchId) e.preventDefault() }}
            >
                <DialogHeader>
                    <DialogTitle>Bienvenido</DialogTitle>
                    <DialogDescription>
                        Por favor, selecciona la sucursal para ver el menú disponible.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 py-4">
                    <Select onValueChange={setSelected} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button onClick={handleConfirm} disabled={!selected || isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Ingresando...
                            </>
                        ) : (
                            "Ingresar"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}