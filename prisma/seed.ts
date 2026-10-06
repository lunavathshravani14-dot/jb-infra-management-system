import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding JB Infra Management System database...');

  // 1. Seed Cadres
  const cadresData = [
    { name: 'ME', level: 1, is_confidential: false },
    { name: 'MM', level: 2, is_confidential: false },
    { name: 'SMM', level: 3, is_confidential: false },
    { name: 'AGM', level: 4, is_confidential: false },
    { name: 'DGM', level: 5, is_confidential: false },
    { name: 'GM', level: 6, is_confidential: false },
    { name: 'ED', level: 7, is_confidential: false },
    { name: 'CED', level: 8, is_confidential: true }, // Confidential Admin-only
  ];

  const cadres: Record<string, any> = {};
  for (const c of cadresData) {
    cadres[c.name] = await prisma.cadre.upsert({
      where: { name: c.name },
      update: { level: c.level, is_confidential: c.is_confidential },
      create: c,
    });
  }
  console.log('Cadres seeded:', Object.keys(cadres));

  // 2. Seed ID Sequences: JBIN 6-digit series
  await prisma.idSequence.upsert({
    where: { series_name: 'DEFAULT' },
    update: {
      prefix: 'JBIN',
      pattern: '{PREFIX}{SERIAL:6}',
    },
    create: {
      series_name: 'DEFAULT',
      prefix: 'JBIN',
      current_value: 0,
      pattern: '{PREFIX}{SERIAL:6}',
      is_active: true,
    },
  });

  await prisma.idSequence.upsert({
    where: { series_name: 'JBIN' },
    update: {
      prefix: 'JBIN',
      pattern: '{PREFIX}{SERIAL:6}',
    },
    create: {
      series_name: 'JBIN',
      prefix: 'JBIN',
      current_value: 0,
      pattern: '{PREFIX}{SERIAL:6}',
      is_active: true,
    },
  });

  await prisma.idSequence.upsert({
    where: { series_name: 'LEGACY_SERIES' },
    update: {},
    create: {
      series_name: 'LEGACY_SERIES',
      prefix: 'JB',
      current_value: 10250,
      pattern: '{PREFIX}{SERIAL}',
      is_active: true,
    },
  });
  console.log('ID Sequences seeded with JBIN 6-digit series');

  // 3. Seed Users with various RBAC roles
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const usersData = [
    { username: 'superadmin', email: 'superadmin@jbinfra.com', role: 'SUPER_ADMIN' },
    { username: 'admin', email: 'admin@jbinfra.com', role: 'ADMIN' },
    { username: 'kycadmin', email: 'kycadmin@jbinfra.com', role: 'KYC_ADMIN' },
    { username: 'cadreadmin', email: 'cadreadmin@jbinfra.com', role: 'CADRE_ADMIN' },
    { username: 'restrictedadmin', email: 'restricted@jbinfra.com', role: 'RESTRICTED_ADMIN' },
    { username: 'executive_user', email: 'executive@jbinfra.com', role: 'EXECUTIVE' },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { role: u.role, password_hash: passwordHash },
      create: {
        username: u.username,
        email: u.email,
        role: u.role,
        password_hash: passwordHash,
      },
    });
  }
  console.log('Users seeded');

  // 4. Seed Executive Director (ED)
  const edPerson = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261001' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261001',
      full_name: 'Rajesh Sharma',
      dob: new Date('1978-04-12'),
      mobile: '9876543210',
      whatsapp: '9876543210',
      email: 'rajesh.sharma@jbinfra.com',
      address: 'Plot 42, Jubilee Hills, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: edPerson.id,
      cadre_id: cadres['ED'].id,
      joining_date: new Date('2022-01-10'),
      promotion_date: new Date('2024-03-15'),
      is_current: true,
      changed_by: 'SuperAdmin',
      remarks: 'Promoted to Executive Director for outstanding regional growth.',
    },
  });

  // 5. Seed General Managers (GMs) reporting to ED
  const gm1 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261002' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261002',
      full_name: 'Vikram Verma',
      dob: new Date('1984-07-22'),
      mobile: '9876543211',
      whatsapp: '9876543211',
      email: 'vikram.verma@jbinfra.com',
      address: 'Road No 12, Banjara Hills, Hyderabad',
      status: 'ACTIVE',
    },
  });

  // Historical career progression for GM1: Manager -> GM (Same permanent ID!)
  await prisma.cadreHistory.create({
    data: {
      person_id: gm1.id,
      cadre_id: cadres['Manager'].id,
      joining_date: new Date('2023-02-01'),
      is_current: false,
      end_date: new Date('2025-01-15'),
      changed_by: 'SuperAdmin',
      remarks: 'Initial joining as Manager',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: gm1.id,
      cadre_id: cadres['GM'].id,
      joining_date: new Date('2023-02-01'),
      promotion_date: new Date('2025-01-15'),
      is_current: true,
      changed_by: 'SuperAdmin',
      remarks: 'Promoted to GM. Permanent ID JB20261002 preserved.',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: gm1.id,
      reporting_person_id: edPerson.id,
      is_current: true,
    },
  });

  const gm2 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261003' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261003',
      full_name: 'Suresh Reddy',
      dob: new Date('1982-11-15'),
      mobile: '9876543212',
      whatsapp: '9876543212',
      email: 'suresh.reddy@jbinfra.com',
      address: 'Madhapur, Hitech City, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: gm2.id,
      cadre_id: cadres['GM'].id,
      joining_date: new Date('2023-05-10'),
      is_current: true,
      changed_by: 'SuperAdmin',
      remarks: 'Direct joining as GM',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: gm2.id,
      reporting_person_id: edPerson.id,
      is_current: true,
    },
  });

  // 6. Seed Managers reporting to GMs
  const mgr1 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261004' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261004',
      full_name: 'Anita Rao',
      dob: new Date('1989-03-08'),
      mobile: '9876543213',
      whatsapp: '9876543213',
      email: 'anita.rao@jbinfra.com',
      address: 'Kukatpally Housing Board, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: mgr1.id,
      cadre_id: cadres['Manager'].id,
      joining_date: new Date('2024-01-05'),
      is_current: true,
      changed_by: 'Admin',
      remarks: 'Manager North Zone',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: mgr1.id,
      reporting_person_id: gm1.id,
      is_current: true,
    },
  });

  const mgr2 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261005' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261005',
      full_name: 'Manoj Kumar',
      dob: new Date('1988-09-19'),
      mobile: '9876543214',
      whatsapp: '9876543214',
      email: 'manoj.kumar@jbinfra.com',
      address: 'Gachibowli, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: mgr2.id,
      cadre_id: cadres['Manager'].id,
      joining_date: new Date('2024-04-12'),
      is_current: true,
      changed_by: 'Admin',
      remarks: 'Manager South Zone',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: mgr2.id,
      reporting_person_id: gm2.id,
      is_current: true,
    },
  });

  // 7. Seed Executives reporting to Managers
  const exec1 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261006' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261006',
      full_name: 'Amit Patel',
      dob: new Date('1994-01-25'),
      mobile: '9876543215',
      whatsapp: '9876543215',
      email: 'amit.patel@jbinfra.com',
      address: 'Kondapur, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: exec1.id,
      cadre_id: cadres['Executive'].id,
      joining_date: new Date('2024-06-01'),
      is_current: true,
      changed_by: 'Admin',
      remarks: 'Site Sales Executive',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: exec1.id,
      reporting_person_id: mgr1.id,
      is_current: true,
    },
  });

  const exec2 = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261007' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261007',
      full_name: 'Sneha Kulkarni',
      dob: new Date('1996-08-14'),
      mobile: '9876543216',
      whatsapp: '9876543216',
      email: 'sneha.kulkarni@jbinfra.com',
      address: 'Miyapur, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: exec2.id,
      cadre_id: cadres['Executive'].id,
      joining_date: new Date('2024-07-15'),
      is_current: true,
      changed_by: 'Admin',
      remarks: 'Customer Relations Executive',
    },
  });

  await prisma.reportingRelationship.create({
    data: {
      person_id: exec2.id,
      reporting_person_id: mgr2.id,
      is_current: true,
    },
  });

  // Link executive user account to exec1
  await prisma.user.update({
    where: { username: 'executive_user' },
    data: { person_id: exec1.id },
  });

  // 8. Seed Confidential CED member (Hidden from general Admins)
  const cedPerson = await prisma.person.upsert({
    where: { permanent_unique_id: 'JB20261099' },
    update: {},
    create: {
      permanent_unique_id: 'JB20261099',
      full_name: 'Devendra Singhania',
      dob: new Date('1970-12-05'),
      mobile: '9876543299',
      whatsapp: '9876543299',
      email: 'devendra.s@jbinfra.com',
      address: 'Secretariat Road, Hyderabad',
      status: 'ACTIVE',
    },
  });

  await prisma.cadreHistory.create({
    data: {
      person_id: cedPerson.id,
      cadre_id: cadres['CED'].id,
      joining_date: new Date('2020-01-01'),
      is_current: true,
      changed_by: 'SuperAdmin',
      remarks: 'Confidential Senior Advisor (CED)',
    },
  });

  // 9. Seed Pending Enrollment Application for Admin split-screen review demo
  const pendingEnrollment = await prisma.enrollment.upsert({
    where: { application_number: 'APP2026-001' },
    update: {
      status: 'PENDING_REVIEW',
      person_id: null,
      reviewed_at: null,
      reviewed_by: null,
    },
    create: {
      application_number: 'APP2026-001',
      full_name: 'Ramesh Chander',
      dob: new Date('1995-05-18'),
      mobile: '9812345678',
      whatsapp: '9812345678',
      email: 'ramesh.c@gmail.com',
      address: 'Flat 304, Cyber Heights, HITEC City, Hyderabad',
      requested_cadre_id: cadres['Executive'].id,
      team: 'West Hyderabad Sales',
      reporting_person_id: mgr1.id,
      status: 'PENDING_REVIEW',
      submitted_at: new Date(),
    },
  });

  // Re-create sample KYC document records for the enrollment
  await prisma.kycDocument.deleteMany({
    where: { enrollment_id: pendingEnrollment.id },
  });

  await prisma.kycDocument.create({
    data: {
      enrollment_id: pendingEnrollment.id,
      document_type: 'AADHAAR',
      document_number_masked: 'XXXX XXXX 8842',
      file_path: 'sample_docs/aadhaar_sample.pdf',
      file_size: 142050,
      mime_type: 'application/pdf',
      version: 1,
      status: 'PENDING',
    },
  });

  await prisma.kycDocument.create({
    data: {
      enrollment_id: pendingEnrollment.id,
      document_type: 'PAN',
      document_number_masked: 'XXXXXX552K',
      file_path: 'sample_docs/pan_sample.pdf',
      file_size: 98400,
      mime_type: 'application/pdf',
      version: 1,
      status: 'PENDING',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
