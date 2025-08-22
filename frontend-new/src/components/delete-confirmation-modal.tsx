"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName: string
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-strong border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-red-600">{title}</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              {description} <strong>{itemName}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer bg-transparent">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm} className="flex-1 cursor-pointer">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Confirmar Eliminación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
