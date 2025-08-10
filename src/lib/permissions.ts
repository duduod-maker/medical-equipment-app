import { Role } from "@prisma/client"
import { Session } from "next-auth"

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === Role.ADMIN
}

export function isUser(session: Session | null): boolean {
  return session?.user?.role === Role.USER
}

export function canManageEquipment(session: Session | null, equipmentUserId?: string): boolean {
  if (!session) return false
  
  if (isAdmin(session)) return true
  
  return session.user.id === equipmentUserId
}

export function canManageRequest(session: Session | null, requestUserId?: string): boolean {
  if (!session) return false
  
  if (isAdmin(session)) return true
  
  return session.user.id === requestUserId
}