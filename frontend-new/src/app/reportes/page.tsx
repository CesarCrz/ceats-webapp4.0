"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

        {/* Placeholder for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Gráficos de Ventas</span>
              </CardTitle>
              <CardDescription>Los gráficos detallados estarán disponibles pronto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Gráficos en desarrollo</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Tendencias</span>
              </CardTitle>
              <CardDescription>Análisis de tendencias próximamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Tendencias en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
