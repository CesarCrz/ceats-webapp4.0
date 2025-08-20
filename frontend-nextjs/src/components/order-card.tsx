"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  customer: string
  restaurant: string
  status: "new" | "preparing" | "ready" // Added "new" status type
  time: string
  items: number
  total: number
  isNew?: boolean
}

interface OrderCardProps {
  order: Order
  onClick: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const isNew = order.isNew || order.status === "new"

  return (
    <Card
      className={cn(
        "glass-strong hover:glass transition-all duration-300 transform hover:scale-[1.02] cursor-pointer",
        isNew &&
          "bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400/40 animate-pulse-slow shadow-lg shadow-green-500/25 ring-1 ring-green-400/20",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-primary text-lg">{order.id}</div>
          <div className="flex items-center space-x-2">
            {isNew && <Badge className="bg-green-500 text-white animate-bounce shadow-md">¡NUEVO!</Badge>}
            <Badge
              className={cn(
                order.status === "new" || order.status === "preparing"
                  ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                  : "bg-green-500/10 text-green-700 border-green-500/20",
              )}
            >
              {order.status === "new" || order.status === "preparing" ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  {order.time}
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Listo
                </>
              )}
            </Badge>
          </div>
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
      </CardContent>
    </Card>
  )
}
