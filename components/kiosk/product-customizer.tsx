"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "./store/cart-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- TIPOS ---
export type ProductSize = { id: string; name: string; price: number };
export type ModifierOption = { id: string; name: string; price: number };
export type ModifierGroup = { 
    id: string; 
    name: string; 
    minSelect: number; 
    maxSelect: number;
    includedSelect: number;
    extraPrice: number;
    options: ModifierOption[] 
};
export type ProductWithModifiers = {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    modifierGroups: ModifierGroup[];
    sizes: ProductSize[]; // <--- Nuevo campo
};

interface ProductCustomizerProps {
    product: ProductWithModifiers | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductCustomizer({ product, isOpen, onClose }: ProductCustomizerProps) {
    const addItem = useCartStore((state) => state.addItem);
    
    // Estados
    const [selectedSizeId, setSelectedSizeId] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({}); 

    // Reset al abrir
    useEffect(() => {
        if (isOpen && product) {
            setSelectedOptions({});
            // Si hay tamaños, NO seleccionamos por defecto para forzar al usuario a elegir (UX)
            // Opcional: Podrías pre-seleccionar el primero: if(product.sizes.length) setSelectedSizeId(product.sizes[0].id);
            setSelectedSizeId(""); 
        }
    }, [isOpen, product]);

    if (!product) return null;

    const hasSizes = product.sizes && product.sizes.length > 0;

    // --- CALCULADORA DE PRECIOS ---
    
    // 1. Precio Base (Depende de si hay tamaños o no)
    let currentBasePrice = product.price;
    if (hasSizes) {
        const sizeObj = product.sizes.find(s => s.id === selectedSizeId);
        currentBasePrice = sizeObj ? sizeObj.price : 0; // 0 si no ha seleccionado tamaño
    }

    // 2. Precio Modificadores
    let totalModifiersCost = 0;
    product.modifierGroups.forEach(group => {
        const selectedIds = selectedOptions[group.id] || [];
        
        // Costo opciones individuales
        const optionsCost = group.options
        .filter(opt => selectedIds.includes(opt.id))
        .reduce((sum, opt) => sum + opt.price, 0);

        // Costo extra por cantidad
        let extraItemsCost = 0;
        if (group.includedSelect > 0 && selectedIds.length > group.includedSelect) {
            const extraCount = selectedIds.length - group.includedSelect;
            extraItemsCost = extraCount * group.extraPrice;
        }
        totalModifiersCost += optionsCost + extraItemsCost;
    });

    const finalPrice = currentBasePrice + totalModifiersCost;

    // --- VALIDACIONES ---
    const isSizeValid = hasSizes ? !!selectedSizeId : true;
    const areModifiersValid = product.modifierGroups.every(group => {
        const count = (selectedOptions[group.id] || []).length;
        return count >= group.minSelect;
    });
    const isValid = isSizeValid && areModifiersValid;

    // --- HANDLERS ---
    const handleToggleOption = (groupId: string, optionId: string, maxSelect: number) => {
        setSelectedOptions((prev) => {
            const current = prev[groupId] || [];
            const isSelected = current.includes(optionId);
            
            if (isSelected) return { ...prev, [groupId]: current.filter(id => id !== optionId) };
            
            if (current.length >= maxSelect) {
                if (maxSelect === 1) return { ...prev, [groupId]: [optionId] };
                return prev;
            }
            return { ...prev, [groupId]: [...current, optionId] };
        });
    };

    const handleAddToCart = () => {
        if (!isValid) return;

        // Construir nombre con tamaño
        let finalProductName = product.name;
        if (hasSizes) {
            const sizeName = product.sizes.find(s => s.id === selectedSizeId)?.name;
            finalProductName = `${product.name} (${sizeName})`;
        }

        // Preparar modificadores para carrito
        const modifiersForCart: { id: string; name: string; price: number }[] = [];
        
        product.modifierGroups.forEach(group => {
            const selectedIds = selectedOptions[group.id] || [];
            const count = selectedIds.length;
            
            selectedIds.forEach(id => {
                const opt = group.options.find(o => o.id === id);
                if (opt) modifiersForCart.push({ id: opt.id, name: opt.name, price: opt.price });
            });

            if (group.includedSelect > 0 && count > group.includedSelect) {
                const extraCount = count - group.includedSelect;
                const totalExtra = extraCount * group.extraPrice;
                if (totalExtra > 0) {
                    modifiersForCart.push({
                        id: `extra-${group.id}`,
                        name: `Extras: ${group.name} (x${extraCount})`,
                        price: totalExtra
                    });
                }
            }
        });

        addItem({
            productId: product.id,
            name: finalProductName,
            basePrice: currentBasePrice,
            imageUrl: product.imageUrl || undefined,
            selectedModifiers: modifiersForCart,
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            {/* CORRECCIÓN SCROLL: max-h-[90vh] y flex-col */}
            <DialogContent className="sm:max-w-lg max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">
                
                {/* Header Fijo */}
                <DialogHeader className="p-4 bg-white border-b shrink-0 z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">{product.name}</DialogTitle>
                    <DialogDescription className="text-slate-500 line-clamp-1">
                        {product.description || "Personaliza tu producto"}
                    </DialogDescription>
                </DialogHeader>

                {/* Cuerpo Scrolleable - Usamos overflow-y-auto nativo en lugar de ScrollArea para evitar conflictos */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {/* 1. SECCIÓN DE TAMAÑOS (Si existen) */}
                    {hasSizes && (
                        <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Elige el tamaño
                            </h3>
                            <RadioGroup value={selectedSizeId} onValueChange={setSelectedSizeId} className="grid grid-cols-1 gap-2">
                                {product.sizes.map((size) => (
                                    <div key={size.id} className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                                        selectedSizeId === size.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-300"
                                    )}>
                                        <RadioGroupItem value={size.id} id={size.id} className="sr-only" />
                                        <Label htmlFor={size.id} className="flex-1 flex justify-between cursor-pointer">
                                            <span className="font-medium text-base">{size.name}</span>
                                            <span className="font-bold text-slate-700">${size.price.toFixed(2)}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* 2. MODIFICADORES */}
                    {product.modifierGroups.map((group, index) => {
                        const currentSelections = selectedOptions[group.id] || [];
                        const count = currentSelections.length;
                        // Si hay tamaños, el índice visual se desplaza +1
                        const stepNumber = hasSizes ? index + 2 : index + 1;

                        return (
                            <div key={group.id} className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                            {stepNumber}
                                        </span>
                                        {group.name}
                                    </h3>
                                    <Badge variant="outline" className="ml-2">
                                        {group.maxSelect > 1 ? `Max ${group.maxSelect}` : 'Solo 1'}
                                    </Badge>
                                </div>
                                
                                {(group.includedSelect > 0 || group.extraPrice > 0) && (
                                    <p className="text-xs text-slate-500 pl-8">
                                        {group.includedSelect > 0 && `Incluye ${group.includedSelect} gratis. `}
                                        {group.extraPrice > 0 && `Extras +$${group.extraPrice} c/u.`}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    {group.options.map((option) => {
                                        const isSelected = currentSelections.includes(option.id);
                                        const willCostExtra = !isSelected && count >= group.includedSelect && group.extraPrice > 0;
                                        
                                        return (
                                            <div 
                                                key={option.id}
                                                onClick={() => handleToggleOption(group.id, option.id, group.maxSelect)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98]",
                                                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={isSelected} className="pointer-events-none" />
                                                    <span className="font-medium text-slate-700">{option.name}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-semibold",
                                                    option.price > 0 || (willCostExtra && !isSelected) ? "text-primary" : "text-slate-400"
                                                )}>
                                                    {option.price > 0 
                                                        ? `+$${option.price}` 
                                                        : (willCostExtra ? `+$${group.extraPrice}` : 'Incluido')}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Footer Fijo */}
                <div className="p-4 border-t bg-white shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <Button 
                        className="w-full h-14 text-lg shadow-xl hover:shadow-2xl transition-all" 
                        size="lg"
                        disabled={!isValid}
                        onClick={handleAddToCart}
                    >
                        <div className="flex justify-between w-full items-center px-2">
                            <span className="text-base font-normal opacity-90">
                                {isValid ? "Agregar al Pedido" : (
                                    !isSizeValid ? "Selecciona un tamaño" : "Completa las opciones"
                                )}
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-md font-bold text-xl">
                                ${finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}