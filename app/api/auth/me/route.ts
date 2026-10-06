import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      person: {
        include: {
          cadre_history: {
            where: { is_current: true },
            include: { cadre: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      personId: user.person_id,
      person: user.person ? {
        id: user.person.id,
        permanentId: user.person.permanent_unique_id,
        fullName: user.person.full_name,
        cadre: user.person.cadre_history[0]?.cadre?.name || 'Executive',
        cadreId: user.person.cadre_history[0]?.cadre_id,
      } : null,
    },
  });
}
