import prisma from "@/lib/db";
import { TicketTemplate } from "@/components/print/ticket-template";

export default async function PrintOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    const rawOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
            branch: true,
            items: { include: { product: true } }
        }
    });

    if (!rawOrder) return <div>Orden no encontrada</div>;

    // --- SANITIZACIÓN PROFUNDA ---
    // Creamos objetos nuevos explícitamente para evitar que se cuelen Decimals ocultos

    // 1. Limpiar objeto Orden
    const cleanOrder = {
        id: rawOrder.id,
        shortId: rawOrder.id.slice(0, 5).toUpperCase(),
        customerName: rawOrder.customerName,
        createdAt: rawOrder.createdAt,
        total: Number(rawOrder.total), // Conversión Decimal -> Number
        status: rawOrder.status
    };

    // 2. Limpiar Items y el Producto anidado
    const cleanItems = rawOrder.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price), // Conversión Decimal -> Number (Precio al momento de venta)
        options: item.options,     // JSON es seguro
        product: {
            name: item.product.name,
            price: Number(item.product.price), // Conversión Decimal -> Number (Precio base actual)
            // Solo pasamos lo necesario para el ticket
        }
    }));

    // 3. Limpiar Branch (Sucursal)
    // Aunque Branch no suele tener Decimals, es buena práctica si tuvieras coordenadas
    const cleanBranch = {
        name: rawOrder.branch.name,
        address: rawOrder.branch.address
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            {/* Renderizamos el Ticket */}
            <div className="bg-white shadow-xl">
                <TicketTemplate 
                    order={cleanOrder} 
                    branch={cleanBranch} 
                    items={cleanItems} 
                />
            </div>

            {/* Botones de acción (No salen en el papel) */}
            <div className="mt-8 flex gap-4 no-print">
                <button 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
                    id="print-btn"
                >
                    🖨️ Imprimir Ticket
                </button>
                <button 
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-600 transition-all cursor-pointer"
                    id="close-btn"
                >
                    Cerrar Ventana
                </button>
            </div>

            {/* Script de Auto-Impresión */}
            <script dangerouslySetInnerHTML={{__html: `
                // Asignar eventos de forma segura
                const printBtn = document.getElementById('print-btn');
                if(printBtn) printBtn.onclick = () => window.print();
                
                const closeBtn = document.getElementById('close-btn');
                if(closeBtn) closeBtn.onclick = () => window.close();
                
                // Auto-imprimir al cargar
                window.onload = function() { 
                    setTimeout(() => window.print(), 500); 
                }
            `}} />
        </div>
    );
}