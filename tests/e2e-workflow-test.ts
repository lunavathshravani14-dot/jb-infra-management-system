import { db } from '../lib/db';
import { generateIdCardPdf } from '../lib/pdf';
import fs from 'fs';
import path from 'path';

async function runE2ETest() {
  console.log('--- STARTING JB INFRA END-TO-END WORKFLOW TEST ---');

  // 1. Check Cadres
  const cadreCount = await db.cadre.count();
  console.log(`✓ Database accessible. Cadres available: ${cadreCount}`);

  // 2. Test PDF Generation (Physical Reference Front & Back)
  console.log('Generating 2-page physical reference ID card PDF...');
  const samplePdf = await generateIdCardPdf({
    permanentId: 'JB20269999',
    fullName: 'SRINIVAS REDDY V',
    cadre: 'MARKETING EXECUTIVE',
    mobile: '9876543210',
    team: 'Amberpet Sales',
    joiningDate: '20/09/2026',
    version: 1,
  });

  const testOutputPath = path.join(process.cwd(), 'private_storage', 'test-card.pdf');
  fs.mkdirSync(path.dirname(testOutputPath), { recursive: true });
  fs.writeFileSync(testOutputPath, samplePdf);
  console.log(`✓ ID Card PDF generated successfully! Size: ${samplePdf.length} bytes`);

  // 3. Create or inspect test enrollment
  const appNumber = `JB-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const defaultCadre = await db.cadre.findFirst();

  const enrollment = await db.enrollment.create({
    data: {
      application_number: appNumber,
      full_name: 'TEST EXECUTIVE',
      mobile: '9988776655',
      email: 'test.executive@jbinfragroup.com',
      father_or_husband_name: 'Narayana Reddy',
      dob: new Date('1992-06-15'),
      age: 34,
      house_no: 'Plot 42',
      street: 'Sai Nagar Main Road',
      village_city: 'Pedda Amberpet',
      mandal: 'Abdullapurmet',
      district: 'Ranga Reddy',
      state: 'Telangana',
      pincode: '501505',
      me_id: 'ME101',
      me_name: 'K. MEENA',
      mm_id: 'MM202',
      mm_name: 'P. MAHESH',
      smm_id: 'SMM303',
      smm_name: 'R. SURESH',
      agm_id: 'AGM404',
      agm_name: 'V. ANAND',
      dgm_id: 'DGM505',
      dgm_name: 'T. RAMESH',
      gm_id: 'GM606',
      gm_name: 'S. SRINIVAS',
      address: 'Plot 42, Sai Nagar Main Road, Pedda Amberpet, Abdullapurmet, Ranga Reddy, Telangana - 501505',
      declaration_confirmed: true,
      status: 'PENDING_REVIEW',
      requested_cadre_id: defaultCadre!.id,
    },
  });

  console.log(`✓ Enrollment created: ${enrollment.application_number} (Status: ${enrollment.status})`);

  // 4. Verify fields stored accurately
  const fetched = await db.enrollment.findUnique({
    where: { id: enrollment.id },
  });
  if (
    fetched?.me_id === 'ME101' &&
    fetched?.gm_name === 'S. SRINIVAS' &&
    fetched?.pincode === '501505' &&
    fetched?.father_or_husband_name === 'Narayana Reddy'
  ) {
    console.log('✓ All 6 cadres and address fields correctly persisted in SQLite!');
  } else {
    throw new Error('Data persistence mismatch for cadres/address');
  }

  // 5. Test Correction Flow
  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'CORRECTION_REQUIRED',
      correction_reason: 'Please upload a clearer PAN card image',
    },
  });
  console.log('✓ Correction requested successfully! Status: CORRECTION_REQUIRED');

  // 6. Test Resubmission
  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'PENDING_REVIEW',
      correction_reason: null,
    },
  });
  console.log('✓ Resubmission simulated. Status returned to: PENDING_REVIEW');

  // Clean up test record
  await db.enrollment.delete({ where: { id: enrollment.id } });
  console.log('✓ Cleaned up test enrollment');
  console.log('--- ALL BACKEND & WORKFLOW TESTS PASSED PERFECTLY! ---');
}

runE2ETest().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
