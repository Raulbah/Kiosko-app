import { CartSheet } from "@/components/kiosk/cart-sheet";
import { KioskHeader } from "@/components/kiosk/header";
import { Toaster } from "@/components/ui/sonner";

// Importaremos el componente del Carrito Sheet más adelante cuando lo definamos
// import { CartSheet } from "@/components/kiosk/cart-sheet"; 

export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <KioskHeader />
            <main>
                {children}
                <CartSheet />
                <Toaster richColors position="top-center" />
            </main>
        </div>
    );
}