import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { OrderColumn } from "@/components/admin/orders/columns";

export default async function OrdersPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // 1. Verificar Permisos
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: { include: { permissions: { include: { module: true } } } } }
    });

    if (!user) redirect("/login");

    const permission = user.role.permissions.find(p => p.module.slug === "orders");
    
    if (!permission || !permission.canRead) {
        return <div className="p-8 text-center text-red-500">No tienes acceso a este módulo.</div>;
    }
    // 2. Obtener Datos
    // Traemos todo lo necesario para mostrar en la tabla y en el Sheet de detalles
    const orders = await prisma.order.findMany({
        include: {
            branch: true,
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: "desc" } // Las más recientes primero
    });

    // 3. Sanitización de Datos (Decimal -> Number)
    // Esto evita el error: "Only plain objects can be passed to Client Components"
    const formattedOrders: OrderColumn[] = orders.map(order => {
        
        // Objeto limpio para el Sheet de detalles (convertimos precios unitarios)
        const cleanOrderForSheet = {
            ...order,
            total: Number(order.total),
            branch: order.branch.name,
            items: order.items.map(item => ({
                ...item,
                price: Number(item.price), // Conversión de precio item
                product: {
                    ...item.product,
                    price: Number(item.product.price) // Conversión de precio producto base
                }
            }))
        };

        // Objeto plano para la Tabla (Row Data)
        return {
            id: order.id,
            shortId: order.id.slice(0, 5).toUpperCase(),
            customerName: order.customerName,
            total: Number(order.total), // Conversión Total
            status: order.status,
            createdAt: order.createdAt,
            branch: order.branch.name,
            itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
            originalOrder: cleanOrderForSheet
        };
    });

    return (
        <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Historial de Órdenes</h1>
            <div className="text-sm text-muted-foreground">
                Total: <b>{orders.length}</b> registros
            </div>
        </div>

        <OrdersTable 
            data={formattedOrders} 
            permissions={{
                canUpdate: permission.canUpdate // Solo pasamos update ya que orders no se suelen "borrar" físicamente
            }} 
        />
        </div>
    );
}