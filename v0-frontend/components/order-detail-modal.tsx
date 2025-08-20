"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Clock, CheckCircle, AlertTriangle, Truck } from "lucide-react"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer: string
  restaurant: string
  status: "new" | "preparing" | "ready"
  items: OrderItem[]
  comments?: string
  subtotal: number
  total: number
  time: string
  isNew?: boolean
}

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onAcceptOrder?: (orderId: string) => void
  onMarkReady?: (orderId: string) => void
  onDeliverOrder?: (orderId: string) => void
  onCancelOrder?: (orderId: string) => void
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onAcceptOrder,
  onMarkReady,
  onDeliverOrder,
  onCancelOrder,
}: OrderDetailModalProps) {
  if (!order) return null

  const handleAccept = () => {
    onAcceptOrder?.(order.id)
    onClose()
  }

  const handleMarkReady = () => {
    onMarkReady?.(order.id)
    onClose()
  }

  const handleDeliver = () => {
    onDeliverOrder?.(order.id)
    onClose()
  }

  const handleCancel = () => {
    onCancelOrder?.(order.id)
  }

  const getStatusIcon = () => {
    switch (order.status) {
      case "new":
        return <AlertTriangle className="w-4 h-4 text-green-600" />
      case "preparing":
        return <Clock className="w-4 h-4 text-primary" />
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-primary" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-strong border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">{getStatusIcon()}</div>
            <DialogTitle className="text-lg font-bold text-primary">{order.id}</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <span className="font-medium">{order.customer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sucursal:</span>
              <span className="font-medium">{order.restaurant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entregar a:</span>
              <span className="font-medium">{order.customer}</span>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.quantity}
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </div>
                <span className="font-bold text-green-600">${item.price}</span>
              </div>
            ))}
          </div>

          {/* Comments */}
          {order.comments && (
            <>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Comentarios:</span>
                <p className="text-sm mt-1 p-2 bg-muted/20 rounded-lg">{order.comments}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">${order.subtotal}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            {order.status === "new" ? (
              // New orders (green): Only "Aceptar Pedido" button
              <Button
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aceptar Pedido
              </Button>
            ) : order.status === "preparing" ? (
              // Preparing orders: "Listo" and "Cancelar Pedido" buttons
              <>
                <Button variant="destructive" onClick={handleCancel} className="flex-1 cursor-pointer">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Cancelar Pedido
                </Button>
                <Button
                  onClick={handleMarkReady}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Listo
                </Button>
              </>
            ) : (
              // Ready orders: "Entregar" button and "Cancelado por Cliente" option
              <>
                <Button variant="outline" onClick={handleCancel} className="cursor-pointer bg-transparent">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Cancelado por Cliente
                </Button>
                <Button
                  onClick={handleDeliver}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Entregar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
