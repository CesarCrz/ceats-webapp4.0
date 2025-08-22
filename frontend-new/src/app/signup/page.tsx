"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de registro
    console.log("Signup form submitted")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registro de Restaurante</CardTitle>
          <CardDescription className="text-center">
            Completa la información para registrar tu restaurante en cEats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Restaurante */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información del Restaurante</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
                  <Input
                    id="restaurantName"
                    placeholder="Mi Restaurante"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    placeholder="ABC123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalAddress">Dirección Fiscal</Label>
                <Input
                  id="fiscalAddress"
                  placeholder="Av. Principal 123, Ciudad, Estado"
                  required
                />
              </div>
            </div>

            {/* Información del Contacto Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información del Contacto Legal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez García"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@restaurante.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 33 1234 5678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Seguridad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Registrar Restaurante
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
