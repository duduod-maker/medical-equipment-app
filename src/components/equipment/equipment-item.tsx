"use client"

import { useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<"DELIVERY" | "PICKUP" | "REPAIR">("DELIVERY");

  const canManage = canManageEquipment(session, equipment.user.email === session?.user.email ? session.user.id : undefined)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAddToCart = () => {
    addToCart({
      type: requestType,
      equipmentId: equipment.id,
      equipmentInfo: `${equipment.type.name} - ${equipment.reference} - Résident: ${equipment.resident} - Chambre: ${equipment.room}`,
    });
    alert(`${equipment.type.name} a été ajouté au panier.`);
    handleCloseModal();
  };

  return (
    <>
      <tr>
        <td className="px-4 py-4 text-sm font-medium text-gray-900">
          {equipment.type.name}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {equipment.reference || "-"}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {equipment.sector}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {equipment.room}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {equipment.resident}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {formatDate(equipment.deliveryDate)}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {formatDate(equipment.returnDate)}
        </td>
        {showUser && (
          <td className="px-4 py-4 text-sm text-gray-500">
            {equipment.user.name || equipment.user.email}
          </td>
        )}
        <td className="px-4 py-4 text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={handleOpenModal}
              className="text-green-600 hover:text-green-900"
            >
              Panier
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">Type de demande</h2>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as any)}
              className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="DELIVERY">Livraison</option>
              <option value="PICKUP">Reprise</option>
              <option value="REPAIR">Dépannage</option>
            </select>
            <div className="flex justify-end space-x-4">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Annuler</button>
              <button onClick={handleConfirmAddToCart} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}