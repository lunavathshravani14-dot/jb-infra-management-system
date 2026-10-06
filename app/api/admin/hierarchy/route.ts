import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'HIERARCHY_VIEW') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';

  // Fetch all EDs
  const eds = await db.person.findMany({
    where: {
      status: 'ACTIVE',
      cadre_history: {
        some: {
          is_current: true,
          cadre: { name: 'ED' },
        },
      },
    },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
    },
  });

  // Fetch all GMs
  const gms = await db.person.findMany({
    where: {
      status: 'ACTIVE',
      cadre_history: {
        some: {
          is_current: true,
          cadre: { name: 'GM' },
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

  return NextResponse.json({
    eds: eds.map((e) => ({
      id: e.id,
      permanentId: e.permanent_unique_id,
      name: e.full_name,
      cadre: 'ED',
    })),
    gms: gms.map((g) => ({
      id: g.id,
      permanentId: g.permanent_unique_id,
      name: g.full_name,
      cadre: 'GM',
      reportingTo: g.reporting_to[0]?.reporting_person?.full_name || 'Unassigned',
    })),
  });
}
