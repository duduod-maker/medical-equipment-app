import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { canManageRequest, isAdmin } from "@/lib/permissions"

export async function PUT(
  request: Request,
  context: any
) {
  const { id } = context.params; // Access id directly
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const requestId = params.id;
    const body = await request.json()
    const { status, notes } = body // Add notes

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 })
    }

    if (!canManageRequest(session, existingRequest.userId)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        status,
        notes, // Update notes
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de la demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la demande" }, // Changed error message
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: any
) {
  const { id } = context.params; // Access id directly
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 })
    }

    if (!canManageRequest(session, existingRequest.userId) && !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.request.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Demande supprimée avec succès" })
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de la demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la demande" },
      { status: 500 }
    )
  }
}