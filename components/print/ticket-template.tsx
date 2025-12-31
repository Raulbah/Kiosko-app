"use client"; // <--- 1. ESTO ES OBLIGATORIO PARA USAR <style jsx>

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TicketProps {
    order: any;
    branch: any;
    items: any[];
}

export function TicketTemplate({ order, branch, items }: TicketProps) {
    return (
        <div className="w-75 bg-white text-black p-2 font-mono text-xs leading-tight">
            {/* Estilos de impresión */}
            <style jsx global>{`
                @media print {
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 0; }
                .no-print { display: none !important; }
                }
            `}</style>

            {/* --- HEADER --- */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">{branch.name}</h1>
                <p className="text-[10px] text-gray-600 mt-1">{branch.address}</p>
                <div className="border-b-2 border-black border-dashed my-2" />
                <div className="flex justify-between">
                    <span>Folio:</span>
                    <span className="font-bold">#{order.shortId}</span>
                </div>
                <div className="flex justify-between">
                    <span>Fecha:</span>
                    {/* Aseguramos que la fecha sea un objeto Date válido */}
                    <span>{format(new Date(order.createdAt), "dd/MM/yy HH:mm", { locale: es })}</span>
                </div>
                <div className="text-left mt-1">
                    Cliente: <span className="font-bold uppercase">{order.customerName}</span>
                </div>
            </div>

            {/* --- ITEMS --- */}
            <div className="border-b-2 border-black border-dashed mb-2" />
            <div className="space-y-3">
                {items.map((item: any, i: number) => {
                    const opts = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                    
                    return (
                        <div key={i}>
                            <div className="flex justify-between font-bold text-sm">
                                <span>{item.quantity} x {item.product.name}</span>
                                <span>${Number(item.price).toFixed(2)}</span>
                            </div>
                            
                            {(opts?.size || opts?.modifiers?.length > 0) && (
                                <div className="pl-2 text-[10px] text-gray-600">
                                    {opts.size && <p>• Talla: {opts.size}</p>}
                                    {opts.modifiers?.map((mod: any, idx: number) => (
                                        <p key={idx}>+ {mod.name}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- TOTALES --- */}
            <div className="border-b-2 border-black border-dashed my-2" />
            <div className="flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>${Number(order.total).toFixed(2)}</span>
            </div>
            
            <div className="text-center mt-6 mb-8">
                <p>¡Gracias por su compra!</p>
                <p className="text-[10px] mt-1">Vuelva pronto</p>
            </div>
        </div>
    );
}