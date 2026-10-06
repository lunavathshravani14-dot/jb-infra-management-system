import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_REJECT') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to request corrections' }, { status: 403 });
  }

  try {
    const { correctionReason } = await req.json();
    if (!correctionReason || correctionReason.trim().length === 0) {
      return NextResponse.json({ error: 'Correction note / reason is mandatory' }, { status: 400 });
    }

    const enrollment = await db.enrollment.findUnique({ where: { id: params.id } });
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment application not found' }, { status: 404 });
    }

    const updated = await db.enrollment.update({
      where: { id: params.id },
      data: {
        status: 'CORRECTION_REQUIRED',
        correction_reason: correctionReason.trim(),
        reviewed_at: new Date(),
        reviewed_by: session.username,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ENROLLMENT_CORRECTION_REQUESTED',
      entityType: 'ENROLLMENT',
      entityId: params.id,
      details: {
        applicationNumber: enrollment.application_number,
        correctionReason: correctionReason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Correction request sent to executive',
      enrollment: updated,
    });
  } catch (error: any) {
    console.error('Enrollment correction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to request correction' }, { status: 500 });
  }
}
