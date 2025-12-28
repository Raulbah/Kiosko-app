"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ShoppingBag, Minus, Plus, CreditCard } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "./store/cart-store";
import { placeOrderAction } from "@/lib/actions/order-actions";
import { toast } from "sonner"; // Importamos el toast
import { Input } from "@/components/ui/input"; // <--- Importar Input
import { Label } from "@/components/ui/label"; // <--- Importar Label

export function CartSheet() {
    const { items, isOpen, toggleCart, removeItem, decreaseItem, addItem, clearCart, total } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerName, setCustomerName] = useState("");

    // Calcular total
    const cartTotal = total();

    const handleCheckout = async () => {
        if (!customerName.trim()) return;
        setIsProcessing(true);

        try {
        // 1. Formatear datos (ESTO ESTABA BIEN)
        const orderItems = items.map(item => {
            const modifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
            const unitPrice = item.basePrice + modifiersTotal;
            
            return {
                productId: item.productId,
                quantity: item.quantity,
                basePrice: item.basePrice,
                priceWithModifiers: unitPrice, // El backend necesita esto
                name: item.name,
                details: {                     // El backend necesita esto
                    modifiers: item.selectedModifiers
                }
            };
        });

        // 2. Llamar al Server Action
        const result = await placeOrderAction(orderItems, cartTotal, customerName);

        if (result.success) {
            toast.success("¡Orden Enviada!", { description: result.message, duration: 5000 });
            clearCart();
            setCustomerName("");
            toggleCart();
        } else {
            toast.error("Error", { description: result.message });
        }
        } catch (error) {
            console.error(error); // Agregamos log para debug en consola navegador
            toast.error("Error de conexión");
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-slate-50">
                {/* Header */}
                <SheetHeader className="p-6 bg-white border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <ShoppingBag className="h-5 w-5 text-primary" />Tu Pedido
                        <span className="ml-auto text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">
                            {items.length} items
                        </span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">Resumen de productos agregados</SheetDescription>
                </SheetHeader>

                {/* Lista de Items (Scrollable) */}
                <ScrollArea className="flex-1 p-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 mt-20">
                            <ShoppingBag className="h-16 w-16 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <Button className="cursor-pointer" variant="outline" onClick={toggleCart}>Volver al menú</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const modifiersTotal = item.selectedModifiers.reduce((acc, curr) => acc + curr.price, 0);
                                const unitPrice = item.basePrice + modifiersTotal;

                                return (
                                <div key={item.cartItemId} className="flex gap-4 bg-white p-3 rounded-xl border shadow-sm">
                                    {/* Imagen Miniatura */}
                                    <div className="relative h-16 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">Img</div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                                        
                                        {/* Lista de Modificadores */}
                                        {item.selectedModifiers.length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {item.selectedModifiers.map(m => m.name).join(", ")}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-bold text-primary text-sm">${(unitPrice * item.quantity).toFixed(2)}</p>
                                            
                                            {/* Controles de Cantidad Pequeños */}
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-0.5 border">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 rounded-md cursor-pointer" 
                                                onClick={() => decreaseItem(item.cartItemId)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 rounded-md cursor-pointer"
                                                onClick={() => addItem({
                                                    ...item,
                                                    selectedModifiers: item.selectedModifiers // Pasamos lo mismo para que el store detecte que es igual
                                                })}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer (Fijo) */}
                {items.length > 0 && (
                    <div className="p-6 bg-white border-t space-y-4 shadow-up">
                        
                        {/* INPUT DE NOMBRE */}
                        <div className="space-y-2">
                            <Label htmlFor="name">¿A nombre de quién?</Label>
                            <Input 
                                id="name" 
                                placeholder="Escribe tu nombre..." 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xl font-bold text-slate-900">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        </div>
                        
                        <Button 
                            className="w-full h-12 text-lg font-bold gap-2" 
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isProcessing || !customerName.trim()} // Deshabilitar si no hay nombre
                        >
                        {isProcessing ? "Procesando..." : "Pagar Orden"}
                        </Button>
                        
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground h-auto p-0 hover:bg-transparent cursor-pointer" onClick={clearCart}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Vaciar carrito
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}