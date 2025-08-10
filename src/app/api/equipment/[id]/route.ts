import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { canManageEquipment, isAdmin } from "@/lib/permissions"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("Params received:", params); // Debugging line
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params; // Revert to direct access

    const body = await request.json()
    const { typeId, reference, sector, room, resident, deliveryDate, returnDate, userId } = body

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json({ error: "Équipement non trouvé" }, { status: 404 })
    }

    // Only allow admin to change userId
    const newUserId = isAdmin(session) && userId ? userId : existingEquipment.userId;

    if (!canManageEquipment(session, existingEquipment.userId)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        typeId,
        reference: reference || null,
        sector,
        room,
        resident,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        userId: newUserId,
      },
      include: {
        type: true,
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updatedEquipment)
  } catch (error) {
    console.error("Error updating equipment:", error); // Add detailed error logging
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'équipement" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    })

    if (!equipment) {
      return NextResponse.json({ error: "Matériel non trouvé" }, { status: 404 })
    }

    if (!canManageEquipment(session, equipment.userId)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.equipment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Matériel supprimé avec succès" })
  } catch (error: unknown) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du matériel" },
      { status: 500 }
    )
  }
}
