import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendIdApprovedWhatsApp } from '@/lib/whatsapp';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_APPROVE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { id: params.id },
      include: {
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
    const latestCard = person.id_cards[0];
    const currentCadre = person.cadre_history[0]?.cadre?.name || 'Executive';
    const downloadUrl = latestCard ? `/api/documents/id-card/${latestCard.id}` : undefined;

    const result = await sendIdApprovedWhatsApp({
      personId: person.id,
      recipientPhone: person.whatsapp || person.mobile,
      personName: person.full_name,
      permanentId: person.permanent_unique_id,
      cadre: currentCadre,
      pdfDownloadUrl: downloadUrl,
      adminUserId: session.userId,
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'WHATSAPP_RESENT',
      entityType: 'PERSON',
      entityId: person.id,
      details: {
        applicationId: enrollment.application_number,
        permanentId: person.permanent_unique_id,
        recipientPhone: person.whatsapp || person.mobile,
        status: result.status,
      },
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      message: 'WhatsApp notification dispatched',
      result,
    });
  } catch (error: any) {
    console.error('Resend WhatsApp error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch WhatsApp message' }, { status: 500 });
  }
}
