"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageCircle, CheckCircle, XCircle, AlertCircle, ExternalLink, Smartphone } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { apiClient } from "@/lib/api"

interface WhatsAppIntegration {
  integration_id: string
  restaurante_id: string
  sucursal_id?: string
  provider: 'whatsapp_business_api'
  is_active: boolean
  waba_id?: string
  phone_number_id?: string
  business_id?: string
  access_token_encrypted?: string
  webhook_url?: string
  verify_token?: string
  created_at: string
  updated_at: string
}

declare global {
  interface Window {
    FB: any;
  }
}

export function WhatsAppIntegrationModal() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showEmbeddedSignup, setShowEmbeddedSignup] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<string>('')

  // Estados para configuración manual
  const [manualConfig, setManualConfig] = useState({
    sucursal_id: '',
    phone_number_id: '',
    access_token: '',
    verify_token: ''
  })

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      loadIntegrations()
      loadFacebookSDK()
    }
  }, [isOpen, user])

  const loadFacebookSDK = () => {
    // Cargar Facebook SDK si no está cargado
    if (!window.FB) {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v20.0'
        })
      }
      document.head.appendChild(script)
    }
  }

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getWhatsAppIntegrations()
      setIntegrations((response as any).data || [])
    } catch (err) {
      console.error('Error loading integrations:', err)
      setError('Error al cargar las integraciones')
    } finally {
      setLoading(false)
    }
  }

  const handleStartEmbeddedSignup = async () => {
    if (!selectedSucursal) {
      setError('Por favor selecciona una sucursal')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Iniciar proceso de Embedded Signup
      const response = await apiClient.request('/api/whatsapp/embedded-signup/init', {
        method: 'POST',
        body: JSON.stringify({
          sucursal_id: selectedSucursal
        })
      })

      // Mostrar el Embedded Signup
      setShowEmbeddedSignup(true)
      
      // Inicializar el Embedded Signup de Facebook
      if (window.FB) {
        window.FB.ui({
          method: 'embedded_signup',
          app_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          redirect_uri: `${window.location.origin}/api/whatsapp/embedded-signup/callback`,
          state: (response as any).state,
          scope: 'whatsapp_business_management',
          response_type: 'code'
        }, (response: any) => {
          if (response && response.code) {
            handleEmbeddedSignupCallback(response.code)
          } else {
            setError('Proceso de configuración cancelado')
            setShowEmbeddedSignup(false)
          }
        })
      }
    } catch (err: any) {
      console.error('Error starting embedded signup:', err)
      setError(err.message || 'Error al iniciar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleEmbeddedSignupCallback = async (code: string) => {
    try {
      setLoading(true)
      
      const response = await apiClient.request('/api/whatsapp/embedded-signup/callback', {
        method: 'POST',
        body: JSON.stringify({ code })
      })

      setSuccess('WhatsApp Business API configurado exitosamente')
      setShowEmbeddedSignup(false)
      loadIntegrations()
    } catch (err: any) {
      console.error('Error in embedded signup callback:', err)
      setError(err.message || 'Error al completar la configuración')
      setShowEmbeddedSignup(false)
    } finally {
      setLoading(false)
    }
  }

  const handleManualConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.createWhatsAppIntegration({
        sucursal_id: manualConfig.sucursal_id || null,
        provider: 'whatsapp_business_api',
        phone_number_id: manualConfig.phone_number_id,
        access_token: manualConfig.access_token,
        verify_token: manualConfig.verify_token
      })

      setSuccess('Integración creada exitosamente')
      setManualConfig({
        sucursal_id: '',
        phone_number_id: '',
        access_token: '',
        verify_token: ''
      })
      loadIntegrations()
    } catch (err: any) {
      console.error('Error creating integration:', err)
      setError(err.message || 'Error al crear la integración')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      setLoading(true)
      await apiClient.updateWhatsAppIntegration(integrationId, { is_active: isActive })
      setSuccess(`Integración ${isActive ? 'activada' : 'desactivada'} exitosamente`)
      loadIntegrations()
    } catch (err: any) {
      console.error('Error updating integration:', err)
      setError(err.message || 'Error al actualizar la integración')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta integración?')) return
    
    try {
      setLoading(true)
      await apiClient.deleteWhatsAppIntegration(integrationId)
      setSuccess('Integración eliminada exitosamente')
      loadIntegrations()
    } catch (err: any) {
      console.error('Error deleting integration:', err)
      setError(err.message || 'Error al eliminar la integración')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Conectar WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Configuración de WhatsApp Business API
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Selección de sucursal */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Sucursal</CardTitle>
              <CardDescription>
                Elige la sucursal para la cual quieres configurar WhatsApp Business API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="sucursal">Sucursal</Label>
                <Input
                  id="sucursal"
                  value={selectedSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  placeholder="UUID de la sucursal"
                />
                <p className="text-sm text-muted-foreground">
                  Si dejas vacío, se configurará para todo el restaurante.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Método de configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Configuración</CardTitle>
              <CardDescription>
                Elige cómo quieres configurar WhatsApp Business API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Embedded Signup */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Configuración Automática (Recomendado)</h4>
                    <p className="text-sm text-muted-foreground">
                      Configura WhatsApp Business API directamente desde esta página usando el Embedded Signup de Meta.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleStartEmbeddedSignup}
                  disabled={loading || showEmbeddedSignup}
                  className="w-full"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {showEmbeddedSignup ? 'Configurando...' : 'Configurar Automáticamente'}
                </Button>
              </div>

              {/* Configuración Manual */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Configuración Manual</h4>
                    <p className="text-sm text-muted-foreground">
                      Ingresa manualmente las credenciales de WhatsApp Business API.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                    <Input
                      id="phone_number_id"
                      value={manualConfig.phone_number_id}
                      onChange={(e) => setManualConfig(prev => ({ ...prev, phone_number_id: e.target.value }))}
                      placeholder="Ej: 123456789012345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_token">Access Token *</Label>
                    <Input
                      id="access_token"
                      type="password"
                      value={manualConfig.access_token}
                      onChange={(e) => setManualConfig(prev => ({ ...prev, access_token: e.target.value }))}
                      placeholder="Token de acceso de Meta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verify_token">Verify Token *</Label>
                    <Input
                      id="verify_token"
                      value={manualConfig.verify_token}
                      onChange={(e) => setManualConfig(prev => ({ ...prev, verify_token: e.target.value }))}
                      placeholder="Token de verificación personalizado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual_sucursal_id">Sucursal (Opcional)</Label>
                    <Input
                      id="manual_sucursal_id"
                      value={manualConfig.sucursal_id}
                      onChange={(e) => setManualConfig(prev => ({ ...prev, sucursal_id: e.target.value }))}
                      placeholder="UUID de la sucursal"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleManualConfig}
                  disabled={loading || !manualConfig.phone_number_id || !manualConfig.access_token || !manualConfig.verify_token}
                  className="w-full mt-4"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Crear Integración Manual
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integraciones existentes */}
          <Card>
            <CardHeader>
              <CardTitle>Integraciones Existentes</CardTitle>
              <CardDescription>
                Gestiona las integraciones de WhatsApp configuradas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay integraciones configuradas
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.integration_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={integration.is_active ? "default" : "secondary"}>
                              {integration.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                            <span className="font-medium">WhatsApp Business API</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Phone Number ID: {integration.phone_number_id || 'No configurado'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Creada: {new Date(integration.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleIntegration(integration.integration_id, !integration.is_active)}
                            disabled={loading}
                          >
                            {integration.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIntegration(integration.integration_id)}
                            disabled={loading}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
