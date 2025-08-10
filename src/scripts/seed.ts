import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
      name: "Administrateur",
    },
  })

  const userPassword = await bcrypt.hash("user123", 12)
  
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      role: Role.USER,
      name: "Utilisateur Test",
    },
  })

  const equipmentTypes = [
    "Lit médicalisé",
    "Fauteuil roulant",
    "Déambulateur",
    "Matelas anti-escarres",
    "Lève-personne",
    "Concentrateur d'oxygène",
    "Aspirateur médical",
    "Moniteur de tension",
  ]

  for (const typeName of equipmentTypes) {
    await prisma.equipmentType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    })
  }

  console.log("Database seeded successfully!")
  console.log("Admin: admin@example.com / admin123")
  console.log("User: user@example.com / user123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })