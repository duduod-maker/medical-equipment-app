import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const equipmentTypes = await prisma.equipmentType.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(equipmentTypes)
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des types de matériel" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { name } = body

    const equipmentType = await prisma.equipmentType.create({
      data: { name },
    })

    return NextResponse.json(equipmentType)
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du type de matériel" },
      { status: 500 }
    )
  }
}