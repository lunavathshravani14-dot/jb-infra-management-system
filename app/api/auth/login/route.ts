import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
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
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      await logAudit({
        userId: user.id,
        userName: user.username,
        action: 'FAILED_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as any,
      personId: user.person_id,
    });

    await logAudit({
      userId: user.id,
      userName: user.username,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        personId: user.person_id,
        person: user.person ? {
          permanentId: user.person.permanent_unique_id,
          fullName: user.person.full_name,
          cadre: user.person.cadre_history[0]?.cadre?.name || 'Executive',
        } : null,
      },
      token,
    });

    // Set HttpOnly cookie for security
    response.cookies.set('jb_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
