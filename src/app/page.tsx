"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/layout/header"
import { EquipmentList } from "@/components/equipment/equipment-list"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
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
      <Header className="no-print" />
      <main className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8"> {/* Re-added max-w-7xl */}
        <div className="py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion du matériel médical
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez vos équipements médicaux et suivez vos demandes
            </p>
          </div>
          <div className="w-full"> {/* Add a full-width wrapper */}
            <EquipmentList />
          </div>
        </div>
      </main>
    </div>
  )
}
