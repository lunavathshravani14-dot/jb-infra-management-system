import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPrivateDocumentBuffer, savePrivateDocument } from '@/lib/storage';
import { generateIdCardPdf } from '@/lib/pdf';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idCard = await db.idCard.findUnique({
    where: { id: params.id },
    include: {
      person: {
        include: {
          cadre_history: {
            where: { is_current: true },
            include: { cadre: true },
          },
        },
      },
    },
  });

  if (!idCard) {
    return NextResponse.json({ error: 'ID card record not found' }, { status: 404 });
  }

  // Authorization check
  const isAdmin = session.role !== 'EXECUTIVE';
  const isOwner = session.personId && idCard.person_id === session.personId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let fileBuffer = getPrivateDocumentBuffer(idCard.file_path);

  // If not generated yet or missing on disk, generate on the fly!
  if (!fileBuffer) {
    const person = idCard.person;
    const currentCadre = person.cadre_history[0]?.cadre?.name || 'Executive';
    const joiningDate = person.cadre_history[0]?.joining_date
      ? new Date(person.cadre_history[0].joining_date).toLocaleDateString()
      : new Date().toLocaleDateString();

    fileBuffer = await generateIdCardPdf({
      permanentId: person.permanent_unique_id,
      fullName: person.full_name,
      cadre: currentCadre,
      mobile: person.mobile,
      joiningDate,
      version: idCard.version,
    });

    // Save to private storage
    await savePrivateDocument({
      subFolder: 'id-cards',
      entityId: person.id,
      docType: 'id_card',
      version: idCard.version,
      buffer: fileBuffer,
    });
  }

  await logAudit({
    userId: session.userId,
    userName: session.username,
    userRole: session.role,
    action: 'ID_CARD_DOWNLOADED',
    entityType: 'ID_CARD',
    entityId: idCard.id,
    details: {
      permanentId: idCard.person.permanent_unique_id,
      version: idCard.version,
    },
  });

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ID_CARD_${idCard.person.permanent_unique_id}_v${idCard.version}.pdf"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
