import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { retryWhatsAppMessage } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await db.whatsAppMessage.findMany({
    include: {
      person: true,
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      recipientPhone: m.recipient_phone,
      personName: m.person?.full_name || 'Executive',
      permanentId: m.person?.permanent_unique_id || 'ID Card',
      status: m.status,
      errorMessage: m.error_message,
      retryCount: m.retry_count,
      sentAt: m.sent_at,
      createdAt: m.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    const result = await retryWhatsAppMessage(messageId, session.userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WhatsApp retry error:', error);
    return NextResponse.json({ error: error.message || 'Retry failed' }, { status: 500 });
  }
}
