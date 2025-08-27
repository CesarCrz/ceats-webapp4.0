"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { History, ArrowLeft, Search, Filter, Download, Calendar, Loader2, Package, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { apiClient, Pedido } from "@/lib/api"

export default function HistorialPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("7d")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (user) {
      loadPedidos()
    }
  }, [user])

  const loadPedidos = async () => {
    try {
      setIsLoading(true)
      setError("")
      let pedidosData: Pedido[]
      
      if (user?.role === 'admin') {
        // Admin ve todos los pedidos del restaurante
        pedidosData = await apiClient.getAllPedidos()
      } else if (user?.sucursal_id) {
        // Usuario de sucursal ve solo sus pedidos
        pedidosData = await apiClient.getPedidosSucursal(user.sucursal_id)
      } else {
        pedidosData = []
      }
      
      setPedidos(pedidosData)
    } catch (error) {
      console.error('Error cargando pedidos:', error)
      setError('Error cargando historial de pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderClick = (order: any) => {
    setSelectedOrder({
      ...order,
      items: order.pedido ? JSON.parse(order.pedido) : [],
    })
    setShowOrderDetail(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
      case 'listo':
        return "bg-green-100 text-green-700 border-green-200"
      case 'cancelado':
        return "bg-red-100 text-red-700 border-red-200"
      case 'preparando':
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case 'pendiente':
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
      case 'listo':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelado':
        return <XCircle className="w-4 h-4" />
      case 'preparando':
        return <Clock className="w-4 h-4" />
      case 'pendiente':
        return <Package className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch = 
      pedido.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.deliver_or_rest.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || 
      pedido.estado.toLowerCase() === statusFilter.toLowerCase()

    // Filtrar por fecha (implementación básica)
    const matchesDate = true // TODO: Implementar filtro de fecha

    return matchesSearch && matchesStatus && matchesDate
  })

  const exportToCSV = () => {
    const headers = ['Código', 'Cliente', 'Estado', 'Total', 'Tipo', 'Fecha']
    const csvContent = [
      headers.join(','),
      ...filteredPedidos.map(pedido => [
        pedido.codigo,
        pedido.nombre,
        pedido.estado,
        pedido.total,
        pedido.deliver_or_rest,
        new Date(pedido.fecha_creacion).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial_pedidos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
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
                <p className="text-xs text-muted-foreground">Revisa el historial completo de pedidos</p>
              </div>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="glass hover:glass-strong cursor-pointer bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidos.length}</div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {pedidos.filter(p => p.estado.toLowerCase() === 'completado' || p.estado.toLowerCase() === 'listo').length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pedidos.filter(p => p.estado.toLowerCase() === 'cancelado').length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pedidos.filter(p => p.estado.toLowerCase() === 'preparando' || p.estado.toLowerCase() === 'pendiente').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por código, cliente o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 glass">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="preparando">Preparando</SelectItem>
              <SelectItem value="listo">Listo</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 glass">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong">
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando historial...</p>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay pedidos</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? 'No se encontraron pedidos con esos filtros.' : 'Aún no hay pedidos en el historial.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPedidos.map((pedido) => (
              <Card 
                key={pedido.pedido_id} 
                className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
                onClick={() => handleOrderClick(pedido)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{pedido.nombre}</h3>
                          <p className="text-sm text-muted-foreground">Código: {pedido.codigo}</p>
                        </div>
                        <Badge className={`${getStatusColor(pedido.estado)} border flex items-center gap-1`}>
                          {getStatusIcon(pedido.estado)}
                          {pedido.estado}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Total:</span>
                          <span className="font-semibold text-foreground">${pedido.total} {pedido.currency}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Tipo:</span>
                          <span className="font-semibold text-foreground">{pedido.deliver_or_rest}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Fecha:</span>
                          <span className="font-semibold text-foreground">
                            {new Date(pedido.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {pedido.instrucciones && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                          <p className="text-sm text-muted-foreground italic">
                            "{pedido.instrucciones}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        onAcceptOrder={() => {}}
        onMarkReady={() => {}}
        onDeliverOrder={() => {}}
        onCancelOrder={() => {}}
        isHistory={true}
      />
    </div>
  )
}
