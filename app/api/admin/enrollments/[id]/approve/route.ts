import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { generatePermanentUniqueId } from '@/lib/id-generation';
import { savePrivateDocument, getPrivateDocumentBuffer } from '@/lib/storage';
import { generateIdCardPdf } from '@/lib/pdf';
import { sendIdApprovedWhatsApp } from '@/lib/whatsapp';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_APPROVE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to approve enrollment' }, { status: 403 });
  }

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { id: params.id },
      include: {
        requested_cadre: true,
        kyc_documents: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment application not found' }, { status: 404 });
    }

    if (enrollment.status === 'APPROVED') {
      return NextResponse.json({ error: 'Enrollment is already approved' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const seriesName = body.seriesName || 'DEFAULT';
    const approvedCadreId = body.approvedCadreId || enrollment.requested_cadre_id;
    const joiningDate = body.joiningDate
      ? new Date(body.joiningDate)
      : enrollment.joining_date
      ? new Date(enrollment.joining_date)
      : new Date();

    // 1. Generate permanent unique ID
    const permanentUniqueId = await generatePermanentUniqueId({
      seriesName,
      adminUserId: session.userId,
      adminUserName: session.username,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // 2. Fetch approved cadre details
    const approvedCadre = await db.cadre.findUnique({
      where: { id: approvedCadreId },
    });

    if (!approvedCadre) {
      return NextResponse.json({ error: 'Approved cadre does not exist' }, { status: 400 });
    }

    // Find approved photo document if available
    const photoDoc = enrollment.kyc_documents.find(
      (d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE'
    );
    const photoBuffer = photoDoc ? getPrivateDocumentBuffer(photoDoc.file_path) : null;

    // 3. Execute atomic transaction to create Person, CadreHistory, Reporting, and update Enrollment
    const { person, cadreHistory } = await db.$transaction(async (tx) => {
      // Create Person
      const newPerson = await tx.person.create({
        data: {
          permanent_unique_id: permanentUniqueId,
          full_name: enrollment.full_name,
          joining_date: joiningDate,
          team: enrollment.team || 'Corporate Operations',
          dob: enrollment.dob || new Date('1990-01-01'),
          mobile: enrollment.mobile,
          whatsapp: enrollment.whatsapp,
          email: enrollment.email,
          address: enrollment.address,
          father_or_husband_name: enrollment.father_or_husband_name,
          age: enrollment.age,
          house_no: enrollment.house_no,
          street: enrollment.street,
          village_city: enrollment.village_city,
          mandal: enrollment.mandal,
          district: enrollment.district,
          state: enrollment.state,
          pincode: enrollment.pincode,
          me_id: enrollment.me_id,
          me_name: enrollment.me_name,
          mm_id: enrollment.mm_id,
          mm_name: enrollment.mm_name,
          smm_id: enrollment.smm_id,
          smm_name: enrollment.smm_name,
          agm_id: enrollment.agm_id,
          agm_name: enrollment.agm_name,
          dgm_id: enrollment.dgm_id,
          dgm_name: enrollment.dgm_name,
          gm_id: enrollment.gm_id,
          gm_name: enrollment.gm_name,
          photo_url: photoDoc ? `/api/documents/kyc/${photoDoc.id}` : null,
          status: 'ACTIVE',
        },
      });

      // Create CadreHistory
      const newHistory = await tx.cadreHistory.create({
        data: {
          person_id: newPerson.id,
          cadre_id: approvedCadre.id,
          joining_date: joiningDate,
          is_current: true,
          changed_by: session.username,
          remarks: `Initial approved enrollment (${enrollment.application_number})`,
        },
      });

      // Create reporting relationship if specified
      if (enrollment.reporting_person_id) {
        await tx.reportingRelationship.create({
          data: {
            person_id: newPerson.id,
            reporting_person_id: enrollment.reporting_person_id,
            effective_from: joiningDate,
            is_current: true,
          },
        });
      }

      // Update Enrollment status to APPROVED
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: 'APPROVED',
          person_id: newPerson.id,
          reviewed_at: new Date(),
          reviewed_by: session.username,
        },
      });

      // Update linked KYC documents
      await tx.kycDocument.updateMany({
        where: { enrollment_id: enrollment.id },
        data: {
          person_id: newPerson.id,
          status: 'APPROVED',
          reviewed_at: new Date(),
          reviewed_by: session.username,
        },
      });

      return { person: newPerson, cadreHistory: newHistory };
    });

    // 4. Generate wallet-sized vertical ID card PDF (Front & Back)
    let idCardRecord = null;
    try {
      const pdfBuffer = await generateIdCardPdf({
        permanentId: person.permanent_unique_id,
        fullName: person.full_name,
        cadre: approvedCadre.name,
        mobile: person.mobile,
        team: enrollment.team,
        joiningDate: joiningDate.toLocaleDateString(),
        photoBuffer,
        version: 1,
      });

      const relativePath = await savePrivateDocument({
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
          file_path: relativePath,
          qr_code_data: person.permanent_unique_id,
          generated_by: session.username,
        },
      });

      // Update enrollment status to ID_CARD_GENERATED
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'ID_CARD_GENERATED' },
      });
    } catch (pdfErr) {
      console.error('ID Card generation warning:', pdfErr);
    }

    // 5. Trigger WhatsApp notification
    let whatsappResult = null;
    try {
      const downloadUrl = idCardRecord
        ? `/api/documents/id-card/${idCardRecord.id}`
        : undefined;

      whatsappResult = await sendIdApprovedWhatsApp({
        personId: person.id,
        recipientPhone: person.whatsapp || person.mobile,
        personName: person.full_name,
        permanentId: person.permanent_unique_id,
        cadre: approvedCadre.name,
        pdfDownloadUrl: downloadUrl,
        adminUserId: session.userId,
      });
    } catch (waErr) {
      console.error('WhatsApp notification error (non-fatal):', waErr);
    }

    // 6. Audit log
    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ENROLLMENT_APPROVED',
      entityType: 'PERSON',
      entityId: person.id,
      details: {
        applicationNumber: enrollment.application_number,
        permanent_unique_id: person.permanent_unique_id,
        cadre: approvedCadre.name,
        idCardGenerated: !!idCardRecord,
        whatsappStatus: whatsappResult?.status || 'N/A',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment approved successfully!',
      permanent_unique_id: person.permanent_unique_id,
      personId: person.id,
      cadre: approvedCadre.name,
      idCardId: idCardRecord?.id || null,
      whatsappStatus: whatsappResult?.status || 'QUEUED',
    });
  } catch (error: any) {
    console.error('Enrollment approval error:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve enrollment' }, { status: 500 });
  }
}
