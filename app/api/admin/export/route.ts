import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateExcelReport } from '@/lib/excel';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || (!hasPermission(session.role, 'EXPORT_EXCEL') && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to export data' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title = 'Executive Directory Export', filtersApplied = 'All Records', personIds } = body;

    const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';
    const canUnmask = hasPermission(session.role, 'SENSITIVE_KYC_VIEW') || session.role === 'SUPER_ADMIN';

    const where: any = {};
    if (personIds && Array.isArray(personIds) && personIds.length > 0) {
      where.id = { in: personIds };
    }

    if (!canViewCed) {
      where.cadre_history = {
        none: {
          is_current: true,
          cadre: { is_confidential: true },
        },
      };
    }

    const people = await db.person.findMany({
      where,
      include: {
        cadre_history: {
          where: { is_current: true },
          include: { cadre: true },
        },
        reporting_to: {
          where: { is_current: true },
          include: {
            reporting_person: {
              include: {
                cadre_history: {
                  where: { is_current: true },
                  include: { cadre: true },
                },
              },
            },
          },
        },
        kyc_documents: true,
      },
      orderBy: { created_at: 'desc' },
      take: 1000,
    });

    const exportRows = people.map((p) => {
      const currentCadreHistory = p.cadre_history[0];
      const directManager = p.reporting_to[0]?.reporting_person;
      const aadhaarDoc = p.kyc_documents.find((d) => d.document_type === 'AADHAAR');
      const panDoc = p.kyc_documents.find((d) => d.document_type === 'PAN');

      return {
        permanentId: p.permanent_unique_id,
        fullName: p.full_name,
        mobile: p.mobile,
        dob: p.dob.toLocaleDateString(),
        cadre: currentCadreHistory?.cadre?.name || 'Unassigned',
        joiningDate: currentCadreHistory?.joining_date
          ? new Date(currentCadreHistory.joining_date).toLocaleDateString()
          : '-',
        promotionDate: currentCadreHistory?.promotion_date
          ? new Date(currentCadreHistory.promotion_date).toLocaleDateString()
          : '-',
        reportingTo: directManager ? `${directManager.full_name} (${directManager.permanent_unique_id})` : '-',
        kycStatus: aadhaarDoc && panDoc ? 'Verified' : 'Pending',
        status: p.status,
        aadhaar: aadhaarDoc?.document_number_masked || 'Not Submitted',
        pan: panDoc?.document_number_masked || 'Not Submitted',
      };
    });

    const buffer = await generateExcelReport({
      title,
      filtersApplied,
      rows: exportRows,
      unmaskSensitive: canUnmask,
    });

    await logAudit({
      userId: session.userId,
      userName: session.username,
      userRole: session.role,
      action: 'EXCEL_EXPORTED',
      entityType: 'REPORTS',
      details: { title, recordCount: exportRows.length, unmasked: canUnmask },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="JB_Infra_${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
