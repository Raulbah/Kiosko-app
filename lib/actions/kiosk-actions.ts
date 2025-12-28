"use server";

import { cookies } from "next/headers";

export async function setBranchCookie(branchId: string) {
    const cookieStore = await cookies();
    
    cookieStore.set("kiosk_branch_id", branchId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, 
    });

    // NO hacemos redirect aquí. Retornamos void o success.
    return { success: true };
}

export async function resetBranchCookie() {
    const cookieStore = await cookies();
    
    // Borrar la cookie
    cookieStore.delete("kiosk_branch_id");
    
    // Recargar para disparar el modal nuevamente
    return { success: true };
}