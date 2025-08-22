"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, X } from "lucide-react"

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  orderId: string
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, orderId }: CancelOrderModalProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason("")
      onClose()
    }
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md glass-strong border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-red-600">Cancelar Pedido</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              Estás a punto de cancelar el pedido <strong>{orderId}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo de cancelación *
            </Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo de la cancelación..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] glass focus:glass-strong transition-all duration-200"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 cursor-pointer bg-transparent">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="flex-1 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
