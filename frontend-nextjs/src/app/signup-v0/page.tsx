"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChefHat, ArrowRight, Mail, Lock, User, Phone, Calendar, Building, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"
import { CountrySelector } from "@/components/country-selector"

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Datos del administrador
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    countryCode: "+52", // agregado código de país por defecto
    fechaNacimiento: "",
    // Datos del restaurante
    nombreRestaurante: "",
    direccionFiscal: "",
    aceptaTerminos: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = () => {
    return (
      formData.nombre.trim() !== "" &&
      formData.apellidos.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.password === formData.confirmPassword &&
      formData.telefono.trim() !== "" &&
      formData.fechaNacimiento.trim() !== ""
    )
  }

  const isStep2Valid = () => {
    return formData.nombreRestaurante.trim() !== "" && formData.direccionFiscal.trim() !== "" && formData.aceptaTerminos
  }

  const handleContinue = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isStep2Valid()) {
      console.log("Datos del formulario:", formData)
      // Aquí iría la lógica de registro y redirección a /verify-email
      window.location.href = "/verify-email"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-60 h-60 bg-accent/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-bounce-subtle"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <Card className="w-full max-w-2xl glass-strong relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 hover:shadow-2xl transition-all">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
              cEats v2
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Únete a la plataforma líder en gestión de restaurantes
            </CardDescription>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div
              className={`flex items-center space-x-2 transition-all duration-500 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 cursor-pointer hover:scale-110 ${
                  currentStep >= 1
                    ? "bg-primary border-primary text-primary-foreground shadow-lg"
                    : "border-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm font-medium">Tu Información</span>
            </div>
            <div
              className={`w-12 h-0.5 transition-all duration-500 ${currentStep >= 2 ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted"}`}
            ></div>
            <div
              className={`flex items-center space-x-2 transition-all duration-500 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 cursor-pointer hover:scale-110 ${
                  currentStep >= 2
                    ? "bg-primary border-primary text-primary-foreground shadow-lg"
                    : "border-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Tu Restaurante</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Tu Información (Administrador)</h3>
                  <p className="text-muted-foreground mt-1">Datos del contacto principal del restaurante</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      type="text"
                      placeholder="Tus apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange("apellidos", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@restaurante.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="flex items-center gap-2 cursor-pointer">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </Label>
                    <div className="flex gap-2">
                      <CountrySelector
                        value={formData.countryCode}
                        onChange={(value) => handleInputChange("countryCode", value)}
                        className="w-32"
                      />
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="55 1234 5678"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong flex-1"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Número completo: {formData.countryCode}
                      {formData.telefono}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="w-4 h-4" />
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isStep1Valid()}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Información de tu Restaurante</h3>
                  <p className="text-muted-foreground mt-1">Datos comerciales y fiscales</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreRestaurante" className="flex items-center gap-2 cursor-pointer">
                    <Building className="w-4 h-4" />
                    Nombre del Restaurante
                  </Label>
                  <Input
                    id="nombreRestaurante"
                    type="text"
                    placeholder="El nombre comercial de tu restaurante"
                    value={formData.nombreRestaurante}
                    onChange={(e) => handleInputChange("nombreRestaurante", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionFiscal" className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="w-4 h-4" />
                    Dirección Fiscal
                  </Label>
                  <Input
                    id="direccionFiscal"
                    type="text"
                    placeholder="Calle, número, colonia, ciudad, estado, CP"
                    value={formData.direccionFiscal}
                    onChange={(e) => handleInputChange("direccionFiscal", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 glass rounded-lg border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all duration-300">
                  <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked) => handleInputChange("aceptaTerminos", checked as boolean)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="terminos" className="text-sm leading-relaxed cursor-pointer">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-primary hover:underline font-medium cursor-pointer">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-primary hover:underline font-medium cursor-pointer">
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 glass hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isStep2Valid()}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                  >
                    Registrar Restaurante
                    <ChefHat className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium transition-colors cursor-pointer">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
