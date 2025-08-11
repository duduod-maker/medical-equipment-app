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
        user: { select: { id: true, name: true, email: true } },
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
      const emailSetting = await prisma.setting.findUnique({
        where: { key: 'email_notifications' },
      });

      if (emailSetting && emailSetting.value === 'true') {
        const admins = await prisma.user.findMany({
          where: { role: Role.ADMIN },
        });
        const adminEmails = admins.map(admin => admin.email);
        const userEmail = newRequest.user.email;

        const allRecipients = [...new Set([...adminEmails, userEmail])];

        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        const REQUEST_TYPE_FR = {
          DELIVERY: "Livraison",
          PICKUP: "Reprise",
          REPAIR: "Dépannage",
        };

        const itemsHtml = newRequest.items.map(item => {
          const equipmentDetails = item.equipment
            ? `
            <p style="margin: 0; padding-left: 10px;">
              <strong>Équipement :</strong> ${item.equipment.type.name} - ${item.equipment.resident}<br>
              <strong>Secteur :</strong> ${item.equipment.sector}<br>
              <strong>Chambre :</strong> ${item.equipment.room}
            </p>`
            : '';

          return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              <p style="margin: 0;"><strong>Type :</strong> ${REQUEST_TYPE_FR[item.type]}</p>
              <p style="margin: 0;"><strong>Description :</strong> ${item.description || 'N/A'}</p>
              ${equipmentDetails}
            </td>
          </tr>`;
        }).join('');

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: allRecipients.join(','),
          subject: `Nouvelle demande de matériel #${newRequest.id}`,
          html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #0056b3;">Nouvelle demande de matériel</h1>
            <p>Une nouvelle demande a été créée par <strong>${newRequest.user.name}</strong> (${newRequest.user.email}).</p>
            <h2 style="color: #0056b3;">Détails de la demande</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 10px; border-bottom: 2px solid #0056b3; text-align: left;">Détails</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <h2 style="color: #0056b3;">Notes</h2>
            <p>${newRequest.notes || 'Aucune'}</p>
            <p style="margin-top: 20px; font-size: 0.9em; color: #555;">
              Vous pouvez consulter la demande sur le portail.
            </p>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } else {
        console.log("Email notifications are disabled.");
      }

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