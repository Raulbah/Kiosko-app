// components/kitchen/kitchen-board.tsx
"use client";

import { useEffect, useState } from "react";
import { OrderStatus } from "@/src/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle2, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { getKitchenOrders, updateOrderStatus } from "@/lib/actions/kitchen-actions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type KitchenOrder = Awaited<ReturnType<typeof getKitchenOrders>>[0];

// RECIBIMOS EL ID COMO PROP
interface KitchenBoardProps {
    branchId: string;
}

export function KitchenBoard({ branchId }: KitchenBoardProps) {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        // YA NO USAMOS EL ID HARDCODED, USAMOS EL PROP
        const data = await getKitchenOrders(branchId);
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [branchId]); // Agregamos dependencia

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        const result = await updateOrderStatus(orderId, status);
        if (result.success) {
            toast.success(`Orden actualizada`);
            fetchOrders();
        } else {
            toast.error("Error al actualizar");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Cargando sistema de cocina...</div>;

    // ... (El resto del renderizado es IDÉNTICO a lo que tenías, cópialo tal cual)
    // Solo asegúrate de importar los iconos y componentes UI arriba.
    return (
        <div className="min-h-screen bg-slate-100 p-6">
            {/* ... TU CÓDIGO JSX DE SIEMPRE ... */}
            {/* Aquí va el header, el map de orders, etc. */}
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-orange-600" />
                Pantalla de Cocina (KDS)
                </h1>
                <Badge variant="outline" className="text-lg px-4 py-1 bg-white">
                    {orders.length} Pendientes
                </Badge>
            </header>
            
            {/* Pegar aquí el resto del return del archivo original... */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                    <CheckCircle2 className="h-20 w-20 mb-4 opacity-20" />
                    <p className="text-xl">Todo limpio, chef.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* ... tus cards ... */}
                    {orders.map((order) => (
                        <Card key={order.id} className={`border-l-8 shadow-md ${order.status === 'PENDING' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                            {/* ... contenido de la card ... */}
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-black flex flex-col">
                                            <span>#{order.id.slice(0, 5).toUpperCase()}</span>
                                            <span className="text-lg font-medium text-slate-600 truncate">
                                                {order.customerName}
                                            </span>
                                        </CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            {/* ... resto de la card ... */}
                            <CardContent className="pt-4 space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="border-b border-dashed pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-3">
                                                <span className="font-black text-lg bg-slate-200 w-8 h-8 flex items-center justify-center rounded-md shrink-0">
                                                    {item.quantity}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-lg leading-tight">{item.product.name}</p>
                                                    {/* @ts-ignore */}
                                                    {item.options?.modifiers && item.options.modifiers.length > 0 && (
                                                        <p className="text-sm text-slate-600 mt-1 font-medium">
                                                            {/* @ts-ignore */}
                                                            {item.options.modifiers.map((m: any) => m.name).join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                            <CardFooter className="pt-2 flex gap-2">
                                    {order.status === 'PENDING' && (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}>Empezar</Button>
                                    )}
                                    {order.status === 'IN_PROGRESS' && (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" onClick={() => handleStatusChange(order.id, 'READY')}>¡Listo! ✅</Button>
                                    )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}