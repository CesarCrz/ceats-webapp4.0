"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { History, ArrowLeft, Search, Filter, Download, Calendar } from "lucide-react"
import Link from "next/link"

export default function HistorialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("7d")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const [historicalOrders] = useState([
    {
      id: "SORU3545805052395974",
      customer: "César",
      restaurant: "TESORO",
      time: "Completado",
      items: 3,
      total: 450,
      status: "completed" as const,
      date: "2024-01-15",
      itemsList: [
        { name: "Sushi Mar y Tierra", quantity: 2, price: 218 },
        { name: "Sushi culichi", quantity: 2, price: 200 },
      ],
      comments: "Sin camarón por favor y tierra con pura tierra",
      subtotal: 418,
    },
    {
      id: "SORU1613673736258049",
      customer: "María González",
      restaurant: "TESORO",
      time: "Completado",
      items: 2,
      total: 320,
      status: "completed" as const,
      date: "2024-01-15",
      itemsList: [{ name: "Tacos de Pescado", quantity: 3, price: 320 }],
      subtotal: 320,
    },
    {
      id: "SORU6554580636827709",
      customer: "Mel",
      restaurant: "ITESO",
      time: "Cancelado",
      items: 4,
      total: 680,
      status: "cancelled" as const,
      date: "2024-01-14",
      itemsList: [{ name: "Combo Especial", quantity: 1, price: 680 }],
      subtotal: 680,
      cancelReason: "Cliente no disponible para entrega",
    },
    {
      id: "SORU1098615288392909",
      customer: "Ana López",
      restaurant: "TESORO",
      time: "Completado",
      items: 1,
      total: 180,
      status: "completed" as const,
      date: "2024-01-14",
      itemsList: [{ name: "Ensalada César", quantity: 1, price: 180 }],
      subtotal: 180,
    },
    {
      id: "SORU3812803212345111",
      customer: "Carlos Ruiz",
      restaurant: "TESORO",
      time: "Completado",
      items: 2,
      total: 250,
      status: "completed" as const,
      date: "2024-01-13",
      itemsList: [{ name: "Hamburguesa Clásica", quantity: 2, price: 250 }],
      subtotal: 250,
    },
  ])

  const handleOrderClick = (order: any) => {
    setSelectedOrder({
      ...order,
      items: order.itemsList,
    })
    setShowOrderDetail(true)
  }

  const filteredOrders = historicalOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

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
                <History className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Historial de Pedidos
                </h1>
                <p className="text-xs text-muted-foreground">Consulta todos los pedidos anteriores</p>
              </div>
            </div>
            <Button variant="outline" className="glass hover:glass-strong cursor-pointer bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por ID, cliente o sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 glass">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32 glass">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong">
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historicalOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {historicalOrders.filter((o) => o.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {historicalOrders.filter((o) => o.status === "cancelled").length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Total</CardTitle>
              <span className="text-xs text-green-600">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${historicalOrders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Pedidos Anteriores</CardTitle>
            <CardDescription>Historial completo de todos los pedidos procesados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 glass rounded-lg hover:glass-strong transition-all duration-300 space-y-4 lg:space-y-0 cursor-pointer"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="font-bold text-primary text-lg">{order.id}</div>
                      <Badge className={`${getStatusColor(order.status)} border`}>{getStatusText(order.status)}</Badge>
                      <span className="text-sm text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        {order.items} productos • ${order.total}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary/10 cursor-pointer bg-transparent"
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron pedidos</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay pedidos en el historial"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderDetailModal order={selectedOrder} isOpen={showOrderDetail} onClose={() => setShowOrderDetail(false)} />
    </div>
  )
}
