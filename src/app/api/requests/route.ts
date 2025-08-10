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

    const where = {
      ...(isAdmin(session) ? {} : { userId: session.user.id }),
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            equipment: {
              include: {
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
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
    const { items, notes } = body

    // Determine userId: if admin and userId is provided in items, use it, otherwise use session.user.id
    const requestUserId = isAdmin(session) && items[0]?.userId ? items[0].userId : session.user.id;

    const requestData = await prisma.request.create({
      data: {
        notes,
        userId: requestUserId, // Use determined userId
        items: {
          create: items.map((item: any) => ({
            type: item.type,
            description: item.description,
            equipmentId: item.equipmentId || null,
          })),
        },
      },
    })

    return NextResponse.json(requestData)
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la demande" },
      { status: 500 }
    )
  }
}