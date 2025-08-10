"use client"

import { useState, useEffect } from "react"
import { EquipmentSearchSelect } from "../equipment/EquipmentSearchSelect" // Import the new component
import { useSession } from "next-auth/react"; // Import useSession
import { isAdmin } from "@/lib/permissions"; // Import isAdmin

interface EquipmentType {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  reference?: string;
  sector: string;
  room: string;
  resident: string;
  deliveryDate?: string; // Assuming date comes as string
  returnDate?: string; // Assuming date comes as string
  typeId: string;
  type: EquipmentType;
  userId: string;
  user: { name: string; email: string }; // Simplified user for now
}

interface CartItem {
  id?: string; // Add id property
  type: "DELIVERY" | "PICKUP" | "REPAIR"
  description: string
  equipmentId?: string
  equipmentInfo?: string
  userId?: string;
}

const REQUEST_TYPES = {
  DELIVERY: "Livraison",
  PICKUP: "Reprise",
  REPAIR: "Dépannage",
}

interface User { // Define User interface
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface CartProps {
  users: User[]; // Add users prop
}

export function Cart({ users }: CartProps) { // Accept users prop
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch("/api/equipment")
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement du matériel:", error)
    }
  }

  const addToCart = (item: CartItem) => {
    setCartItems([...cartItems, { ...item, id: Date.now().toString() }])
  }

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const submitRequest = async () => {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          notes,
        }),
      })

      if (response.ok) {
        setCartItems([])
        setNotes("")
        alert("Demande soumise avec succès!")
        window.location.reload()
      } else {
        alert("Erreur lors de la soumission de la demande")
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la soumission de la demande:", error);
      alert("Erreur lors de la soumission de la demande")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Panier de demandes
      </h2>

      <div className="space-y-4 mb-6">
        <NewRequestForm onAdd={addToCart} equipment={equipment} users={users} /> {/* Pass users to NewRequestForm */}
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Éléments dans le panier ({cartItems.length})
            </h3>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start bg-gray-50 p-3 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {REQUEST_TYPES[item.type]}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </div>
                    {item.equipmentInfo && (
                      <div className="text-xs text-gray-700 mt-1">
                        {item.equipmentInfo}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-600 hover:text-red-800 text-sm ml-2"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Informations complémentaires..."
            />
          </div>

          <button
            onClick={submitRequest}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Soumission..." : "Soumettre la demande"}
          </button>
        </>
      )}
    </div>
  )
}

interface NewRequestFormProps {
  onAdd: (item: CartItem) => void
  equipment: Equipment[]
  users: User[]; // Add users prop
}

function NewRequestForm({ onAdd, equipment, users }: NewRequestFormProps) { // Accept users prop
  const { data: session } = useSession(); // Get session data
  const [type, setType] = useState<CartItem["type"]>("DELIVERY")
  const [description, setDescription] = useState("")
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState(""); // New state for userId

  useEffect(() => {
    if (users.length > 0 && isAdmin(session)) {
      setSelectedUserId(users[0].id); // Set default user to the first one if admin
    }
  }, [users, session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedEquipment = equipment.find(eq => eq.id === selectedEquipmentId)
    const equipmentInfo = selectedEquipment 
      ? `${selectedEquipment.type.name} - ${selectedEquipment.resident} (${selectedEquipment.sector})`
      : undefined

    onAdd({
      type,
      description: description || undefined, // Pass undefined if empty
      equipmentId: selectedEquipmentId || undefined,
      equipmentInfo,
      userId: isAdmin(session) && selectedUserId ? selectedUserId : undefined, // Add userId to CartItem
    })

    setDescription("")
    setSelectedEquipmentId("")
    if (isAdmin(session) && users.length > 0) {
      setSelectedUserId(users[0].id); // Reset to default user if admin
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type de demande
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as CartItem["type"])}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          <option value="DELIVERY">Livraison</option>
          <option value="PICKUP">Reprise</option>
          <option value="REPAIR">Dépannage</option>
        </select>
      </div>

      {(type === "DELIVERY" || type === "PICKUP" || type === "REPAIR") && (
        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
            Équipement concerné (optionnel)
          </label>
          <EquipmentSearchSelect 
            equipment={equipment} 
            onSelect={(selectedEq) => { // Receive the full equipment object
              setSelectedEquipmentId(selectedEq.id);
              if (isAdmin(session)) { // Only update userId if admin
                setSelectedUserId(selectedEq.userId);
              }
            }} 
            selectedEquipmentId={selectedEquipmentId} 
          />
        </div>
      )}

      {isAdmin(session) && ( // Only show user selection for admins
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            Assigner à l&apos;utilisateur *
          </label>
          <select
            id="userId"
            required
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={2}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="Décrivez votre demande..."
        />
      </div>

      <button
        type="submit"
        className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Ajouter au panier
      </button>
    </form>
  )
}