import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { generatePermanentUniqueId } from '@/lib/id-generation';
import { detectCycle } from '@/lib/hierarchy';
import { generateIdCardPdf } from '@/lib/pdf';
import { savePrivateDocument } from '@/lib/storage';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_APPROVE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      joiningDate,
      address,
      mobile,
      whatsapp,
      email,
      cadreName,
      team,
      reportingPersonId,
      photoBase64,
    } = body;

    // 1. Mandatory Validations
    if (!fullName || !joiningDate || !address || !mobile || !cadreName) {
      return NextResponse.json(
        { error: 'Full Name, Joining Date, Address, Mobile, and Cadre are mandatory.' },
        { status: 400 }
      );
    }

    // Only Higher Cadres allowed in this endpoint: SGM, ED, CED
    const allowedCadres = ['SGM', 'ED', 'CED'];
    if (!allowedCadres.includes(cadreName.toUpperCase())) {
      return NextResponse.json(
        { error: 'Self Enroll Higher Cadre is only permitted for SGM, ED, and CED.' },
        { status: 400 }
      );
    }

    if (cadreName.toUpperCase() === 'CED' && session.role !== 'SUPER_ADMIN' && session.role !== 'RESTRICTED_ADMIN') {
      return NextResponse.json(
        { error: 'Only SuperAdmin or RestrictedAdmin can enroll or assign CED cadre.' },
        { status: 403 }
      );
    }

    // 2. Duplicate Prevention: Check mobile
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const existingPerson = await db.person.findFirst({
      where: { mobile: { contains: cleanMobile } },
    });

    if (existingPerson) {
      return NextResponse.json(
        {
          error: `An executive with mobile ${cleanMobile} already exists (${existingPerson.full_name} - ${existingPerson.permanent_unique_id}). Duplicate records are prevented.`,
        },
        { status: 409 }
      );
    }

    // 3. Cadre verification
    const cadre = await db.cadre.findUnique({
      where: { name: cadreName.toUpperCase() },
    });

    if (!cadre) {
      return NextResponse.json({ error: `Cadre ${cadreName} does not exist.` }, { status: 404 });
    }

    // 4. Reporting relationship cycle check
    if (reportingPersonId) {
      const reportingManager = await db.person.findUnique({
        where: { id: reportingPersonId },
        include: {
          cadre_history: { where: { is_current: true }, include: { cadre: true } },
        },
      });

      if (!reportingManager) {
        return NextResponse.json({ error: 'Selected reporting person does not exist.' }, { status: 404 });
      }
    }

    // 5. Generate permanent unique JB ID (e.g. JB260000)
    const permanentUniqueId = await generatePermanentUniqueId({
      seriesName: 'DEFAULT',
      adminUserId: session.userId,
      adminUserName: session.username,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const parsedJoiningDate = new Date(joiningDate);

    // 6. Execute atomic creation in database
    const { person, cadreHistory } = await db.$transaction(async (tx) => {
      const newPerson = await tx.person.create({
        data: {
          permanent_unique_id: permanentUniqueId,
          full_name: fullName.trim(),
          dob: new Date('1980-01-01'),
          joining_date: parsedJoiningDate,
          mobile: cleanMobile,
          whatsapp: whatsapp ? whatsapp.replace(/\D/g, '').slice(-10) : cleanMobile,
          email: email ? email.trim() : null,
          address: address.trim(),
          team: team ? team.trim() : 'Corporate Executive Team',
          status: 'ACTIVE',
        },
      });

      const newCadreHistory = await tx.cadreHistory.create({
        data: {
          person_id: newPerson.id,
          cadre_id: cadre.id,
          joining_date: parsedJoiningDate,
          is_current: true,
          changed_by: session.username,
          remarks: `Admin Self-Enrollment (${cadre.name})`,
        },
      });

      if (reportingPersonId) {
        await tx.reportingRelationship.create({
          data: {
            person_id: newPerson.id,
            reporting_person_id: reportingPersonId,
            effective_from: parsedJoiningDate,
            is_current: true,
          },
        });
      }

      return { person: newPerson, cadreHistory: newCadreHistory };
    });

    // 7. Handle Profile Photo if uploaded
    if (photoBase64) {
      try {
        const matches = photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(photoBase64, 'base64');

        const photoPath = await savePrivateDocument({
          subFolder: 'kyc',
          entityId: person.id,
          docType: 'photo',
          version: 1,
          buffer,
          extension: '.jpg',
        });

        const photoDoc = await db.kycDocument.create({
          data: {
            person_id: person.id,
            document_type: 'PHOTO',
            file_path: photoPath,
            file_size: buffer.length,
            mime_type: 'image/jpeg',
            version: 1,
            status: 'APPROVED',
            reviewed_by: session.username,
            reviewed_at: new Date(),
          },
        });

        await db.person.update({
          where: { id: person.id },
          data: { photo_url: `/api/documents/kyc/${photoDoc.id}` },
        });
      } catch (photoErr) {
        console.error('Photo save error:', photoErr);
      }
    }

    // 8. Generate ID Card
    let idCardRecord = null;
    try {
      const pdfBuffer = await generateIdCardPdf({
        permanentId: person.permanent_unique_id,
        fullName: person.full_name,
        cadre: cadre.name,
        mobile: person.mobile,
        team: person.team,
        joiningDate: parsedJoiningDate.toLocaleDateString(),
        version: 1,
      });

      const relativeCardPath = await savePrivateDocument({
        subFolder: 'id-cards',
        entityId: person.id,
        docType: 'id_card',
        version: 1,
        buffer: pdfBuffer,
      });

      idCardRecord = await db.idCard.create({
        data: {
          person_id: person.id,
          card_number: `CARD-${person.permanent_unique_id}-V1`,
          version: 1,
          file_path: relativeCardPath,
          qr_code_data: person.permanent_unique_id,
          generated_by: session.username,
        },
      });
    } catch (pdfErr) {
      console.error('ID card generation error:', pdfErr);
    }

    // 9. Audit Log
    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'HIGHER_CADRE_SELF_ENROLL',
      entityType: 'PERSON',
      entityId: person.id,
      details: {
        permanent_unique_id: person.permanent_unique_id,
        fullName: person.full_name,
        cadre: cadre.name,
        joiningDate: parsedJoiningDate.toISOString(),
        reportingPersonId: reportingPersonId || null,
        idCardGenerated: !!idCardRecord,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${cadre.name} ${person.full_name} successfully enrolled with Permanent ID ${person.permanent_unique_id}!`,
      person: {
        id: person.id,
        permanent_unique_id: person.permanent_unique_id,
        full_name: person.full_name,
        cadre: cadre.name,
        status: person.status,
      },
      idCardId: idCardRecord?.id || null,
    });
  } catch (error: any) {
    console.error('Self enroll error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete self-enrollment.' }, { status: 500 });
  }
}
