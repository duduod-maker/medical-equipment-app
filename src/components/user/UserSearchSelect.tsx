"use client"

import { useState, useEffect } from "react"
import { User } from "@/types/equipment"

interface UserSearchSelectProps {
  selectedUserId: string | null
  onSelect: (userId: string | null) => void
}

export function UserSearchSelect({ selectedUserId, onSelect }: UserSearchSelectProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: User[] = await response.json()
        setUsers(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <select disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option>Chargement des utilisateurs...</option></select>
  if (error) return <div className="text-red-500">Erreur de chargement des utilisateurs: {error}</div>

  return (
    <select
      id="user-filter"
      name="user-filter"
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      value={selectedUserId || ""}
      onChange={(e) => onSelect(e.target.value === "" ? null : e.target.value)}
    >
      <option value="">Tous les utilisateurs</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name || user.email}
        </option>
      ))}
    </select>
  )
}
