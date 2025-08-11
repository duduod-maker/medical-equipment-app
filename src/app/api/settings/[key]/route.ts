import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

interface Params {
  key: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const setting = await prisma.setting.findUnique({
      where: { key: params.key },
    })

    if (!setting) {
      return NextResponse.json({ error: "Paramètre non trouvé" }, { status: 404 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error(`Erreur lors de la récupération du paramètre ${params.key}:`, error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { value } = body

    const updatedSetting = await prisma.setting.update({
      where: { key: params.key },
      data: { value },
    })

    return NextResponse.json(updatedSetting)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du paramètre ${params.key}:`, error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
