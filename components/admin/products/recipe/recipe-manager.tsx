"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ChefHat } from "lucide-react";
import { addRecipeItemAction, removeRecipeItemAction } from "@/lib/actions/recipe-actions";
import { toast } from "sonner";

interface RecipeManagerProps {
    productId: string;
    items: any[];    // Ingredientes actuales de la receta
    supplies: any[]; // Catálogo de insumos disponibles
}

export function RecipeManager({ productId, items, supplies }: RecipeManagerProps) {
    const [selectedSupply, setSelectedSupply] = useState("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);

    // Calcular costo teórico
    const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.supply.cost), 0);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupply || !quantity) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("supplyId", selectedSupply);
        formData.append("quantity", quantity);

        const res = await addRecipeItemAction(formData);
        
        if (res.success) {
            toast.success(res.message);
            setQuantity("");
            setSelectedSupply("");
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const res = await removeRecipeItemAction(id, productId);
        if (!res.success) toast.error(res.message);
    };

    // Buscar unidad del insumo seleccionado para mostrar hint visual
    const currentSupplyUnit = supplies.find(s => s.id === selectedSupply)?.unit || "Unidad";

    return (
        <div className="grid gap-6 md:grid-cols-2">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Agregar Ingrediente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Insumo</label>
                            <Select value={selectedSupply} onValueChange={setSelectedSupply}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona materia prima..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {supplies.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} ({s.unit}) - ${s.cost.toFixed(2)}/{s.unit}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cantidad ({currentSupplyUnit})</label>
                            <Input 
                                type="number" 
                                step="0.001" 
                                placeholder="0.000" 
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Ej: Si es KG y usas 200g, pon 0.200
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || !selectedSupply}>
                            {loading ? "Agregando..." : "Agregar a Receta"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* COLUMNA DERECHA: LISTA Y COSTOS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5" /> Receta Actual
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ingrediente</TableHead>
                                <TableHead>Cant.</TableHead>
                                <TableHead>Costo</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                        No hay ingredientes definidos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.supply.name}</TableCell>
                                        <TableCell>
                                            {item.quantity} <span className="text-xs text-muted-foreground">{item.supply.unit}</span>
                                        </TableCell>
                                        <TableCell>${(item.quantity * item.supply.cost).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Resumen de Costos */}
                    {items.length > 0 && (
                        <div className="mt-6 pt-4 border-t bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Costo Estimado de Producción:</span>
                                <span className="text-xl font-bold text-slate-900">${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}