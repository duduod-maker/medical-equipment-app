import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_IMPORT,
    },
  },
});

const CSV_FILE_PATH = 'K:/medical-equipment-app/data/equipment.csv'; // Assurez-vous que le nom du fichier est correct

function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length === 3) {
    // Assumes DD/MM/YYYY format
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    // Check if the date is valid (e.g., not "31/02/2023")
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }
  return null; // Invalid format or date
}

function parseWeight(weightString: string | undefined | null): number | null {
  if (!weightString || weightString.trim() === '') return null;
  
  // Remove any non-numeric characters except dots and commas
  const cleanWeight = weightString.toString().replace(/[^\d.,]/g, '');
  
  // Replace comma with dot for decimal parsing
  const normalizedWeight = cleanWeight.replace(',', '.');
  
  const weight = parseFloat(normalizedWeight);
  
  // Validate the weight is a positive number
  if (isNaN(weight) || weight < 0) {
    return null;
  }
  
  return weight;
}

async function importEquipment() {
  console.log('Démarrage de l\'importation des équipements...');

  const records: any[] = [];
  const parser = fs
    .createReadStream(CSV_FILE_PATH)
    .pipe(parse({ columns: true, skip_empty_lines: true, delimiter: ';', bom: true }));

  parser.on('data', (record) => {
    records.push(record);
  });

  parser.on('end', async () => {
    console.log(`Lecture de ${records.length} enregistrements CSV terminée.`);

    for (const record of records) {
      try {
        const user = await prisma.user.findFirst({
          where: { name: record.userId }, // Assuming 'userId' column in CSV contains user's name
        });

        if (!user) {
          console.warn(`Avertissement: Utilisateur '${record.userId}' non trouvé pour l'enregistrement ${JSON.stringify(record)}. L'enregistrement sera ignoré.`);
          continue;
        }

        const equipmentType = await prisma.equipmentType.findUnique({
          where: { name: record.TypeId }, // Assuming 'TypeId' column in CSV contains equipment type's name
        });

        if (!equipmentType) {
          console.warn(`Avertissement: Type d'équipement '${record.typeId}' non trouvé pour l'enregistrement ${JSON.stringify(record)}. L'enregistrement sera ignoré.`);
          continue;
        }

        const deliveryDate = parseDate(record.deliveryDate);
        const returnDate = parseDate(record.returnDate);
        const weight = parseWeight(record.weight || record.poids); // Support both 'weight' and 'poids' columns

        await prisma.equipment.create({
          data: {
            reference: record.reference,
            sector: record.sector,
            room: record.room,
            resident: record.resident,
            weight: weight,
            deliveryDate: deliveryDate,
            returnDate: returnDate,
            userId: user.id,
            typeId: equipmentType.id,
          },
        });
        console.log(`Équipement ${record.reference || record.id} importé.`);

      } catch (error) {
        console.error(`Erreur lors de l\'importation de l\'enregistrement ${JSON.stringify(record)}:`, error);
      }
    }

    console.log('Importation des équipements terminée.');
    await prisma.$disconnect();
  });

  parser.on('error', (err) => {
    console.error('Erreur lors de la lecture du fichier CSV:', err.message);
  });
}

importEquipment();