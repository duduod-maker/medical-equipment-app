import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""

    const where = {
      ...(isAdmin(session) ? {} : { userId: session.user.id }),
      ...(search && {
        OR: [
          { reference: { contains: search, mode: 'insensitive' } },
          { resident: { contains: search, mode: 'insensitive' } },
          { sector: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(type !== '' && { typeId: { equals: type } }),
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        type: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(equipment)
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération du matériel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du matériel" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { typeId, reference, sector, room, resident, deliveryDate, returnDate, userId } = body // Add userId

    const equipment = await prisma.equipment.create({
      data: {
        typeId,
        reference: reference || null,
        sector,
        room,
        resident,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        userId: isAdmin(session) && userId ? userId : session.user.id, // Use provided userId if admin, else session user's ID
      },
      include: {
        type: true,
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(equipment)
  } catch (error: unknown) {
    console.error("Erreur lors de la création du matériel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du matériel" },
      { status: 500 }
    )
  }
}