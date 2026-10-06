import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: { id: params.id },
    include: {
      requested_cadre: true,
      kyc_documents: true,
      person: {
        include: {
          id_cards: true,
        },
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
  }

  let reportingPersonName = null;
  if (enrollment.reporting_person_id) {
    const mgr = await db.person.findUnique({
      where: { id: enrollment.reporting_person_id },
      select: { full_name: true, permanent_unique_id: true },
    });
    if (mgr) reportingPersonName = `${mgr.full_name} (${mgr.permanent_unique_id})`;
  }

  return NextResponse.json({
    enrollment: {
      ...enrollment,
      reportingPersonName,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'ENROLLMENT_EDIT') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to edit enrollments' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      dob,
      mobile,
      whatsapp,
      address,
      team,
      requestedCadreId,
      reportingPersonId,
    } = body;

    const updated = await db.enrollment.update({
      where: { id: params.id },
      data: {
        ...(fullName ? { full_name: fullName } : {}),
        ...(dob ? { dob: new Date(dob) } : {}),
        ...(mobile ? { mobile } : {}),
        ...(whatsapp ? { whatsapp } : {}),
        ...(address ? { address } : {}),
        ...(team ? { team } : {}),
        ...(requestedCadreId ? { requested_cadre_id: requestedCadreId } : {}),
        ...(reportingPersonId !== undefined ? { reporting_person_id: reportingPersonId || null } : {}),
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ENROLLMENT_EDITED',
      entityType: 'ENROLLMENT',
      entityId: params.id,
      details: { updatedFields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error: any) {
    console.error('Enrollment edit error:', error);
    return NextResponse.json({ error: error.message || 'Failed to edit enrollment' }, { status: 500 });
  }
}
