import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { configureSequence } from '@/lib/id-generation';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'SETTINGS_MANAGE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sequences = await db.idSequence.findMany();
  return NextResponse.json({ sequences });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'SETTINGS_MANAGE') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { seriesName, prefix, startValue, pattern } = await req.json();

    if (!seriesName || !prefix || startValue === undefined) {
      return NextResponse.json({ error: 'seriesName, prefix, and startValue are required' }, { status: 400 });
    }

    const updated = await configureSequence(seriesName, prefix, parseInt(startValue, 10), pattern);

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'ID_SEQUENCE_CONFIGURED',
      entityType: 'ID_SEQUENCE',
      entityId: updated.id,
      details: { seriesName, prefix, startValue, pattern },
    });

    return NextResponse.json({ success: true, sequence: updated });
  } catch (error: any) {
    console.error('Sequence update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update sequence' }, { status: 500 });
  }
}
