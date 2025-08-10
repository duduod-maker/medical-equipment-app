import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function GET(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = context.params.id;

    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id },
    })

    if (!equipmentType) {
      return NextResponse.json({ error: "Type de matériel non trouvé" }, { status: 404 })
    }

    return NextResponse.json(equipmentType)
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération du type de matériel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du type de matériel" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const id = context.params.id;
    const body = await request.json()
    const { name } = body

    const updatedEquipmentType = await prisma.equipmentType.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(updatedEquipmentType)
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du type de matériel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du type de matériel" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const id = context.params.id;

    await prisma.equipmentType.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Type de matériel supprimé" })
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression du type de matériel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du type de matériel" },
      { status: 500 }
    )
  }
}
