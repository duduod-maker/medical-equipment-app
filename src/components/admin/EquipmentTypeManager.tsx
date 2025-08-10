"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/permissions"

interface EquipmentType {
  id: string
  name: string
}

export function EquipmentTypeManager() {
  const { data: session } = useSession()
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [newTypeName, setNewTypeName] = useState("")
  const [editingType, setEditingType] = useState<EquipmentType | null>(null)
  const [editTypeName, setEditTypeName] = useState("")
  const [error, setError] = useState("")

  const fetchEquipmentTypes = async () => {
    try {
      const response = await fetch("/api/equipment-types")
      if (response.ok) {
        const data = await response.json()
        setEquipmentTypes(data)
      } else {
        setError("Erreur lors du chargement des types de matériel")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des types de matériel:", error)
      setError("Erreur lors du chargement des types de matériel")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipmentTypes()
  }, [])

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!newTypeName.trim()) {
      setError("Le nom du type de matériel ne peut pas être vide.")
      return
    }

    try {
      const response = await fetch("/api/equipment-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTypeName }),
      })

      if (response.ok) {
        setNewTypeName("")
        fetchEquipmentTypes()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de l'ajout du type de matériel")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du type de matériel:", error)
      setError("Erreur lors de l'ajout du type de matériel")
    }
  }

  const handleEditClick = (type: EquipmentType) => {
    setEditingType(type)
    setEditTypeName(type.name)
  }

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!editingType || !editTypeName.trim()) {
      setError("Le nom du type de matériel ne peut pas être vide.")
      return
    }

    try {
      const response = await fetch(`/api/equipment-types/${editingType.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editTypeName }),
      })

      if (response.ok) {
        setEditingType(null)
        setEditTypeName("")
        fetchEquipmentTypes()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la mise à jour du type de matériel")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type de matériel:", error)
      setError("Erreur lors de la mise à jour du type de matériel")
    }
  }

  const handleDeleteType = async (id: string) => {
    setError("")
    if (confirm("Êtes-vous sûr de vouloir supprimer ce type de matériel ? Cela supprimera également tous les équipements associés.")) {
      try {
        const response = await fetch(`/api/equipment-types/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchEquipmentTypes()
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Erreur lors de la suppression du type de matériel")
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du type de matériel:", error)
        setError("Erreur lors de la suppression du type de matériel")
      }
    }
  }

  if (!isAdmin(session)) {
    return <p>Accès refusé. Vous devez être administrateur pour gérer les types de matériel.</p>
  }

  if (loading) {
    return <div className="text-center py-4">Chargement des types de matériel...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Gestion des types de matériel</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleAddType} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Nouveau type de matériel"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipmentTypes.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Aucun type de matériel trouvé.
                </td>
              </tr>
            ) : (
              equipmentTypes.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingType?.id === type.id ? (
                      <input
                        type="text"
                        value={editTypeName}
                        onChange={(e) => setEditTypeName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      type.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingType?.id === type.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateType}
                          className="text-green-600 hover:text-green-900"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingType(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(type)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
