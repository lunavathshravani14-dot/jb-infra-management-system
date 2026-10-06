import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { savePrivateDocument, getPrivateDocumentBuffer } from '@/lib/storage';
import { generateIdCardPdf } from '@/lib/pdf';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_APPROVE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 401 });
  }

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { id: params.id },
      include: {
        kyc_documents: true,
        person: {
          include: {
            id_cards: {
              orderBy: { version: 'desc' },
              take: 1,
            },
            cadre_history: {
              where: { is_current: true },
              include: { cadre: true },
            },
          },
        },
      },
    });

    if (!enrollment || !enrollment.person) {
      return NextResponse.json({ error: 'Approved person record not found for this enrollment' }, { status: 404 });
    }

    const person = enrollment.person;
    const currentVersion = person.id_cards[0]?.version || 0;
    const nextVersion = currentVersion + 1;
    const currentCadre = person.cadre_history[0]?.cadre?.name || 'Executive';

    // Retrieve approved photo document if available
    const photoDoc = enrollment.kyc_documents.find(
      (d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE'
    );
    const photoBuffer = photoDoc ? getPrivateDocumentBuffer(photoDoc.file_path) : null;

    // Generate fresh 2-page PDF
    const pdfBuffer = await generateIdCardPdf({
      permanentId: person.permanent_unique_id,
      fullName: person.full_name,
      cadre: currentCadre,
      mobile: person.mobile,
      team: enrollment.team,
      joiningDate: enrollment.reviewed_at ? new Date(enrollment.reviewed_at).toLocaleDateString() : new Date().toLocaleDateString(),
      photoBuffer,
      version: nextVersion,
    });

    const relativePath = await savePrivateDocument({
      subFolder: 'id-cards',
      entityId: person.id,
      docType: 'id_card',
      version: nextVersion,
      buffer: pdfBuffer,
    });

    const idCardRecord = await db.idCard.create({
      data: {
        person_id: person.id,
        card_number: `CARD-${person.permanent_unique_id}-V${nextVersion}`,
        version: nextVersion,
        file_path: relativePath,
        qr_code_data: person.permanent_unique_id,
        generated_by: session.username,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ID_CARD_REGENERATED',
      entityType: 'ID_CARD',
      entityId: idCardRecord.id,
      details: {
        permanentId: person.permanent_unique_id,
        version: nextVersion,
      },
    });

    return NextResponse.json({
      success: true,
      message: `ID Card regenerated successfully (v${nextVersion})`,
      idCardId: idCardRecord.id,
      version: nextVersion,
    });
  } catch (error: any) {
    console.error('Regenerate ID card error:', error);
    return NextResponse.json({ error: error.message || 'Failed to regenerate ID card' }, { status: 500 });
  }
}
