import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { EquipmentForm } from "./equipment-form"
import { EquipmentItem } from "./equipment-item"
import { isAdmin } from "@/lib/permissions"

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Equipment {
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
}

interface EquipmentType {
  id: string
  name: string
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function EquipmentList() {
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [users, setUsers] = useState<User[]>([]) // New state for users
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500); // 500ms debounce
  const [selectedType, setSelectedType] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)

  const fetchEquipment = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (selectedType) params.append("type", selectedType)

      const response = await fetch(`/api/equipment?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement du matériel:", error)
    }
  }

  const fetchEquipmentTypes = async () => {
    try {
      const response = await fetch("/api/equipment-types")
      if (response.ok) {
        const data = await response.json()
        setEquipmentTypes(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des types:", error)
    }
  }

  const fetchUsers = async () => { // New function to fetch users
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchEquipment(), fetchEquipmentTypes(), fetchUsers()]) // Fetch users here
      setLoading(false)
    }
    loadData()
  }, [debouncedSearch, selectedType]) // Use debouncedSearch here

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      try {
        const response = await fetch(`/api/equipment/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchEquipment()
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEquipment(null)
    fetchEquipment()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEquipment(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher par référence, résident, secteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Tous les types</option>
            {equipmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ajouter du matériel
          </button>
        </div>

        {showForm && (
          <div className="mb-6 border-t pt-6">
            <EquipmentForm
              equipment={editingEquipment}
              equipmentTypes={equipmentTypes}
              users={users} // Pass users here
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chambre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Résident
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de reprise
                </th>
                {isAdmin(session) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin(session) ? 10 : 9} className="text-center py-4 text-gray-700">
                    Chargement...
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin(session) ? 10 : 9} className="text-center py-4 text-gray-500">
                    Aucun équipement trouvé
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <EquipmentItem
                    key={item.id}
                    equipment={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showUser={isAdmin(session)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}