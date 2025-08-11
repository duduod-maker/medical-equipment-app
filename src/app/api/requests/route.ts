import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"
import { RequestType, Role } from "@prisma/client"
import nodemailer from "nodemailer"

interface RequestItemInput {
  type: RequestType;
  description?: string;
  equipmentId?: string | null;
}

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
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des demandes:", error);
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

    const newRequest = await prisma.request.create({
      data: {
        notes,
        userId: requestUserId, // Use determined userId
        items: {
          create: items.map((item: RequestItemInput) => ({
            type: item.type,
            description: item.description,
            equipmentId: item.equipmentId || null,
          })),
        },
      },
      include: {
        user: true,
        items: {
          include: {
            equipment: {
              include: {
                type: true
              }
            }
          }
        }
      }
    })

    // --- Email sending logic ---
    try {
      const admins = await prisma.user.findMany({
        where: { role: Role.ADMIN },
      });
      const adminEmails = admins.map(admin => admin.email);
      const userEmail = newRequest.user.email;

      const allRecipients = [...new Set([...adminEmails, userEmail])];

      // Create a transporter object using the default SMTP transport
      // You need to set up your environment variables for this to work
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      const itemsHtml = newRequest.items.map(item => `
        <li>
          <b>Type:</b> ${item.type}<br/>
          <b>Description:</b> ${item.description}<br/>
          ${item.equipment ? `<b>Équipement:</b> ${item.equipment.type.name} - ${item.equipment.resident}<br/>` : ''}
        </li>
      `).join('');

      const mailOptions = {
        from: process.env.EMAIL_FROM, // sender address
        to: allRecipients.join(','), // list of receivers
        subject: `Nouvelle demande de matériel #${newRequest.id}`, // Subject line
        html: `
          <h1>Nouvelle demande de matériel</h1>
          <p>Une nouvelle demande a été créée par ${newRequest.user.name} (${newRequest.user.email}).</p>
          <h2>Détails de la demande:</h2>
          <ul>
            ${itemsHtml}
          </ul>
          <p><b>Notes:</b> ${newRequest.notes || 'Aucune'}</p>
          <p>Vous pouvez consulter la demande sur le portail.</p>
        `, // html body
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");

    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // We don't want to fail the request if the email fails
      // but we log the error.
    }
    // --- End of email sending logic ---

    return NextResponse.json(newRequest)
  } catch (error: unknown) {
    console.error("Erreur lors de la soumission de la demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la demande" },
      { status: 500 }
    )
  }
}