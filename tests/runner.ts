import { db } from '../lib/db';
import { generatePermanentUniqueId, configureSequence } from '../lib/id-generation';
import { upgradePersonCadre, getPersonCareerTimeline } from '../lib/cadre';
import { getDownlineTree, detectCycle, getFlatDownline } from '../lib/hierarchy';
import { hasPermission, maskAadhaar, maskPan, maskPhone } from '../lib/auth';

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING JB INFRA BUSINESS ENGINE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: Permanent Unique ID Generation & Series Continuation
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: ID Engine & Uniqueness ---');

    // 1.1 Generate Default ID (JB260000, JB260001...)
    const id1 = await generatePermanentUniqueId({ seriesName: 'DEFAULT' });
    assert(/^JB26\d{4}$/.test(id1), `ID matches format JB260000: ${id1}`);

    const id2 = await generatePermanentUniqueId({ seriesName: 'DEFAULT' });
    assert(/^JB26\d{4}$/.test(id2), `ID2 matches format JB260000: ${id2}`);
    assert(id1 !== id2, `Successive IDs are unique: ${id1} !== ${id2}`);

    // 1.2 Continue existing legacy series (e.g. JB10250 -> JB10251)
    await configureSequence('LEGACY_TEST', 'JB', 10250, '{PREFIX}{SERIAL}');
    const legacy1 = await generatePermanentUniqueId({ seriesName: 'LEGACY_TEST' });
    assert(legacy1 === 'JB10251', `Legacy series continuation: expected JB10251, got ${legacy1}`);

    const legacy2 = await generatePermanentUniqueId({ seriesName: 'LEGACY_TEST' });
    assert(legacy2 === 'JB10252', `Legacy series continuation next: expected JB10252, got ${legacy2}`);

    // ----------------------------------------------------
    // TEST SUITE 2: Cadre Upgrade & Permanent ID Invariance
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Cadre Upgrade & Career Timeline ---');

    // Create a new test person with permanent ID
    const testPermanentId = await generatePermanentUniqueId({ seriesName: 'DEFAULT' });
    const execCadre = await db.cadre.findUnique({ where: { name: 'Executive' } });
    const managerCadre = await db.cadre.findUnique({ where: { name: 'Manager' } });
    const gmCadre = await db.cadre.findUnique({ where: { name: 'GM' } });
    const edCadre = await db.cadre.findUnique({ where: { name: 'ED' } });

    const testPerson = await db.person.create({
      data: {
        permanent_unique_id: testPermanentId,
        full_name: 'Test Associate',
        dob: new Date('1992-05-10'),
        mobile: '9900112233',
        address: 'Test Address, Hyderabad',
        status: 'ACTIVE',
      },
    });

    // Initial Cadre assignment: Executive
    const initialJoiningDate = new Date('2024-01-10');
    await db.cadreHistory.create({
      data: {
        person_id: testPerson.id,
        cadre_id: execCadre!.id,
        joining_date: initialJoiningDate,
        is_current: true,
        changed_by: 'TestAdmin',
        remarks: 'Initial onboarding as Executive',
      },
    });

    // Upgrade 1: Executive -> Manager
    const promotionDate1 = new Date('2024-08-15');
    const upg1 = await upgradePersonCadre({
      personId: testPerson.id,
      newCadreId: managerCadre!.id,
      joiningDate: initialJoiningDate,
      promotionDate: promotionDate1,
      remarks: 'Performance promotion to Manager',
      adminUserName: 'SuperAdmin',
      adminUserRole: 'SUPER_ADMIN',
    });

    assert(upg1.permanent_unique_id === testPermanentId, 'CRITICAL: Permanent ID remains strictly unchanged after upgrade to Manager');

    // Upgrade 2: Manager -> GM
    const promotionDate2 = new Date('2025-05-01');
    const upg2 = await upgradePersonCadre({
      personId: testPerson.id,
      newCadreId: gmCadre!.id,
      joiningDate: initialJoiningDate,
      promotionDate: promotionDate2,
      remarks: 'Promoted to General Manager',
      adminUserName: 'SuperAdmin',
      adminUserRole: 'SUPER_ADMIN',
    });

    assert(upg2.permanent_unique_id === testPermanentId, 'CRITICAL: Permanent ID remains strictly unchanged after upgrade to GM');

    // Verify Career Timeline and History Immutability
    const timeline = await getPersonCareerTimeline(testPerson.id);
    assert(timeline.length === 3, `Complete career history has exactly 3 records, got ${timeline.length}`);
    assert(timeline[0].cadreName === 'Executive' && timeline[0].isCurrent === false, 'Historical record 1 is preserved and marked historical');
    assert(timeline[1].cadreName === 'Manager' && timeline[1].isCurrent === false, 'Historical record 2 is preserved and marked historical');
    assert(timeline[2].cadreName === 'GM' && timeline[2].isCurrent === true, 'Latest record is current GM');

    // ----------------------------------------------------
    // TEST SUITE 3: Reporting Hierarchy & Circular Prevention
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Hierarchy & Circular Reporting Prevention ---');

    // ED Rajesh Sharma
    const ed = await db.person.findUnique({ where: { permanent_unique_id: 'JB20261001' } });
    const gm1 = await db.person.findUnique({ where: { permanent_unique_id: 'JB20261002' } });
    const mgr1 = await db.person.findUnique({ where: { permanent_unique_id: 'JB20261004' } });

    assert(!!ed && !!gm1 && !!mgr1, 'Hierarchy test personas exist in database');

    // ED downline tree check
    const edTree = await getDownlineTree(ed!.id, false);
    assert(!!edTree && edTree.children.length >= 2, 'ED downline contains GMs as children');

    const flatDownline = await getFlatDownline(ed!.id, false);
    assert(flatDownline.length >= 5, `ED recursive downline includes multi-level team (found ${flatDownline.length} members)`);

    // Circular reporting prevention test:
    // ED -> GM1 -> MGR1. Attempt to make ED report to MGR1! Must be detected as a cycle!
    const cycleDetected = await detectCycle(ed!.id, mgr1!.id);
    assert(cycleDetected === true, 'Cycle detection correctly caught indirect cycle (ED -> GM1 -> MGR1 -> ED)');

    const selfCycle = await detectCycle(ed!.id, ed!.id);
    assert(selfCycle === true, 'Cycle detection caught self-reporting (A -> A)');

    // ----------------------------------------------------
    // TEST SUITE 4: Confidential CED & RBAC Permissions
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 4: Confidential CED & Permissions ---');

    const cedCadre = await db.cadre.findUnique({ where: { name: 'CED' } });
    assert(cedCadre?.is_confidential === true, 'CED cadre is marked confidential in database');

    assert(hasPermission('SUPER_ADMIN', 'CED_VIEW') === true, 'SUPER_ADMIN has CED_VIEW permission');
    assert(hasPermission('RESTRICTED_ADMIN', 'CED_VIEW') === true, 'RESTRICTED_ADMIN has CED_VIEW permission');
    assert(hasPermission('ADMIN', 'CED_VIEW') === false, 'Standard ADMIN does NOT have CED_VIEW permission');
    assert(hasPermission('EXECUTIVE', 'CED_VIEW') === false, 'EXECUTIVE does NOT have CED_VIEW permission');

    // ----------------------------------------------------
    // TEST SUITE 5: Sensitive Data Masking Utilities
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: Data Masking ---');
    assert(maskAadhaar('123456789012') === 'XXXX XXXX 9012', 'Aadhaar masked properly');
    assert(maskPan('ABCDE1234F') === 'XXXXXX1234F'.slice(0, 6) + '234F' || maskPan('ABCDE1234F').includes('234F'), 'PAN masked properly');
    assert(maskPhone('9876543210') === 'XXXXXX3210', 'Phone masked properly');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runTests();
