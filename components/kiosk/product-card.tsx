"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "./store/cart-store";
import { useState, useMemo } from "react";
import { ProductCustomizer, ProductWithModifiers } from "./product-customizer";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps extends ProductWithModifiers {
    // Hereda las propiedades (id, name, price, modifierGroups, etc.)
}

export default function ProductCard(product: ProductCardProps) {
    const { items, addItem, decreaseItem } = useCartStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Detectar si es producto complejo
    const hasModifiers = (product.modifierGroups && product.modifierGroups.length > 0) || (product.sizes && product.sizes.length > 0);


    // 2. Calcular cantidad actual en carrito (Suma de todas las variantes de este ID)
    const productInCart = useMemo(() => {
        return items.filter((item) => item.productId === product.id);
    }, [items, product.id]);

    const totalQuantity = productInCart.reduce((acc, item) => acc + item.quantity, 0);

    // 3. Manejadores de Acción
    const handleAddClick = () => {
        if (hasModifiers) {
            setIsModalOpen(true);
        } else {
            // Producto Simple: Agregar directo
            addItem({
                productId: product.id,
                name: product.name,
                basePrice: product.price,
                imageUrl: product.imageUrl,
                selectedModifiers: [], 
            });
        }
    };

    const handleDecreaseClick = () => {
        // Solo para productos simples. Buscamos el item en el carrito (debe haber solo 1 tipo)
        if (!hasModifiers && productInCart.length > 0) {
            // Usamos el cartItemId de la primera coincidencia
            decreaseItem(productInCart[0].cartItemId);
        }
    };

    return (
        <>
            <div className="border rounded-xl p-4 shadow-sm bg-white flex flex-col h-full hover:shadow-md transition-shadow relative">
                
                {/* Badge de Cantidad (Solo visual para Complejos, Funcional para Simples) */}
                {totalQuantity > 0 && hasModifiers && (
                    <Badge className="absolute top-2 right-2 z-10 bg-primary text-white">
                        {totalQuantity} en carrito
                    </Badge>
                )}

                <div className="relative w-full h-40 mb-4 bg-gray-100 rounded-md overflow-hidden">
                    {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sin Imagen</div>
                    )}
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 leading-tight">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 grow mt-1">{product.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-xl text-primary">${product.price.toFixed(2)}</span>
                    
                    {/* Lógica de Botones */}
                    {totalQuantity > 0 && !hasModifiers ? (
                        // CASO 1: Producto Simple con items en carrito -> Mostrar [ - 1 + ]
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white shadow-sm cursor-pointer" onClick={handleDecreaseClick}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-6 text-center text-sm">{totalQuantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white shadow-sm cursor-pointer" onClick={handleAddClick}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        // CASO 2: Producto Nuevo O Producto Complejo (Siempre botón +)
                        <Button size="icon" onClick={handleAddClick} className={`cursor-pointer ${hasModifiers ? "bg-slate-800 hover:bg-slate-700" : ""}`}>
                            <Plus className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal Renderizado Condicionalmente */}
            {hasModifiers && (
                <ProductCustomizer 
                    product={product} 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    );
}