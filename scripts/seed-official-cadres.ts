import { db } from '../lib/db';

async function seedCadres() {
  console.log('Seeding official JB Infra cadres: ME, MM, SMM, AGM, DGM, GM...');

  const requiredCadres = [
    { name: 'ME', level: 1, is_confidential: false },
    { name: 'MM', level: 2, is_confidential: false },
    { name: 'SMM', level: 3, is_confidential: false },
    { name: 'AGM', level: 4, is_confidential: false },
    { name: 'DGM', level: 5, is_confidential: false },
    { name: 'GM', level: 6, is_confidential: false },
  ];

  for (const c of requiredCadres) {
    const cadre = await db.cadre.upsert({
      where: { name: c.name },
      update: { level: c.level, is_confidential: c.is_confidential },
      create: c,
    });
    console.log(`✓ Cadre ready: ${cadre.name} (id: ${cadre.id}, level: ${cadre.level})`);
  }

  const allCadres = await db.cadre.findMany({
    orderBy: { level: 'asc' },
  });

  console.log('Current Cadres in Database:');
  console.table(allCadres.map((c) => ({ id: c.id, name: c.name, level: c.level })));
}

seedCadres()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  });
