import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    Box, 
    Store, 
    ShoppingCart, 
    ChefHat, 
    Settings,
    Package,
    FileText
} from "lucide-react";

export const IconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    users: Users,
    roles: ShieldCheck,
    products: Box,
    categories: Package,
    branches: Store,
    orders: ShoppingCart,
    kitchen: ChefHat,
    // Fallback icon
    default: FileText
};

export function getIcon(slug: string) {
    return IconMap[slug] || IconMap.default;
}