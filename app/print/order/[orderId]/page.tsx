import prisma from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function TicketPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } }, branch: true }
    });

    if (!order) return <div>Orden no encontrada</div>;

    return (
        <div className="max-w-75 mx-auto p-4 bg-white text-black font-mono text-xs">
            {/* CSS para ocultar botones al imprimir */}
            <style>{`
                @media print { 
                    .no-print { display: none; } 
                    body { margin: 0; padding: 0; }
                }
            `}</style>

            <div className="text-center mb-4">
                <h2 className="text-lg font-bold uppercase">{order.branch.name}</h2>
                <p>{order.branch.address}</p>
                <p className="mt-2">Folio: <b>#{order.id.slice(0, 5).toUpperCase()}</b></p>
                <p>{format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                <p>Cliente: {order.customerName}</p>
            </div>

            <hr className="border-black border-dashed my-2" />

            <div className="space-y-2">
                {order.items.map((item) => {
                    const opts: any = item.options; // Parsear si es necesario
                    return (
                        <div key={item.id}>
                            <div className="flex justify-between font-bold">
                                <span>{item.quantity} x {item.product.name}</span>
                                <span>${Number(item.price).toFixed(2)}</span>
                            </div>
                            {/* Detalles */}
                            {(opts?.size || opts?.modifiers?.length > 0) && (
                                <div className="pl-4 text-[10px]">
                                    {opts.size && <p>Talla: {opts.size}</p>}
                                    {opts.modifiers?.map((m: any, i: number) => (
                                        <p key={i}>+ {m.name}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr className="border-black border-dashed my-2" />

            <div className="flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>${Number(order.total).toFixed(2)}</span>
            </div>

            <div className="text-center mt-6">
                <p>¡Gracias por su compra!</p>
            </div>

            {/* Botón flotante para imprimir */}
            <button 
                onClick={() => window.print()} 
                className="no-print fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg font-sans font-bold cursor-pointer"
            >
                🖨️ Imprimir
            </button>

            {/* Script para auto-imprimir al cargar (opcional) */}
            <script dangerouslySetInnerHTML={{__html: 'window.onload = function() { window.print(); }'}} />
        </div>
    );
}