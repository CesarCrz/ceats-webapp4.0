"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Building, Save } from "lucide-react"

interface Sucursal {
  id?: number
  nombre: string
  direccion: string
  telefono: string
  gerente: string
  status: string
}

interface SucursalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sucursal: Sucursal) => void
  sucursal?: Sucursal | null
  gerentes: string[]
}

export function SucursalFormModal({ isOpen, onClose, onSave, sucursal, gerentes }: SucursalFormModalProps) {
  const [formData, setFormData] = useState<Sucursal>({
    nombre: "",
    direccion: "",
    telefono: "",
    gerente: "",
    status: "activa",
  })

  useEffect(() => {
    if (sucursal) {
      setFormData(sucursal)
    } else {
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        gerente: "",
        status: "activa",
      })
    }
  }, [sucursal, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nombre && formData.direccion && formData.telefono && formData.gerente) {
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      direccion: "",
      telefono: "",
      gerente: "",
      status: "activa",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md glass-strong border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-primary">
              {sucursal ? "Editar Sucursal" : "Nueva Sucursal"}
            </DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la sucursal *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Sucursal Centro"
              className="glass focus:glass-strong"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección completa *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Av. Juárez 123, Centro, CDMX"
              className="glass focus:glass-strong"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+52 55 1234 5678"
              className="glass focus:glass-strong"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gerente">Gerente asignado *</Label>
            <Select value={formData.gerente} onValueChange={(value) => setFormData({ ...formData, gerente: value })}>
              <SelectTrigger className="glass focus:glass-strong">
                <SelectValue placeholder="Seleccionar gerente" />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                {gerentes.map((gerente) => (
                  <SelectItem key={gerente} value={gerente}>
                    {gerente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="glass focus:glass-strong">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="inactiva">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 cursor-pointer bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer">
              <Save className="w-4 h-4 mr-2" />
              {sucursal ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
