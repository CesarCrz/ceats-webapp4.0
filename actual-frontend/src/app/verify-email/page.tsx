"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

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

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("")
    
    if (code.length !== 6) {
      setError("Por favor ingresa el código completo de 6 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verificationCode: code
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setIsVerified(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Error al verificar el email')
      }
    } catch (error) {
      console.error('Error verificando email:', error)
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Nuevo código de verificación enviado a tu email')
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || 'Error al reenviar el código')
      }
    } catch (error) {
      console.error('Error reenviando código:', error)
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md glass-strong relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg animate-glow">
            <Mail className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Verificar Email
            </CardTitle>
            <CardDescription className="text-lg mt-2 text-muted-foreground">
              Ingresa el código enviado a tu email
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {isVerified ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-700 mb-2">¡Email Verificado!</h3>
              <p className="text-muted-foreground">
                Serás redirigido al login en unos segundos...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary">
                  Código enviado a: <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground text-center block">
                    Código de Verificación
                  </label>
                  
                  {/* Código de 6 dígitos en recuadros */}
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background"
                        placeholder=""
                      />
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Ingresa el código de 6 dígitos enviado a tu email
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  disabled={isLoading || verificationCode.join("").length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Email"
                  )}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <Button
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Reenviar Código"
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  ¿No recibiste el código? Revisa tu carpeta de spam
                </div>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al registro
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
