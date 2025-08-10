export interface EquipmentType {
  id: string
  name: string
}

export interface Equipment {
  id: string
  reference?: string
  sector: string
  room: string
  resident: string
  deliveryDate?: string
  returnDate?: string
  type: {
    id: string
    name: string
  }
  user: {
    name?: string
    email: string
  }
  createdAt: string
  userId: string;
}