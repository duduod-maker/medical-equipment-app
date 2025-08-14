import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { EquipmentForm } from "./equipment-form"
import { EquipmentItem } from "././equipment-item"
import { isAdmin } from "@/lib/permissions"
import { User } from "@/types/equipment" // Assuming User type is here or similar
import { UserSearchSelect } from "@/components/user/UserSearchSelect"

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
  const [selectedUser, setSelectedUser] = useState("") // New state for user filter
  const [deliveryDateSearch, setDeliveryDateSearch] = useState("") // New state for delivery date search
  const [returnDateSearch, setReturnDateSearch] = useState("") // New state for return date search
  const [showInStockOnly, setShowInStockOnly] = useState(true) // New state for in-stock filter
  const [showForm, setShowForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/equipment-types")
      if (response.ok) {
        const data = await response.json()
        setEquipmentTypes(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des types:", error)
    }
  }, [setEquipmentTypes]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    }
  }, [setUsers]);

  useEffect(() => {
    console.log("Fetching equipment due to dependency change (direct dependencies)..."); // Added for debugging
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedType) params.append("type", selectedType);
    if (selectedUser) params.append("userId", selectedUser);
    if (deliveryDateSearch) params.append("deliveryDate", deliveryDateSearch); // Add deliveryDate to params
    if (returnDateSearch) params.append("returnDate", returnDateSearch);     // Add returnDate to params
    if (showInStockOnly) params.append("inStock", "true"); // Add inStock to params

    fetch(`/api/equipment?${params}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setEquipment(data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement du matériel:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedSearch, selectedType, selectedUser, deliveryDateSearch, returnDateSearch, showInStockOnly, setEquipment]); // Add new dependencies

  useEffect(() => {
    fetchEquipmentTypes();
    fetchUsers();
  }, [fetchEquipmentTypes, fetchUsers]);

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
          setEquipment((prevEquipment) =>
            prevEquipment.filter((item) => item.id !== id)
          )
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEquipment(null)
    // No longer calling fetchEquipment() directly here, as it's now part of useEffect
    // The useEffect will re-run when dependencies change, but not directly after success
    // For immediate refresh after success, you might need to manually trigger fetchEquipment
    // or update the equipment state directly. For now, relying on next render.
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEquipment(null)
  }

  const handleUserSelect = (userId: string) => {
    console.log("Selected User ID:", userId); // Added for debugging
    setSelectedUser(userId);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center flex-wrap sm:justify-center">
          <input
            type="text"
            placeholder="Rechercher par référence, résident, secteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 no-print"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 no-print"
          >
            <option value="">Tous les types</option>
            {equipmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={deliveryDateSearch}
            onChange={(e) => setDeliveryDateSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 no-print"
            title="Date de livraison (à partir de cette date)"
          />
          <input
            type="date"
            value={returnDateSearch}
            onChange={(e) => setReturnDateSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 no-print"
            title="Date de reprise (jusqu'à cette date)"
          />
          {isAdmin(session) && (
            <select
              value={selectedUser}
              onChange={(e) => handleUserSelect(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 no-print"
            >
              <option value="">Tous les utilisateurs</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center no-print px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input
              type="checkbox"
              id="showInStockOnly"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showInStockOnly" className="ml-2 text-gray-700">
              En stock
            </label>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 no-print"
          >
            Ajouter
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 no-print"
          >
            Imprimer
          </button>
        </div>

        <div className="text-right text-sm text-gray-600 mb-4">
          Affichage de {equipment.length} équipement(s)
        </div>

        {showForm && (
          <div className="mb-6 border-t pt-6 no-print">
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
          <table className="divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chambre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Résident
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de livraison
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de reprise
                </th>
                {isAdmin(session) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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