"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, ArrowLeft, Key, Bell, Shield, Building, Save, Eye, EyeOff, Check, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  const [selectedSucursal, setSelectedSucursal] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderReady: true,
    orderCancelled: true,
    dailyReport: false,
    weeklyReport: true,
  })
  const [generalSettings, setGeneralSettings] = useState({
    autoAcceptOrders: false,
    orderTimeout: "30",
    maxOrdersPerHour: "50",
    maintenanceMode: false,
  })

  const sucursales = ["Sucursal Centro", "Sucursal Norte", "Sucursal Sur", "Sucursal Oeste"]

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSavePassword = () => {
    if (!selectedSucursal || !newPassword) {
      console.log("Please select a sucursal and enter a password")
      return
    }
    console.log("Saving password for:", selectedSucursal, "Password:", newPassword)
    // Reset form after saving
    setSelectedSucursal("")
    setNewPassword("")
    setShowPassword(false)
  }

  const handleSaveNotifications = () => {
    console.log("Saving notifications:", notifications)
    // Here you would typically make an API call to save the notification settings
  }

  const handleSaveGeneralSettings = () => {
    console.log("Saving general settings:", generalSettings)
    // Here you would typically make an API call to save the general settings
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
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Configuración del Sistema
                </h1>
                <p className="text-xs text-muted-foreground">Administra la configuración de cEats v2</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Contraseñas de Sucursales */}
          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Contraseñas de Sucursales</CardTitle>
                  <CardDescription>Configura las contraseñas de acceso para cada sucursal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sucursal-select" className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Seleccionar Sucursal</span>
                  </Label>
                  <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
                    <SelectTrigger className="glass focus:glass-strong">
                      <SelectValue placeholder="Selecciona una sucursal" />
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

                {selectedSucursal && (
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>Nueva Contraseña para {selectedSucursal}</span>
                    </Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ingresa la nueva contraseña"
                          className="glass focus:glass-strong pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePassword}
                  className="cursor-pointer"
                  disabled={!selectedSucursal || !newPassword}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Configuración de Notificaciones</CardTitle>
                  <CardDescription>Personaliza qué notificaciones deseas recibir</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Nuevos pedidos</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificación cuando llegue un nuevo pedido</p>
                  </div>
                  <Switch
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newOrders: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Pedidos listos</Label>
                    <p className="text-sm text-muted-foreground">Notificar cuando un pedido esté listo para entregar</p>
                  </div>
                  <Switch
                    checked={notifications.orderReady}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, orderReady: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Pedidos cancelados</Label>
                    <p className="text-sm text-muted-foreground">Recibir alerta cuando se cancele un pedido</p>
                  </div>
                  <Switch
                    checked={notifications.orderCancelled}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, orderCancelled: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Reporte diario</Label>
                    <p className="text-sm text-muted-foreground">Resumen diario de ventas y estadísticas</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, dailyReport: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Reporte semanal</Label>
                    <p className="text-sm text-muted-foreground">Análisis semanal detallado del rendimiento</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReport: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} className="cursor-pointer">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuración General */}
          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>Ajustes generales del sistema y operación</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-aceptar pedidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Aceptar automáticamente los pedidos sin confirmación manual
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.autoAcceptOrders}
                    onCheckedChange={(checked) =>
                      setGeneralSettings((prev) => ({ ...prev, autoAcceptOrders: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="orderTimeout">Tiempo límite de pedidos (minutos)</Label>
                  <Select
                    value={generalSettings.orderTimeout}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, orderTimeout: value }))}
                  >
                    <SelectTrigger className="glass focus:glass-strong">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong">
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOrders">Máximo pedidos por hora</Label>
                  <Select
                    value={generalSettings.maxOrdersPerHour}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, maxOrdersPerHour: value }))}
                  >
                    <SelectTrigger className="glass focus:glass-strong">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong">
                      <SelectItem value="25">25 pedidos</SelectItem>
                      <SelectItem value="50">50 pedidos</SelectItem>
                      <SelectItem value="75">75 pedidos</SelectItem>
                      <SelectItem value="100">100 pedidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Modo mantenimiento</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Pausar temporalmente la recepción de nuevos pedidos</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneralSettings} className="cursor-pointer">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sistema Info */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>Detalles técnicos y estado del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Versión</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="glass">
                      cEats v2.0.0
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                      <Check className="w-3 h-3 mr-1" />
                      Actualizado
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Estado del servidor</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Operativo</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Última sincronización</Label>
                  <p className="text-sm">Hace 2 minutos</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sucursales conectadas</Label>
                  <p className="text-sm">4 de 4 sucursales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
