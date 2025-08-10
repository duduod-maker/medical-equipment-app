import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add id property
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
  }
}