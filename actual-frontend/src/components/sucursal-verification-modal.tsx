"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"

interface SucursalVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => void
  sucursal?: any
  message?: string
}

export function SucursalVerificationModal({
  isOpen,
  onClose,
  onVerify,
  sucursal,
  message
}: SucursalVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      setVerificationCode(["", "", "", "", "", ""])
      setError("")
      setIsLoading(false)
      // Focus en el primer input
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Solo permitir un dígito
    
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Si está vacío y presiona backspace, ir al anterior
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = [...verificationCode]
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || ""
      }
      setVerificationCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = verificationCode.join("")
    
    if (code.length !== 6) {
      setError("Por favor ingresa el código completo de 6 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await onVerify(code)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error verificando sucursal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Verificar Sucursal
          </DialogTitle>
          <DialogDescription>
            {message || "Ingresa el código de verificación enviado al email de la sucursal"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {sucursal && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-1">{sucursal.nombre}</h4>
              <p className="text-sm text-muted-foreground">{sucursal.email}</p>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Label htmlFor="verificationCode" className="text-center block">
              Código de Verificación
            </Label>
            
            {/* Código de 6 dígitos en recuadros */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder=""
                />
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Ingresa el código de 6 dígitos enviado al email de la sucursal
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={isLoading || verificationCode.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
