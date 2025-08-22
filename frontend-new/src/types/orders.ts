export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customer: string
  restaurant: string
  status: "new" | "preparing" | "ready"
  items: OrderItem[]
  comments?: string
  subtotal: number
  total: number
  time: string
  isNew?: boolean
  itemsList?: OrderItem[] // Para compatibilidad con OrderCard
}
