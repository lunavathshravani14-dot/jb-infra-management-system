import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { getDownlineTree, getFlatDownline } from '@/lib/hierarchy';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'HIERARCHY_VIEW') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';

  const tree = await getDownlineTree(params.id, !canViewCed);
  const flatList = await getFlatDownline(params.id, !canViewCed);

  if (!tree) {
    return NextResponse.json({ error: 'GM hierarchy not found' }, { status: 404 });
  }

  return NextResponse.json({
    root: tree,
    flatList,
    totalDownlineCount: flatList.length > 0 ? flatList.length - 1 : 0,
  });
}
