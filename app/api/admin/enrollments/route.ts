import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where: any = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { application_number: { contains: search } },
      { full_name: { contains: search } },
      { mobile: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const enrollments = await db.enrollment.findMany({
    where,
    include: {
      requested_cadre: true,
      kyc_documents: true,
      person: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json({ enrollments });
}
