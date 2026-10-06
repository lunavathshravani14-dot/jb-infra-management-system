import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Strict backend authorization
  if (!hasPermission(session.role, 'CED_VIEW') && session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Access to Confidential CED cadre restricted' }, { status: 403 });
  }

  const cedMembers = await db.person.findMany({
    where: {
      cadre_history: {
        some: {
          is_current: true,
          cadre: { is_confidential: true },
        },
      },
    },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
      reporting_to: {
        where: { is_current: true },
        include: { reporting_person: true },
      },
    },
  });

  await logAudit({
    userId: session.userId,
    userName: session.username,
    userRole: session.role,
    action: 'CED_VIEWED',
    entityType: 'CED',
    details: { memberCount: cedMembers.length },
  });

  return NextResponse.json({
    members: cedMembers.map((m) => ({
      id: m.id,
      permanentId: m.permanent_unique_id,
      fullName: m.full_name,
      dob: m.dob,
      mobile: m.mobile,
      email: m.email,
      address: m.address,
      status: m.status,
      joiningDate: m.cadre_history[0]?.joining_date,
      remarks: m.cadre_history[0]?.remarks,
    })),
  });
}
