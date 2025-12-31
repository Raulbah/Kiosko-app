import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductSale {
    name: string | undefined;
    quantity: number;
  // Si en el futuro agregas la imagen del producto al query del dashboard, añádela aquí
  // image?: string | null; 
}

interface RecentSalesProps {
    products: ProductSale[];
}

export function RecentSales({ products }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {products.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                    No hay suficientes datos de ventas aún.
                </div>
            ) : (
                products.map((product, index) => (
                    <div key={index} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            {/* Si tuvieras imagen del producto, usarías AvatarImage aquí */}
                            {/* <AvatarImage src={product.image} alt="Product" /> */}
                            <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                                {product.name?.substring(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none truncate max-w-37.5 sm:max-w-50">
                                {product.name || "Producto desconocido"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Producto Top #{index + 1}
                            </p>
                        </div>
                        <div className="ml-auto font-medium">+{product.quantity} vendidos</div>
                    </div>
                ))
            )}
        </div>
    );
}