// components/kiosk/store/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

export interface CartModifier {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    cartItemId: string; // ID único en el carrito (frontend only)
    productId: string;  // ID real del producto
    name: string;
    basePrice: number;
    selectedModifiers: CartModifier[];
    quantity: number;
    imageUrl?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Omit<CartItem, 'cartItemId' | 'quantity'>) => void;
    removeItem: (cartItemId: string) => void;
    decreaseItem: (cartItemId: string) => void;
    toggleCart: () => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            addItem: (newItem) => set((state) => {
                // Buscamos si existe EXACTAMENTE el mismo producto con los mismos modificadores
                const modifiersKey = JSON.stringify(newItem.selectedModifiers.sort((a,b) => a.id.localeCompare(b.id)));
                
                const existingItemIndex = state.items.findIndex(item => {
                    const itemModifiersKey = JSON.stringify(item.selectedModifiers.sort((a,b) => a.id.localeCompare(b.id)));
                    return item.productId === newItem.productId && itemModifiersKey === modifiersKey;
                });

                if (existingItemIndex > -1) {
                    // Si es idéntico, aumentamos cantidad
                    const updatedItems = [...state.items];
                    updatedItems[existingItemIndex].quantity += 1;
                    return { items: updatedItems };
                }

                // Si es nuevo o tiene diferentes toppings, agregamos nueva línea
                return { 
                    items: [...state.items, { ...newItem, quantity: 1, cartItemId: uuidv4() }] 
                };
            }),

            decreaseItem: (cartItemId) => set((state) => {
                // Lógica similar usando cartItemId...
                const existing = state.items.find((i) => i.cartItemId === cartItemId);
                if (existing && existing.quantity > 1) {
                    return {
                        items: state.items.map((i) =>
                            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
                        ),
                    };
                }
                return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
            }),

            removeItem: (cartItemId) => set((state) => ({
                items: state.items.filter((i) => i.cartItemId !== cartItemId),
            })),

            clearCart: () => set({ items: [] }),

            total: () => get().items.reduce((acc, item) => {
                const modifiersTotal = item.selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
                return acc + ((item.basePrice + modifiersTotal) * item.quantity);
            }, 0)
        }),
        { name: 'kiosk-cart-v2' }
    )
);