"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react" // Import useState
import { Header } from "@/components/layout/header"
import { RequestsList } from "@/components/requests/requests-list"
import { Cart } from "@/components/requests/cart"
import { isAdmin } from "@/lib/permissions" // Import isAdmin

interface User { // Define User interface
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function RequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([]) // New state for users
  const [loadingUsers, setLoadingUsers] = useState(true); // New state for loading users

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }

    const fetchUsers = async () => {
      if (isAdmin(session)) { // Only fetch users if admin
        try {
          const response = await fetch("/api/users")
          if (response.ok) {
            const data = await response.json()
            setUsers(data)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des utilisateurs:", error)
        } finally {
          setLoadingUsers(false);
        }
      } else {
        setLoadingUsers(false); // Not admin, no users to load
      }
    }

    fetchUsers();
  }, [session, status, router])

  if (status === "loading" || loadingUsers) { // Check loadingUsers as well
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Demandes de matériel
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez vos demandes de livraison, reprise et dépannage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RequestsList />
            </div>
            <div>
              <Cart users={users} /> {/* Pass users to Cart */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}