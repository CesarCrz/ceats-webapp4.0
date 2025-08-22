"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

interface CountrySelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag")
        const data = await response.json()

        const formattedCountries: Country[] = data
          .filter((country: any) => country.idd?.root && country.idd?.suffixes?.length > 0)
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common,
            dialCode: country.idd.root + (country.idd.suffixes[0] || ""),
            flag: `https://flagcdn.com/24x18/${country.cca2.toLowerCase()}.png`,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

        const priorityCountries = ["MX", "US", "CA", "ES", "AR", "CO", "PE", "CL", "BR", "EC"]
        const priority = formattedCountries.filter((c) => priorityCountries.includes(c.code))
        const others = formattedCountries.filter((c) => !priorityCountries.includes(c.code))

        setCountries([...priority, ...others])
      } catch (error) {
        console.error("Error loading countries:", error)
        setCountries([
          { code: "MX", name: "México", dialCode: "+52", flag: "https://flagcdn.com/24x18/mx.png" },
          { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "https://flagcdn.com/24x18/us.png" },
          { code: "ES", name: "España", dialCode: "+34", flag: "https://flagcdn.com/24x18/es.png" },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  const selectedCountry = countries.find((country) => country.dialCode === value) || countries[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={loading}
          className={cn(
            "justify-between glass hover:glass-strong transition-all duration-200 cursor-pointer hover:scale-[1.02]",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedCountry ? (
              <>
                <img
                  src={selectedCountry.flag || "/placeholder.svg"}
                  alt={`${selectedCountry.name} flag`}
                  className="w-6 h-4 object-cover rounded-sm"
                  onError={(e) => {
                    // Fallback si falla la imagen
                    e.currentTarget.style.display = "none"
                  }}
                />
                <span className="font-medium">{selectedCountry.dialCode}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Seleccionar país</span>
            )}
          </div>
          <ChevronDown
            className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 glass-strong">
        <Command>
          <CommandInput placeholder="Buscar país..." className="h-9" />
          <CommandList>
            <CommandEmpty>{loading ? "Cargando países..." : "No se encontró el país."}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => {
                    onChange(country.dialCode)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={country.flag || "/placeholder.svg"}
                      alt={`${country.name} flag`}
                      className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{country.name}</div>
                      <div className="text-sm text-muted-foreground">{country.dialCode}</div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 transition-opacity duration-200 flex-shrink-0",
                        value === country.dialCode ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
