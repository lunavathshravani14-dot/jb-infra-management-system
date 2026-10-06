import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPrivateDocumentBuffer } from '@/lib/storage';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kycDoc = await db.kycDocument.findUnique({
    where: { id: params.id },
    include: {
      enrollment: true,
      person: true,
    },
  });

  if (!kycDoc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Authorization check:
  // Allowed if:
  // 1. Admin with KYC_VIEW or SUPER_ADMIN
  // 2. Executive who owns this document (matching enrollment email or personId)
  const isAdmin = hasPermission(session.role, 'KYC_VIEW') || session.role === 'SUPER_ADMIN';
  const isOwner =
    (session.personId && kycDoc.person_id === session.personId) ||
    (kycDoc.enrollment && kycDoc.enrollment.email === session.email);

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden: You do not have permission to view this document' }, { status: 403 });
  }

  const fileBuffer = getPrivateDocumentBuffer(kycDoc.file_path);
  if (!fileBuffer) {
    return NextResponse.json({ error: 'File content not found on server' }, { status: 404 });
  }

  // Audit log document view
  await logAudit({
    userId: session.userId,
    userName: session.username,
    userRole: session.role,
    action: 'KYC_VIEWED',
    entityType: 'KYC_DOCUMENT',
    entityId: kycDoc.id,
    details: {
      documentType: kycDoc.document_type,
      ownerEmail: kycDoc.enrollment?.email || kycDoc.person?.email,
    },
  });

  const isImage = kycDoc.mime_type?.startsWith('image/');
  const contentType = kycDoc.mime_type || (isImage ? 'image/jpeg' : 'application/pdf');
  const ext = isImage ? '.jpg' : '.pdf';

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${kycDoc.document_type.toLowerCase()}_${kycDoc.id}${ext}"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
