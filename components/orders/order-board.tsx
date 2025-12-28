// components/orders/order-board.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrderBoard } from "@/lib/actions/kitchen-actions";
import { Badge } from "@/components/ui/badge";

// Props para recibir ID
interface OrderBoardProps {
    branchId: string;
}

type OrderBoardItem = Awaited<ReturnType<typeof getOrderBoard>>[0];

export function OrderBoard({ branchId }: OrderBoardProps) {
    const [orders, setOrders] = useState<OrderBoardItem[]>([]);
    
    const fetchBoard = async () => {
        // USAMOS EL PROP
        const data = await getOrderBoard(branchId);
        setOrders(data);
    };

    useEffect(() => {
        fetchBoard();
        const interval = setInterval(fetchBoard, 5000); 
        return () => clearInterval(interval);
    }, [branchId]);

    const preparing = orders.filter(o => o.status === 'IN_PROGRESS');
    const ready = orders.filter(o => o.status === 'READY');

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* ... TU JSX ORIGINAL AQUÍ (Header, Columnas, etc) ... */}
            {/* Asegúrate de copiar todo el contenido del return original */}
            <header className="bg-slate-800 p-6 shadow-xl border-b border-slate-700 text-center">
                <h1 className="text-4xl font-black tracking-widest uppercase text-white">Estado de Ordenes</h1>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="w-1/2 border-r border-slate-700 p-8 flex flex-col">
                    <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400 uppercase tracking-wider flex items-center justify-center gap-3">
                        <span className="animate-pulse">●</span> Preparando
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto content-start">
                        {preparing.map(order => (
                            <div key={order.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
                                <span className="block text-5xl font-black text-slate-300">
                                    #{order.id.slice(0, 5).toUpperCase()}
                                </span>
                                <p className="text-xl font-bold text-white mt-1 truncate px-2">{order.customerName}</p>
                                <p className="text-slate-500 mt-2 text-sm uppercase">En cocina</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-1/2 p-8 bg-green-900/10 flex flex-col">
                    <h2 className="text-3xl font-bold mb-8 text-center text-green-400 uppercase tracking-wider">
                        Listo para recoger
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto content-start">
                        {ready.map(order => (
                            <div key={order.id} className="bg-green-600 rounded-xl p-8 shadow-[0_0_30px_rgba(34,197,94,0.3)] text-center transform scale-100 animate-in zoom-in duration-300">
                                <span className="block text-6xl font-black text-white drop-shadow-md">
                                    #{order.id.slice(0, 5).toUpperCase()}
                                </span>
                                <p className="text-2xl font-bold text-white mt-2 truncate px-2">{order.customerName}</p>
                                <div className="mt-4 flex justify-center">
                                    <Badge className="bg-white text-green-700 text-lg px-4 hover:bg-white">
                                        ¡Recoger aquí!
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}