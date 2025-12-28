// app/orders/page.tsx
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { BranchSelector } from "@/components/kiosk/branch-selector";
import { OrderBoard } from "@/components/orders/order-board"; // Componente nuevo

export const dynamic = 'force-dynamic';

export default async function OrdersPageEntry() {
    const cookieStore = await cookies();
    const branchId = cookieStore.get("kiosk_branch_id")?.value;

    if (!branchId) {
        const branches = await prisma.branch.findMany({ 
            select: { id: true, name: true },
            where: { isActive: true } 
        });

        return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700">
                <h1 className="text-2xl font-bold mb-4">Configuración de Pantalla</h1>
                <p className="mb-8 text-slate-400">Selecciona la sucursal para este monitor</p>
                {/* El selector funciona igual, solo que en un contenedor oscuro se verá bien el modal */}
                <BranchSelector branches={branches} />
            </div>
        </div>
        );
    }

    return <OrderBoard branchId={branchId} />;
}