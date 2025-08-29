"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SucursalFormModal } from "@/components/sucursal-form-modal"
import { SucursalVerificationModal } from "@/components/sucursal-verification-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { Plus, Search, MapPin, Phone, Users, Edit, Trash2, ArrowLeft, Building, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { sucursalesApi, Sucursal, SucursalRegistro } from "@/lib/api"

export default function SucursalesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  const [showSucursalModal, setShowSucursalModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  // Cargar sucursales al montar el componente
  useEffect(() => {
    if (user?.restaurante_id) {
      loadSucursales()
    }
  }, [user])

  const loadSucursales = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await sucursalesApi.getSucursales(user!.restaurante_id)
      setSucursales(data)
    } catch (error) {
      console.error('Error cargando sucursales:', error)
      setError('Error cargando sucursales')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSucursal = () => {
    setSelectedSucursal(null)
    setShowSucursalModal(true)
  }

  const handleEditSucursal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal)
    setShowSucursalModal(true)
  }

  const handleDeleteSucursal = (sucursal: Sucursal) => {
    setSucursalToDelete(sucursal)
    setShowDeleteModal(true)
  }

  const handleSaveSucursal = async (sucursalData: SucursalRegistro) => {
    try {
      if (selectedSucursal) {
        // Actualizar sucursal existente
        await sucursalesApi.updateSucursal(selectedSucursal.sucursal_id, sucursalData)
        setShowSucursalModal(false)
        loadSucursales() // Recargar lista
      } else {
        // Registrar nueva sucursal
        const result = await sucursalesApi.registerSucursal(sucursalData)
        setShowSucursalModal(false)
        
        // Mostrar modal de verificación
        setVerificationResult({
          sucursal: result.sucursal,
          message: result.message
        })
        setShowVerificationModal(true)
        
        loadSucursales() // Recargar lista
      }
    } catch (error) {
      console.error('Error guardando sucursal:', error)
      setError(error instanceof Error ? error.message : 'Error guardando sucursal')
    }
  }

  const handleVerifySucursal = async (verificationCode: string) => {
    try {
      if (!verificationResult?.sucursal) return
      
      const result = await sucursalesApi.verifySucursal({
        sucursal_id: verificationResult.sucursal.sucursal_id,
        verification_code: verificationCode
      })
      
      setShowVerificationModal(false)
      setVerificationResult(null)
      
      // Mostrar resultado exitoso
      alert(`¡Sucursal verificada exitosamente!\n\nUsuario creado:\nEmail: ${result.usuario.email}\nContraseña temporal: ${result.tempPassword}\n\nEl usuario debe cambiar su contraseña en el primer login.`)
      
      loadSucursales() // Recargar lista
    } catch (error) {
      console.error('Error verificando sucursal:', error)
      setError(error instanceof Error ? error.message : 'Error verificando sucursal')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      if (!sucursalToDelete) return
      
      await sucursalesApi.deleteSucursal(sucursalToDelete.sucursal_id)
      setShowDeleteModal(false)
      setSucursalToDelete(null)
      loadSucursales() // Recargar lista
    } catch (error) {
      console.error('Error eliminando sucursal:', error)
      setError(error instanceof Error ? error.message : 'Error eliminando sucursal')
    }
  }

  const filteredSucursales = sucursales.filter((sucursal) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      sucursal.nombre_sucursal?.toLowerCase().includes(searchLower) ||
      sucursal.direccion?.toLowerCase().includes(searchLower) ||
      sucursal.email_contacto_sucursal?.toLowerCase().includes(searchLower) ||
      sucursal.telefono_contacto?.includes(searchTerm)
    )
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
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
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Gestión de Sucursales
                </h1>
                <p className="text-xs text-muted-foreground">Administra las sucursales de tu restaurante</p>
              </div>
            </div>
            <Button
              onClick={handleAddSucursal}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sucursal
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar sucursales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
        </div>

        {/* Sucursales Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando sucursales...</p>
          </div>
        ) : filteredSucursales.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay sucursales</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron sucursales con ese criterio de búsqueda.' : 'Comienza agregando tu primera sucursal.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddSucursal} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Sucursal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSucursales.map((sucursal) => (
              <Card key={sucursal.sucursal_id} className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {sucursal.nombre_sucursal}
                        {sucursal.is_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" title="Verificada" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" title="Pendiente de verificación" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {sucursal.is_active ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                            Inactiva
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSucursal(sucursal)
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSucursal(sucursal)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{sucursal.direccion}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{sucursal.telefono_contacto}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{sucursal.email_contacto_sucursal}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{sucursal.usuarios_count} usuarios</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Creada: {new Date(sucursal.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SucursalFormModal
        isOpen={showSucursalModal}
        onClose={() => setShowSucursalModal(false)}
        onSave={handleSaveSucursal}
        sucursal={selectedSucursal}
      />

      <SucursalVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false)
          setVerificationResult(null)
        }}
        onVerify={handleVerifySucursal}
        sucursal={verificationResult?.sucursal}
        message={verificationResult?.message}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Sucursal"
        message={`¿Estás seguro de que quieres eliminar la sucursal "${sucursalToDelete?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
