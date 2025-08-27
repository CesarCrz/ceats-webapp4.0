"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Building, Save, Mail } from "lucide-react"
import { SucursalRegistro } from "@/lib/api"

interface SucursalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sucursal: SucursalRegistro) => void
  sucursal?: any | null
}

export function SucursalFormModal({ isOpen, onClose, onSave, sucursal }: SucursalFormModalProps) {
  const [formData, setFormData] = useState<SucursalRegistro>({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  })

  useEffect(() => {
    if (sucursal) {
      setFormData({
        nombre: sucursal.nombre || "",
        direccion: sucursal.direccion || "",
        telefono: sucursal.telefono || "",
        email: sucursal.email || "",
      })
    } else {
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
      })
    }
  }, [sucursal, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nombre && formData.direccion && formData.telefono && formData.email) {
      onSave(formData)
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      direccion: "",
      telefono: "",
      email: "",
    })
    onClose()
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isFormValid = () => {
    return (
      formData.nombre.trim() &&
      formData.direccion.trim() &&
      formData.telefono.trim() &&
      formData.email.trim() &&
      isValidEmail(formData.email)
    )
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
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email de contacto *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sucursal@restaurante.com"
              className="glass focus:glass-strong"
              required
            />
            <p className="text-xs text-muted-foreground">
              Se enviará un código de verificación a este email para activar la sucursal
            </p>
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
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 cursor-pointer"
              disabled={!isFormValid()}
            >
              <Save className="w-4 h-4 mr-2" />
              {sucursal ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
