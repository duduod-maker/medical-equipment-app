"use client"

import { useSession } from "next-auth/react"
import { canManageEquipment } from "@/lib/permissions"
import { Equipment } from "@/types/equipment";
import { useCart } from "@/context/CartContext";

interface EquipmentItemProps {
  equipment: Equipment
  onEdit: (equipment: Equipment) => void
  onDelete: (id: string) => void
  showUser?: boolean
}

export function EquipmentItem({ equipment, onEdit, onDelete, showUser }: EquipmentItemProps) {
  const { data: session } = useSession()
  const { addToCart } = useCart();

  const canManage = canManageEquipment(session, equipment.user.email === session?.user.email ? session.user.id : undefined)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR'); // Format date for French locale
  };

  const handleAddToCart = () => {
    addToCart({
      type: "DELIVERY",
      equipmentId: equipment.id,
      equipmentInfo: `${equipment.type.name} - ${equipment.reference}`,
    });
    alert(`${equipment.type.name} a été ajouté au panier.`);
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {equipment.type.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {equipment.reference || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {equipment.sector}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {equipment.room}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {equipment.resident}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(equipment.deliveryDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(equipment.returnDate)}
      </td>
      {showUser && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {equipment.user.name || equipment.user.email}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className="text-green-600 hover:text-green-900"
          >
            Mise au panier
          </button>
          {canManage && (
            <>
              <button
                onClick={() => onEdit(equipment)}
                className="text-blue-600 hover:text-blue-900"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(equipment.id)}
                className="text-red-600 hover:text-red-900"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}