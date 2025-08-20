"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Users,
  Star,
  Download,
  ArrowLeft,
  BarChart3,
  Activity,
} from "lucide-react"
import Link from "next/link"

const salesData = [
  { name: "Lun", ventas: 4200, pedidos: 24 },
  { name: "Mar", ventas: 3800, pedidos: 22 },
  { name: "Mié", ventas: 5100, pedidos: 31 },
  { name: "Jue", ventas: 4600, pedidos: 28 },
  { name: "Vie", ventas: 6200, pedidos: 38 },
  { name: "Sáb", ventas: 7800, pedidos: 45 },
  { name: "Dom", ventas: 6900, pedidos: 41 },
]

const monthlyData = [
  { month: "Ene", ventas: 125000, pedidos: 720 },
  { month: "Feb", ventas: 132000, pedidos: 780 },
  { month: "Mar", ventas: 148000, pedidos: 850 },
  { month: "Abr", ventas: 156000, pedidos: 920 },
  { month: "May", ventas: 162000, pedidos: 980 },
  { month: "Jun", ventas: 178000, pedidos: 1050 },
]

const sucursalData = [
  { name: "Centro", value: 35, ventas: 62000, color: "#3b82f6" },
  { name: "Norte", value: 28, ventas: 49000, color: "#10b981" },
  { name: "Sur", value: 22, ventas: 38000, color: "#f59e0b" },
  { name: "Oeste", value: 15, ventas: 29000, color: "#ef4444" },
]

const topProducts = [
  { name: "Sushi Mar y Tierra", ventas: 245, ingresos: 53550 },
  { name: "Tacos de Pescado", ventas: 198, ingresos: 31680 },
  { name: "Hamburguesa Clásica", ventas: 167, ingresos: 41750 },
  { name: "Ensalada César", ventas: 134, ingresos: 24120 },
  { name: "Combo Especial", ventas: 89, ingresos: 60520 },
]

export default function ReportesPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Reportes y Estadísticas
                </h1>
                <p className="text-xs text-muted-foreground">Análisis detallado del rendimiento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="glass hover:glass-strong cursor-pointer bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$178,420</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+12.5%</span>
                <span>vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+8.2%</span>
                <span>vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16 min</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <span className="text-green-600">-2 min</span>
                <span>vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+0.3</span>
                <span>vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Ventas por Día</span>
              </CardTitle>
              <CardDescription>Rendimiento de ventas en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Tendencia Mensual</span>
              </CardTitle>
              <CardDescription>Evolución de ventas en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="ventas"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sucursales Performance */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle>Rendimiento por Sucursal</CardTitle>
              <CardDescription>Distribución de ventas por ubicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sucursalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sucursalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {sucursalData.map((sucursal) => (
                  <div key={sucursal.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sucursal.color }}></div>
                      <span className="text-sm font-medium">{sucursal.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">${sucursal.ventas.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="glass-strong lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 5 productos por volumen de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.ventas} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">${product.ingresos.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">ingresos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="glass hover:glass-strong transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Cancelados</CardTitle>
              <Badge variant="destructive">3.2%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">de 1,247 pedidos totales</p>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$143</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+$12</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+67</span> nuevos este mes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
