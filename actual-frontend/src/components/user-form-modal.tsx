"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: any) => void
  user?: any | null
  sucursales: string[]
}

export function UserFormModal({ isOpen, onClose, onSave, user, sucursales }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    sucursal: "",
    status: "activo",
  })

  useEffect(() => {
    if (user) {
      setFormData(user)
    } else {
      setFormData({
        nombre: "",
        email: "",
        rol: "",
        sucursal: "",
        status: "activo",
      })
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nombre && formData.email && formData.rol && formData.sucursal) {
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      email: "",
      rol: "",
      sucursal: "",
      status: "activo",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md glass-strong border-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <img src="/user-icon.png" alt="User" className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-primary">
              {user ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: María González"
              className="glass focus:glass-strong"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maria@ceats.com"
              className="glass focus:glass-strong"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
              <SelectTrigger className="glass focus:glass-strong">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
                <SelectItem value="Cocinero">Cocinero</SelectItem>
                <SelectItem value="Mesero">Mesero</SelectItem>
                <SelectItem value="Cajero">Cajero</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sucursal">Sucursal *</Label>
            <Select value={formData.sucursal} onValueChange={(value) => setFormData({ ...formData, sucursal: value })}>
              <SelectTrigger className="glass focus:glass-strong">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                {sucursales.map((sucursal) => (
                  <SelectItem key={sucursal} value={sucursal}>
                    {sucursal}
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
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
              {user ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
