import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { upgradePersonCadre } from '@/lib/cadre';
import { db } from '@/lib/db';
import { generateIdCardPdf } from '@/lib/pdf';
import { savePrivateDocument } from '@/lib/storage';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'CADRE_UPGRADE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to upgrade cadre' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      newCadreId,
      joiningDate,
      promotionDate,
      reportingPersonId,
      remarks,
      generateNewIdCard,
    } = body;

    if (!newCadreId || !joiningDate) {
      return NextResponse.json({ error: 'New cadre and joining date are required' }, { status: 400 });
    }

    const result = await upgradePersonCadre({
      personId: params.id,
      newCadreId,
      joiningDate: new Date(joiningDate),
      promotionDate: promotionDate ? new Date(promotionDate) : new Date(),
      reportingPersonId,
      remarks,
      adminUserId: session.userId,
      adminUserName: session.username,
      adminUserRole: session.role,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // Optionally generate a new versioned ID card
    let newCardRecord = null;
    if (generateNewIdCard) {
      const person = await db.person.findUnique({
        where: { id: params.id },
        include: {
          id_cards: { orderBy: { version: 'desc' }, take: 1 },
        },
      });

      if (person) {
        const nextVersion = (person.id_cards[0]?.version || 0) + 1;
        const pdfBuffer = await generateIdCardPdf({
          permanentId: person.permanent_unique_id,
          fullName: person.full_name,
          cadre: result.newCadre,
          mobile: person.mobile,
          joiningDate: new Date(joiningDate).toLocaleDateString(),
          version: nextVersion,
        });

        const relativePath = await savePrivateDocument({
          subFolder: 'id-cards',
          entityId: person.id,
          docType: 'id_card',
          version: nextVersion,
          buffer: pdfBuffer,
        });

        // Set prior cards inactive
        await db.idCard.updateMany({
          where: { person_id: person.id },
          data: { is_active: false },
        });

        newCardRecord = await db.idCard.create({
          data: {
            person_id: person.id,
            card_number: `CARD-${person.permanent_unique_id}-V${nextVersion}`,
            version: nextVersion,
            file_path: relativePath,
            qr_code_data: person.permanent_unique_id,
            generated_by: session.username,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cadre successfully upgraded to ${result.newCadre}. Permanent ID ${result.permanent_unique_id} remains unchanged.`,
      permanent_unique_id: result.permanent_unique_id,
      newCadre: result.newCadre,
      newCardId: newCardRecord?.id || null,
    });
  } catch (error: any) {
    console.error('Cadre upgrade error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upgrade cadre' }, { status: 500 });
  }
}
