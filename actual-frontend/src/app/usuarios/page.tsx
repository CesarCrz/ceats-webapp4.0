"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserFormModal } from "@/components/user-form-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { Users, Plus, Search, Mail, Building, Shield, Edit, Trash2, ArrowLeft, UserCheck, UserX } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  nombre: string
  email: string
  rol: string
  sucursal: string
  status: string
  ultimoAcceso: string
}

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [usuarios, setUsuarios] = useState<User[]>([
    {
      id: 1,
      nombre: "María González",
      email: "maria@ceats.com",
      rol: "Administrador",
      sucursal: "Sucursal Centro",
      status: "activo",
      ultimoAcceso: "2024-01-15",
    },
    {
      id: 2,
      nombre: "Carlos Ruiz",
      email: "carlos@ceats.com",
      rol: "Gerente",
      sucursal: "Sucursal Norte",
      status: "activo",
      ultimoAcceso: "2024-01-14",
    },
    {
      id: 3,
      nombre: "Ana López",
      email: "ana@ceats.com",
      rol: "Mesero",
      sucursal: "Sucursal Sur",
      status: "inactivo",
      ultimoAcceso: "2024-01-10",
    },
    {
      id: 4,
      nombre: "Pedro Martín",
      email: "pedro@ceats.com",
      rol: "Cocinero",
      sucursal: "Sucursal Centro",
      status: "activo",
      ultimoAcceso: "2024-01-15",
    },
    {
      id: 5,
      nombre: "Laura Sánchez",
      email: "laura@ceats.com",
      rol: "Cajero",
      sucursal: "Sucursal Norte",
      status: "activo",
      ultimoAcceso: "2024-01-13",
    },
    {
      id: 6,
      nombre: "Diego Torres",
      email: "diego@ceats.com",
      rol: "Mesero",
      sucursal: "Sucursal Oeste",
      status: "activo",
      ultimoAcceso: "2024-01-15",
    },
  ])

  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const sucursales = ["Sucursal Centro", "Sucursal Norte", "Sucursal Sur", "Sucursal Oeste"]

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleSaveUser = (userData: Omit<User, "id" | "ultimoAcceso">) => {
    if (selectedUser) {
      // Edit existing user
      setUsuarios(usuarios.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u)))
    } else {
      // Add new user
      const newUser: User = {
        ...userData,
        id: Math.max(...usuarios.map((u) => u.id)) + 1,
        ultimoAcceso: new Date().toISOString().split("T")[0],
      }
      setUsuarios([...usuarios, newUser])
    }
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsuarios(usuarios.filter((u) => u.id !== userToDelete.id))
      setUserToDelete(null)
    }
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.sucursal.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    return status === "activo"
      ? "bg-green-500/10 text-green-700 border-green-500/20"
      : "bg-red-500/10 text-red-700 border-red-500/20"
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20"
      case "Gerente":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "Cocinero":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20"
      case "Mesero":
        return "bg-teal-500/10 text-teal-700 border-teal-500/20"
      case "Cajero":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return <Shield className="w-3 h-3" />
      case "Gerente":
        return <Users className="w-3 h-3" />
      default:
        return <UserCheck className="w-3 h-3" />
    }
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
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Gestión de Usuarios
                </h1>
                <p className="text-xs text-muted-foreground">Administra el equipo de tu restaurante</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          <Button
            onClick={handleAddUser}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Usuario
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.status === "activo").length}</div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.status === "inactivo").length}</div>
            </CardContent>
          </Card>

          <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.rol === "Administrador").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Usuarios Table */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>Gestiona y administra todos los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 glass rounded-lg hover:glass-strong transition-all duration-300 space-y-4 lg:space-y-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {usuario.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{usuario.nombre}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getRolColor(usuario.rol)} border`}>
                            {getRolIcon(usuario.rol)}
                            <span className="ml-1">{usuario.rol}</span>
                          </Badge>
                          <Badge className={`${getStatusColor(usuario.status)} border`}>
                            {usuario.status === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{usuario.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{usuario.sucursal}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <UserCheck className="w-4 h-4" />
                        <span>Último acceso: {usuario.ultimoAcceso}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 lg:ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(usuario)}
                      className="glass hover:glass-strong bg-transparent cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(usuario)}
                      className="glass hover:glass-strong text-destructive hover:text-destructive bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron usuarios</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Añade tu primer usuario para comenzar"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        sucursales={sucursales}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description="Estás a punto de eliminar al usuario"
        itemName={userToDelete?.nombre || ""}
      />
    </div>
  )
}
