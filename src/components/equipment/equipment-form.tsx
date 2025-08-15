"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react" // Import useSession
import { isAdmin } from "@/lib/permissions" // Import isAdmin
import { Equipment, EquipmentType } from "@/types/equipment";

interface User { // Define User interface
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface EquipmentFormProps {
  equipment?: Equipment | null
  equipmentTypes: EquipmentType[]
  users: User[]; // Add users prop
  onSuccess: () => void
  onCancel: () => void
}

export function EquipmentForm({ equipment, equipmentTypes, users, onSuccess, onCancel }: EquipmentFormProps) {
  const { data: session } = useSession(); // Get session data

  const [formData, setFormData] = useState({
    typeId: "",
    reference: "",
    sector: "",
    room: "",
    resident: "",
    weight: "",
    deliveryDate: "",
    returnDate: "",
    userId: "", // Add userId to formData state
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (equipment) {
      setFormData({
        typeId: equipment.type.id,
        reference: equipment.reference || "",
        sector: equipment.sector,
        room: equipment.room,
        resident: equipment.resident,
        weight: equipment.weight?.toString() || "",
        deliveryDate: equipment.deliveryDate ? new Date(equipment.deliveryDate).toISOString().split('T')[0] : "",
        returnDate: equipment.returnDate ? new Date(equipment.returnDate).toISOString().split('T')[0] : "",
        userId: equipment.userId, // Populate userId
      })
    } else if (users.length > 0) {
      // Set default user to the first one if adding new equipment and users are available
      setFormData(prev => ({ ...prev, userId: users[0].id }));
    }
  }, [equipment, users])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = equipment ? `/api/equipment/${equipment.id}` : "/api/equipment"
      const method = equipment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        if (!equipment) {
          setFormData({
            typeId: "",
            reference: "",
            sector: "",
            room: "",
            resident: "",
            weight: "",
            deliveryDate: "", // Add this
            returnDate: "",  // Add this
            userId: "",      // Add this
          })
        }
      } else {
        setError("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      setError("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {equipment ? "Modifier l&apos;équipement" : "Ajouter un équipement"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="typeId" className="block text-sm font-medium text-gray-700">
              Type de matériel *
            </label>
            <select
              id="typeId"
              required
              value={formData.typeId}
              onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Sélectionner un type</option>
              {equipmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Référence
            </label>
            <input
              type="text"
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
              Secteur *
            </label>
            <input
              type="text"
              id="sector"
              required
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">
              Chambre *
            </label>
            <input
              type="text"
              id="room"
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="resident" className="block text-sm font-medium text-gray-700">
              Nom et prénom du résident *
            </label>
            <input
              type="text"
              id="resident"
              required
              value={formData.resident}
              onChange={(e) => setFormData({ ...formData, resident: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Poids (kg)
            </label>
            <input
              type="number"
              id="weight"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">
              Date de livraison
            </label>
            <input
              type="date"
              id="deliveryDate"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
              Date de reprise
            </label>
            <input
              type="date"
              id="returnDate"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {isAdmin(session) && ( // Only show user selection for admins
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Assigner à l&apos;utilisateur *
              </label>
              <select
                id="userId"
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Sauvegarde..." : equipment ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  )
}