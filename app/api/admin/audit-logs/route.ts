import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'AUDIT_VIEW') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const entityType = searchParams.get('entityType');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';

  const where: any = {};
  if (!canViewCed) {
    where.entity_type = { not: 'CED' };
  }

  if (action && action !== 'ALL') {
    where.action = action;
  }

  if (entityType && entityType !== 'ALL') {
    where.entity_type = entityType;
  }

  if (search) {
    where.OR = [
      { user_name: { contains: search } },
      { action: { contains: search } },
      { entity_id: { contains: search } },
    ];
  }

  const [totalCount, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      userId: l.user_id,
      userName: l.user_name || 'System',
      userRole: l.user_role || 'ADMIN',
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      ipAddress: l.ip_address,
      details: l.details ? JSON.parse(l.details) : null,
      createdAt: l.created_at,
    })),
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
}
