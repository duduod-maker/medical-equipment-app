"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isAdmin, canManageRequest } from "@/lib/permissions" // Add canManageRequest

interface Request {
  id: string
  status: "PENDING" | "ACKNOWLEDGED" | "IN_PREPARATION" | "COMPLETED"
  notes?: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
  items: Array<{
    id: string
    type: "DELIVERY" | "PICKUP" | "REPAIR"
    description: string
    equipment?: {
      type: { name: string }
      resident: string
      sector: string
      room: string // Add this line
      reference?: string
    }
  }>
}

const STATUS_LABELS = {
  PENDING: "En attente",
  ACKNOWLEDGED: "Prise en compte",
  IN_PREPARATION: "En cours de préparation",
  COMPLETED: "Terminée",
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACKNOWLEDGED: "bg-blue-100 text-blue-800",
  IN_PREPARATION: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
}

const REQUEST_TYPES = {
  DELIVERY: "Livraison",
  PICKUP: "Reprise",
  REPAIR: "Dépannage",
}

export function RequestsList() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [editableNotes, setEditableNotes] = useState<{ [key: string]: string }>({}); // State for editable notes

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleNotesChange = (requestId: string, newNotes: string) => {
    setEditableNotes(prev => ({
      ...prev,
      [requestId]: newNotes,
    }));
  };

  const handleSaveNotes = async (requestId: string) => {
    const notesToSave = editableNotes[requestId];
    if (notesToSave === undefined) return; // No changes to save

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: notesToSave }),
      });

      if (response.ok) {
        // Update the original request in state to reflect saved notes
        setRequests(prevRequests => prevRequests.map(req =>
          req.id === requestId ? { ...req, notes: notesToSave } : req
        ));
        // Clear the editable state for this request
        setEditableNotes(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      } else {
        console.error("Erreur lors de la sauvegarde des notes");
        alert("Erreur lors de la sauvegarde des notes");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
      alert("Erreur lors de la sauvegarde des notes");
    }
  };

  const updateStatus = async (requestId: string, newStatus: Request["status"]) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
    }
  }

  const deleteRequest = async (requestId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      try {
        const response = await fetch(`/api/requests/${requestId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchRequests()
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Vos demandes ({requests.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {requests.map((request) => (
          <div key={request.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      STATUS_COLORS[request.status]
                    }`}
                  >
                    {STATUS_LABELS[request.status]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                {isAdmin(session) && (
                  <div className="mt-1 text-sm text-gray-600">
                    Par: {request.user.name || request.user.email}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {isAdmin(session) && (
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(request.id, e.target.value as Request["status"])}
                    className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="ACKNOWLEDGED">Prise en compte</option>
                    <option value="IN_PREPARATION">En cours de préparation</option>
                    <option value="COMPLETED">Terminée</option>
                  </select>
                )}
                
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {request.items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium text-sm text-blue-600">
                        {REQUEST_TYPES[item.type]}
                      </span>
                      <p className="text-sm text-gray-900 mt-1">{item.description}</p>
                      {item.equipment && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.equipment.type.name} - {item.equipment.resident} ({item.equipment.sector}, {item.equipment.room})
                          {item.equipment.reference && ` - ${item.equipment.reference}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded">
              <label htmlFor={`notes-${request.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Notes:
              </label>
              <textarea
                id={`notes-${request.id}`}
                rows={3}
                value={editableNotes[request.id] !== undefined ? editableNotes[request.id] : request.notes || ""}
                onChange={(e) => handleNotesChange(request.id, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={!canManageRequest(session, request.userId)} // Disable if not authorized
              />
              {canManageRequest(session, request.userId) && editableNotes[request.id] !== undefined && editableNotes[request.id] !== request.notes && (
                <button
                  onClick={() => handleSaveNotes(request.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Sauvegarder les notes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune demande trouvée
        </div>
      )}
    </div>
  )
}