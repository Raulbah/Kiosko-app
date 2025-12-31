import { getDashboardStats } from "@/lib/actions/dashboard-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { OverviewChart } from "@/components/admin/dashboard/overview-chart"; // Componente Cliente
import { RecentSales } from "@/components/admin/dashboard/recent-sales"; // Componente Cliente

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    if (!stats) return <div>Error cargando estadísticas</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.todaySales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% respecto a ayer (Simulado)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ordenes Hoy</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.todayCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Producto Estrella</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">{stats.topProducts[0]?.name || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">{stats.topProducts[0]?.quantity || 0} vendidos</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Gráfico (Ocupa 4 columnas) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen Semanal</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={stats.chartData} />
                    </CardContent>
                </Card>
                {/* Top Productos (Ocupa 3 columnas) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentSales products={stats.topProducts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}