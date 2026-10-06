import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';

  // Metrics
  const [
    totalPeopleCount,
    pendingEnrollmentsCount,
    pendingKycCount,
    approvedCount,
    rejectedCount,
    activeCount,
    inactiveCount,
    cadres,
    recentPromotions,
    recentActivities,
  ] = await Promise.all([
    // Total people (exclude CED if not permitted)
    db.person.count({
      where: canViewCed
        ? {}
        : {
            cadre_history: {
              none: {
                is_current: true,
                cadre: { is_confidential: true },
              },
            },
          },
    }),

    // Pending enrollments
    db.enrollment.count({
      where: { status: 'PENDING_REVIEW' },
    }),

    // Pending KYC documents
    db.kycDocument.count({
      where: { status: 'PENDING' },
    }),

    // Approved enrollments
    db.enrollment.count({
      where: { status: 'APPROVED' },
    }),

    // Rejected enrollments
    db.enrollment.count({
      where: { status: 'REJECTED' },
    }),

    // Active Executives
    db.person.count({
      where: { status: 'ACTIVE' },
    }),

    // Inactive Executives
    db.person.count({
      where: { status: 'INACTIVE' },
    }),

    // Cadre distribution
    db.cadre.findMany({
      where: canViewCed ? {} : { is_confidential: false },
      include: {
        _count: {
          select: {
            cadre_history: {
              where: { is_current: true },
            },
          },
        },
      },
      orderBy: { level: 'asc' },
    }),

    // Recent Promotions
    db.cadreHistory.findMany({
      where: {
        promotion_date: { not: null },
        ...(canViewCed ? {} : { cadre: { is_confidential: false } }),
      },
      include: {
        person: true,
        cadre: true,
      },
      orderBy: { promotion_date: 'desc' },
      take: 5,
    }),

    // Recent Activity Audit Logs
    db.auditLog.findMany({
      where: canViewCed ? {} : { entity_type: { not: 'CED' } },
      orderBy: { created_at: 'desc' },
      take: 8,
    }),
  ]);

  const cadreDistribution = cadres.map((c) => ({
    name: c.name,
    count: c._count.cadre_history,
    isConfidential: c.is_confidential,
  }));

  return NextResponse.json({
    metrics: {
      totalPeople: totalPeopleCount,
      pendingEnrollments: pendingEnrollmentsCount,
      pendingKyc: pendingKycCount,
      approved: approvedCount,
      rejected: rejectedCount,
      active: activeCount,
      inactive: inactiveCount,
    },
    cadreDistribution,
    recentPromotions: recentPromotions.map((p) => ({
      id: p.id,
      permanentId: p.person.permanent_unique_id,
      fullName: p.person.full_name,
      newCadre: p.cadre.name,
      promotionDate: p.promotion_date,
      changedBy: p.changed_by,
      remarks: p.remarks,
    })),
    recentActivities: recentActivities.map((a) => ({
      id: a.id,
      action: a.action,
      userName: a.user_name || 'System',
      entityType: a.entity_type,
      entityId: a.entity_id,
      createdAt: a.created_at,
    })),
  });
}
