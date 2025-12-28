// app/kitchen/page.tsx
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { BranchSelector } from "@/components/kiosk/branch-selector";
import { KitchenBoard } from "@/components/kitchen/kitchen-board"; // El componente que acabamos de crear

export const dynamic = 'force-dynamic'; // Importante para que no cachee las cookies

export default async function KitchenPageEntry() {
    const cookieStore = await cookies();
    const branchId = cookieStore.get("kiosk_branch_id")?.value;

    // Si NO hay sucursal seleccionada, mostramos el selector
    if (!branchId) {
        const branches = await prisma.branch.findMany({ 
            select: { id: true, name: true },
            where: { isActive: true } 
        });

        return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4 text-slate-800">Configuración de Pantalla</h1>
                <p className="mb-8 text-slate-600">Selecciona la sucursal para este dispositivo</p>
                {/* Reutilizamos el selector existente */}
                <BranchSelector branches={branches} />
            </div>
        </div>
        );
    }

    // Si SÍ hay sucursal, cargamos la pizarra pasándole el ID
    return <KitchenBoard branchId={branchId} />;
}