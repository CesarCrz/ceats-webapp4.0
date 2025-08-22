import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, ArrowRight, Users, Building, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
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

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-strong border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    cEats v2
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
                <ChefHat className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  cEats v2
                </span>
                <br />
                <span className="text-foreground">Gestión Profesional</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                La plataforma más avanzada para la gestión integral de restaurantes. Controla pedidos, sucursales,
                usuarios y más desde una interfaz moderna y profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    Comenzar Gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="glass hover:glass-strong bg-transparent">
                    Ver Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitas para tu restaurante</h2>
              <p className="text-xl text-muted-foreground">
                Funcionalidades diseñadas para maximizar la eficiencia de tu negocio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-strong p-6 rounded-xl hover:glass transition-all duration-300 transform hover:scale-[1.02] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dashboard Inteligente</h3>
                <p className="text-muted-foreground">Visualiza métricas en tiempo real y toma decisiones informadas</p>
              </div>

              <div className="glass-strong p-6 rounded-xl hover:glass transition-all duration-300 transform hover:scale-[1.02] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Sucursal</h3>
                <p className="text-muted-foreground">Gestiona múltiples ubicaciones desde una sola plataforma</p>
              </div>

              <div className="glass-strong p-6 rounded-xl hover:glass transition-all duration-300 transform hover:scale-[1.02] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Gestión de Equipo</h3>
                <p className="text-muted-foreground">Administra usuarios, roles y permisos de manera eficiente</p>
              </div>

              <div className="glass-strong p-6 rounded-xl hover:glass transition-all duration-300 transform hover:scale-[1.02] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Seguridad Avanzada</h3>
                <p className="text-muted-foreground">Protección de datos y acceso seguro para tu tranquilidad</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-strong p-12 rounded-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para revolucionar tu restaurante?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a cientos de restaurantes que ya confían en cEats v2
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="glass-strong border-t border-border/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">© 2024 cEats v2. Todos los derechos reservados.</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <Link href="/privacidad" className="hover:text-primary transition-colors">
                  Privacidad
                </Link>
                <Link href="/terminos" className="hover:text-primary transition-colors">
                  Términos
                </Link>
                <Link href="/soporte" className="hover:text-primary transition-colors">
                  Soporte
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
