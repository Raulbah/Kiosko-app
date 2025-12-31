"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ShoppingBag, Minus, Plus, CreditCard } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// Eliminamos ScrollArea para usar scroll nativo más robusto en layout flex
import { useCartStore } from "./store/cart-store";
import { placeOrderAction } from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CartSheet() {
    const { items, isOpen, toggleCart, removeItem, decreaseItem, addItem, clearCart, total } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerName, setCustomerName] = useState("");

    const cartTotal = total();

    const handleCheckout = async () => {
        if (!customerName.trim()) {
            toast.warning("Por favor, ingresa tu nombre.");
            return;
        }
        setIsProcessing(true);

        try {
            // 1. Preparar items (Tu lógica actual...)
            const orderItems = items.map(item => {
                const modifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
                const unitPrice = item.basePrice + modifiersTotal;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    basePrice: item.basePrice,
                    priceWithModifiers: unitPrice,
                    name: item.name,
                    details: { modifiers: item.selectedModifiers }
                };
            });

            // 2. Crear Orden
            const result = await placeOrderAction(orderItems, cartTotal, customerName);

            if (result.success) {
                toast.success("¡Orden Enviada!");
                
                // 3. LIMPIEZA
                clearCart();
                setCustomerName("");
                toggleCart(); // Cerrar el sheet

                // 4. ABRIR VENTANA DE IMPRESIÓN (NUEVO)
                // Usamos setTimeout para asegurar que el toast se vea y no bloquee el hilo UI
                setTimeout(() => {
                    const width = 400;
                    const height = 600;
                    const left = (window.screen.width / 2) - (width / 2);
                    const top = (window.screen.height / 2) - (height / 2);
                    
                    window.open(
                        `/print/order/${result.orderId}`, 
                        'Imprimir Ticket', 
                        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
                    );
                }, 500);

            } else {
                toast.error("Error", { description: result.message });
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-slate-50 h-full">
                {/* HEADER: Fijo arriba (shrink-0 evita que se aplaste) */}
                <SheetHeader className="p-6 bg-white border-b shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <ShoppingBag className="h-5 w-5 text-primary" />Tu Pedido
                        <span className="ml-auto text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">
                            {items.length} items
                        </span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">Resumen de productos</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-4">
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
                                            <div className="relative h-16 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                {item.imageUrl ? (
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                                                {item.selectedModifiers.length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {item.selectedModifiers.map(m => m.name).join(", ")}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="font-bold text-primary text-sm">${(unitPrice * item.quantity).toFixed(2)}</p>
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-0.5 border">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md cursor-pointer" onClick={() => decreaseItem(item.cartItemId)}><Minus className="h-3 w-3" /></Button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md cursor-pointer" onClick={() => addItem({ ...item })}><Plus className="h-3 w-3" /></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                {/* FOOTER: Fijo abajo (shrink-0) */}
                {items.length > 0 && (
                    <div className="p-6 bg-white border-t space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
                        <div className="space-y-2">
                            <Label htmlFor="customer-name">¿Nombre del Cliente?</Label>
                            <Input 
                                id="customer-name" 
                                placeholder="Nombre del cliente..." 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full h-12 text-lg font-bold gap-2 cursor-pointer" 
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Procesando..." : ( <> <CreditCard className="h-5 w-5" /> Crear Pedido </> )}
                        </Button>
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground h-auto p-2 hover:text-red-600 cursor-pointer" onClick={clearCart}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Vaciar carrito
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}