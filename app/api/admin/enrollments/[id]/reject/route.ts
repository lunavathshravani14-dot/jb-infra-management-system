import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_REJECT') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to reject enrollment' }, { status: 403 });
  }

  try {
    const { rejectionReason } = await req.json();
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 });
    }

    const enrollment = await db.enrollment.findUnique({ where: { id: params.id } });
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const updated = await db.enrollment.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejection_reason: rejectionReason.trim(),
        reviewed_at: new Date(),
        reviewed_by: session.username,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ENROLLMENT_REJECTED',
      entityType: 'ENROLLMENT',
      entityId: params.id,
      details: {
        applicationNumber: enrollment.application_number,
        rejectionReason: rejectionReason.trim(),
      },
    });

    return NextResponse.json({ success: true, message: 'Application rejected', enrollment: updated });
  } catch (error: any) {
    console.error('Enrollment rejection error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject enrollment' }, { status: 500 });
  }
}
