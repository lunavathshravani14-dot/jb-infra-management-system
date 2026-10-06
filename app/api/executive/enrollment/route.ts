import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = getSession(req);

  // Official JB Infra Cadres: ME, MM, SMM, AGM, DGM, GM
  const officialCadreNames = ['ME', 'MM', 'SMM', 'AGM', 'DGM', 'GM'];
  const availableCadres = await db.cadre.findMany({
    where: {
      name: { in: officialCadreNames },
      is_confidential: false,
    },
    orderBy: { level: 'asc' },
  });

  if (!session) {
    return NextResponse.json({
      enrollment: null,
      availableCadres,
      availableManagers: [],
    });
  }

  // Find enrollment by email or mobile or user's linked person
  const enrollment = await db.enrollment.findFirst({
    where: {
      OR: [
        { email: session.email },
        session.personId ? { person_id: session.personId } : {},
      ],
    },
    include: {
      requested_cadre: true,
      kyc_documents: true,
      person: {
        include: {
          id_cards: {
            where: { is_active: true },
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const availableManagers = await db.person.findMany({
    where: {
      status: 'ACTIVE',
      cadre_history: {
        some: {
          is_current: true,
          cadre: { level: { gte: 3 } }, // Manager, GM, ED
        },
      },
    },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
    },
    take: 50,
  });

  return NextResponse.json({
    enrollment,
    availableCadres,
    availableManagers: availableManagers.map((m) => ({
      id: m.id,
      name: m.full_name,
      cadre: m.cadre_history[0]?.cadre?.name || 'Manager',
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);

  try {
    const body = await req.json();
    const {
      fullName,
      dob,
      age,
      mobile,
      whatsapp,
      email,
      fatherOrHusbandName,
      // Address fields
      houseNo,
      street,
      villageCity,
      mandal,
      district,
      state,
      pincode,
      address: customAddress,
      joiningDate,
      team,
      reportingPersonId,
      // Cadre & Reporting
      requestedCadreId,
      cadreName,
      meId,
      meName,
      mmId,
      mmName,
      smmId,
      smmName,
      agmId,
      agmName,
      dgmId,
      dgmName,
      gmId,
      gmName,
      // Documents
      photoDocId,
      aadhaarFrontDocId,
      aadhaarBackDocId,
      aadhaarDocId, // backward compatibility
      panDocId,
      // Declaration & flags
      declarationConfirmed,
      isUpdate,
      enrollmentId,
    } = body;

    // Validate mandatory fields: Full Name, Mobile, Email, and Joining Date
    if (!fullName || !mobile || !email || !joiningDate) {
      return NextResponse.json(
        { error: 'Full Name, Mobile Number, Email ID, and Joining Date are mandatory.' },
        { status: 400 }
      );
    }

    if (!declarationConfirmed) {
      return NextResponse.json({ error: 'You must confirm the declaration to submit.' }, { status: 400 });
    }

    // Resolve Cadre ID (supporting both ID and Name: ME, MM, SMM, AGM, DGM, GM)
    let finalCadreId = requestedCadreId;
    if (finalCadreId) {
      const match = await db.cadre.findFirst({
        where: {
          OR: [
            { id: finalCadreId },
            { name: finalCadreId },
            { name: finalCadreId.toUpperCase() },
          ],
        },
      });
      if (match) finalCadreId = match.id;
    }

    if (!finalCadreId) {
      const defaultCadre = await db.cadre.findFirst({
        where: { name: 'ME' },
      });
      finalCadreId = defaultCadre?.id;
    }

    if (!finalCadreId) {
      const anyCadre = await db.cadre.findFirst();
      finalCadreId = anyCadre?.id || 'default_cadre';
    }

    // Construct unified address string
    const addressParts = [houseNo, street, villageCity, mandal, district, state, pincode].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : (customAddress || 'Not Provided');

    // Auto generate 8-character alphanumeric Application ID: JB-XXXXXXXX
    const generateAppId = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `JB-${code}`;
    };

    let applicationNumber = generateAppId();

    const dataPayload = {
      full_name: fullName.trim(),
      joining_date: new Date(joiningDate),
      dob: dob ? new Date(dob) : null,
      age: age ? parseInt(age, 10) : null,
      mobile: mobile.trim(),
      whatsapp: whatsapp?.trim() || mobile.trim(),
      email: email.trim(),
      team: team?.trim() || 'General Operations',
      reporting_person_id: reportingPersonId || null,
      father_or_husband_name: fatherOrHusbandName?.trim() || null,
      house_no: houseNo?.trim() || null,
      street: street?.trim() || null,
      village_city: villageCity?.trim() || null,
      mandal: mandal?.trim() || null,
      district: district?.trim() || null,
      state: state?.trim() || 'Telangana',
      pincode: pincode?.trim() || null,
      address: fullAddress,
      requested_cadre_id: finalCadreId,
      me_id: meId?.trim() || null,
      me_name: meName?.trim() || null,
      mm_id: mmId?.trim() || null,
      mm_name: mmName?.trim() || null,
      smm_id: smmId?.trim() || null,
      smm_name: smmName?.trim() || null,
      agm_id: agmId?.trim() || null,
      agm_name: agmName?.trim() || null,
      dgm_id: dgmId?.trim() || null,
      dgm_name: dgmName?.trim() || null,
      gm_id: gmId?.trim() || null,
      gm_name: gmName?.trim() || null,
      declaration_confirmed: true,
      status: 'PENDING_REVIEW', // Pending Admin Verification
      submitted_at: new Date(),
    };

    let enrollment;
    if (isUpdate && enrollmentId) {
      enrollment = await db.enrollment.update({
        where: { id: enrollmentId },
        data: dataPayload,
      });
    } else {
      // Ensure unique application number
      let isUnique = false;
      while (!isUnique) {
        const existing = await db.enrollment.findUnique({ where: { application_number: applicationNumber } });
        if (!existing) isUnique = true;
        else applicationNumber = generateAppId();
      }

      enrollment = await db.enrollment.create({
        data: {
          ...dataPayload,
          application_number: applicationNumber,
        },
      });
    }

    // Link uploaded documents to this enrollment
    const docIds = [photoDocId, aadhaarFrontDocId, aadhaarBackDocId, aadhaarDocId, panDocId].filter(Boolean);
    if (docIds.length > 0) {
      await db.kycDocument.updateMany({
        where: { id: { in: docIds } },
        data: {
          enrollment_id: enrollment.id,
          status: 'PENDING',
        },
      });
    }

    await logAudit({
      userId: session?.userId,
      userName: session?.username || fullName,
      action: isUpdate ? 'ENROLLMENT_RESUBMITTED' : 'ENROLLMENT_SUBMITTED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      details: {
        applicationNumber: enrollment.application_number,
        fullName,
        mobile,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'APPLICATION SUBMITTED SUCCESSFULLY ✓',
      applicationNumber: enrollment.application_number,
      status: 'PENDING ADMIN VERIFICATION',
      enrollment,
    });
  } catch (error: any) {
    console.error('Enrollment submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
  }
}
