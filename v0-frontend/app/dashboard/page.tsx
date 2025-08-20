"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderCard } from "@/components/order-card"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { CancelOrderModal } from "@/components/cancel-order-modal"
import {
  ChefHat,
  Clock,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  Package,
  History,
  BarChart3,
  Plus,
  Users,
  Building,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockOrderItems = [
  { name: "Sushi Mar y Tierra", quantity: 2, price: 218 },
  { name: "Sushi culichi", quantity: 2, price: 200 },
]

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    sessionStorage.clear()
    router.push("/login")
  }

  const handleNavigateToHistorial = () => {
    router.push("/historial")
  }

  const handleNavigateToReportes = () => {
    router.push("/reportes")
  }

  const handleNavigateToConfiguracion = () => {
    router.push("/configuracion")
  }

  const handleNavigateToAddUser = () => {
    router.push("/usuarios")
  }

  const handleNavigateToAddSucursal = () => {
    router.push("/sucursales")
  }

  const [preparingOrders, setPreparingOrders] = useState([
    {
      id: "SORU3545805052395974",
      customer: "César",
      restaurant: "TESORO",
      time: "15 min",
      items: 3,
      total: 450,
      status: "new" as const, // New orders (green, show "Aceptar Pedido")
      isNew: true,
      itemsList: mockOrderItems,
      comments: "Sin camarón por favor y tierra con pura tierra",
      subtotal: 418,
    },
    {
      id: "SORU1613673736258049",
      customer: "María González",
      restaurant: "TESORO",
      time: "20 min",
      items: 2,
      total: 320,
      status: "preparing" as const, // Accepted orders (show "Listo" and "Cancelar")
      itemsList: [{ name: "Tacos de Pescado", quantity: 3, price: 320 }],
      subtotal: 320,
    },
  ])

  const [readyOrders, setReadyOrders] = useState([
    {
      id: "SORU6554580636827709",
      customer: "Mel",
      restaurant: "ITESO",
      time: "5 min",
      items: 4,
      total: 680,
      status: "ready" as const, // Ready orders (show "Entregar" and option for "Cancelado por Cliente")
      itemsList: [{ name: "Combo Especial", quantity: 1, price: 680 }],
      subtotal: 680,
    },
    {
      id: "SORU1098615288392909",
      customer: "Ana López",
      restaurant: "TESORO",
      time: "2 min",
      items: 1,
      total: 180,
      status: "ready" as const,
      itemsList: [{ name: "Ensalada César", quantity: 1, price: 180 }],
      subtotal: 180,
    },
  ])

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState("")

  const handleOrderClick = (order: any) => {
    setSelectedOrder({
      ...order,
      items: order.itemsList,
    })
    setShowOrderDetail(true)
  }

  const handleAcceptOrder = (orderId: string) => {
    console.log("Accepting order:", orderId)
    setPreparingOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "preparing" as const, isNew: false } : order)),
    )
  }

  const handleMarkReady = (orderId: string) => {
    console.log("Marking order as ready:", orderId)
    const orderToMove = preparingOrders.find((order) => order.id === orderId)
    if (orderToMove) {
      setReadyOrders((prev) => [...prev, { ...orderToMove, status: "ready" as const }])
      setPreparingOrders((prev) => prev.filter((order) => order.id !== orderId))
    }
  }

  const handleDeliverOrder = (orderId: string) => {
    console.log("Delivering order:", orderId)
    setReadyOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId)
    setShowOrderDetail(false)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = (reason: string) => {
    console.log("Canceling order:", orderToCancel, "Reason:", reason)
    // Remove from both preparing and ready orders
    setPreparingOrders((prev) => prev.filter((order) => order.id !== orderToCancel))
    setReadyOrders((prev) => prev.filter((order) => order.id !== orderToCancel))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">🍽️ Soru Restaurant - Administrador</h1>
                <p className="text-xs text-white/80">Sistema de Gestión cEats v2</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-white hover:bg-white/20 cursor-pointer"
                    title="Agregar"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-strong border-white/20" align="end">
                  <DropdownMenuItem onClick={handleNavigateToAddUser} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Agregar Usuario
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNavigateToAddSucursal} className="cursor-pointer">
                    <Building className="w-4 h-4 mr-2" />
                    Agregar Sucursal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToHistorial}
                className="relative text-white hover:bg-white/20 cursor-pointer"
                title="Historial"
              >
                <History className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToReportes}
                className="relative text-white hover:bg-white/20 cursor-pointer"
                title="Estadísticas y Reportes"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white hover:bg-white/20 cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToConfiguracion}
                className="text-white hover:bg-white/20 cursor-pointer"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/20 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">📋 Pedidos Activos</h2>
                <p className="text-muted-foreground">Gestiona los pedidos en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToReportes}
                className="text-primary hover:bg-primary/10 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Estadísticas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToHistorial}
                className="text-primary hover:bg-primary/10 cursor-pointer"
              >
                <History className="w-4 h-4 mr-2" />
                Historial
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* En Preparación */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">🔄 En Preparación</h3>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                  {preparingOrders.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {preparingOrders.length === 0 ? (
                  <Card className="glass-strong p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No hay pedidos en preparación</p>
                    <p className="text-sm text-muted-foreground mt-1">Los pedidos aceptados aparecerán aquí</p>
                  </Card>
                ) : (
                  preparingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={() => handleOrderClick(order)} />
                  ))
                )}
              </div>
            </div>

            {/* Listo */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">✅ Listo</h3>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                  {readyOrders.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {readyOrders.length === 0 ? (
                  <Card className="glass-strong p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No hay pedidos listos</p>
                    <p className="text-sm text-muted-foreground mt-1">Los pedidos completados aparecerán aquí</p>
                  </Card>
                ) : (
                  readyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={() => handleOrderClick(order)} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        onAcceptOrder={handleAcceptOrder}
        onMarkReady={handleMarkReady}
        onDeliverOrder={handleDeliverOrder}
        onCancelOrder={handleCancelOrder}
      />

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        orderId={orderToCancel}
      />
    </div>
  )
}
