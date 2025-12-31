"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
// Eliminamos ScrollArea para usar scroll nativo
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderDetailsSheetProps {
    order: any | null;
    isOpen: boolean;
    onClose: () => void;
}

export function OrderDetailsSheet({ order, isOpen, onClose }: OrderDetailsSheetProps) {
    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-slate-50 h-screen overflow-hidden">
                {/* HEADER: Fijo (No se encoge) */}
                <SheetHeader className="p-6 bg-white border-b shrink-0 shadow-sm z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="text-xl font-bold">Orden #{order.shortId}</SheetTitle>
                            <SheetDescription>
                                {format(new Date(order.createdAt), "PPP p", { locale: es })}
                            </SheetDescription>
                        </div>
                        <Badge variant="outline" className="text-base">
                            {order.status}
                        </Badge>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-muted-foreground font-medium">Cliente:</p>
                        <p className="text-lg font-semibold text-slate-800">{order.customerName}</p>
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Lista de Productos */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Productos</h3>
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-start bg-white p-4 rounded-lg shadow-sm border">
                                    <div className="flex gap-3">
                                        <span className="bg-slate-100 text-slate-600 font-bold h-6 w-6 flex items-center justify-center rounded text-xs shrink-0">
                                            {item.quantity}x
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.product.name}</p>
                                            {/* Renderizado de Opciones JSON */}
                                            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                                {/* Parsear si options es string (a veces pasa con prisma raw) o usar directo */}
                                                {(() => {
                                                    // Pequeña utilidad de renderizado seguro
                                                    const opts = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                                                    return (
                                                        <>
                                                            {opts?.size && <p>Tamaño: {opts.size}</p>}
                                                            {opts?.modifiers?.map((mod: any, idx: number) => (
                                                                <span key={idx} className="block">• {mod.name} (+${Number(mod.price).toFixed(2)})</span>
                                                            ))}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-mono font-medium text-slate-700">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* FOOTER: Fijo (No se encoge) */}
                <div className="p-6 bg-white border-t shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground">Sucursal</span>
                        <span className="font-medium">{order.branch}</span>
                    </div>
                    <Separator className="my-4"/>
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total Pagado</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}