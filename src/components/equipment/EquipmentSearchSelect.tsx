"use client"

import { useState, useEffect, useRef } from "react"

interface EquipmentSearchSelectProps {
  equipment: Equipment[]
  onSelect: (equipment: Equipment) => void // Change to pass the whole equipment object
  selectedEquipmentId: string
}

export function EquipmentSearchSelect({ equipment, onSelect, selectedEquipmentId }: EquipmentSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredEquipment(equipment)
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      const filtered = equipment.filter(eq =>
        eq.type.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        eq.resident.toLowerCase().includes(lowerCaseSearchTerm) ||
        eq.sector.toLowerCase().includes(lowerCaseSearchTerm) ||
        (eq.reference && eq.reference.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (eq.user.name && eq.user.name.toLowerCase().includes(lowerCaseSearchTerm)) || // Search by user name
        eq.user.email.toLowerCase().includes(lowerCaseSearchTerm) // Search by user email
      )
      setFilteredEquipment(filtered)
    }
  }, [searchTerm, equipment])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  const handleSelect = (eq: Equipment) => {
    onSelect(eq) // Pass the whole equipment object
    setSearchTerm(`${eq.type.name} - ${eq.resident} (${eq.sector})${eq.reference ? ` - ${eq.reference}` : ''} - ${eq.user.name || eq.user.email}`)
    setIsOpen(false)
  }

  const displayValue = selectedEquipmentId 
    ? equipment.find(eq => eq.id === selectedEquipmentId) 
      ? `${equipment.find(eq => eq.id === selectedEquipmentId)?.type.name} - ${equipment.find(eq => eq.id === selectedEquipmentId)?.resident} (${equipment.find(eq => eq.id === selectedEquipmentId)?.sector})${equipment.find(eq => eq.id === selectedEquipmentId)?.reference ? ` - ${equipment.find(eq => eq.id === selectedEquipmentId)?.reference}` : ''} - ${equipment.find(eq => eq.id === selectedEquipmentId)?.user.name || equipment.find(eq => eq.id === selectedEquipmentId)?.user.email}`
      : searchTerm // Fallback to search term if selected equipment not found (e.g., after initial load)
    : searchTerm

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Rechercher un équipement..."
        value={displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          onSelect({} as Equipment) // Clear selected ID when typing, pass empty object or null
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      />
      {isOpen && searchTerm.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {filteredEquipment.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">Aucun résultat</li>
          ) : (
            filteredEquipment.map(eq => (
              <li
                key={eq.id}
                onClick={() => handleSelect(eq)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
              >
                {eq.type.name} - {eq.resident} ({eq.sector})
                {eq.reference && ` - ${eq.reference}`}
                <span className="text-xs text-gray-500 ml-2">({eq.user.name || eq.user.email})</span> {/* Display user info */}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}



