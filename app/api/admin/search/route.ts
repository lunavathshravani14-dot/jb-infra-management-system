import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission, maskAadhaar, maskPan, maskPhone } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFlatDownline } from '@/lib/hierarchy';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // Search and filter parameters
  const query = searchParams.get('q')?.trim() || '';
  const cadreId = searchParams.get('cadreId') || '';
  const edId = searchParams.get('edId') || '';
  const gmId = searchParams.get('gmId') || '';
  const managerId = searchParams.get('managerId') || '';
  const kycStatus = searchParams.get('kycStatus') || '';
  const status = searchParams.get('status') || '';
  const joiningDateFrom = searchParams.get('joiningDateFrom');
  const joiningDateTo = searchParams.get('joiningDateTo');
  const promotionDateFrom = searchParams.get('promotionDateFrom');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';
  const canViewSensitive = hasPermission(session.role, 'SENSITIVE_KYC_VIEW') || session.role === 'SUPER_ADMIN';

  // Build Prisma where clause
  const where: any = {};

  // 1. CED confidential filter
  if (!canViewCed) {
    where.cadre_history = {
      none: {
        is_current: true,
        cadre: { is_confidential: true },
      },
    };
  }

  // 2. Status filter
  if (status && status !== 'ALL') {
    where.status = status;
  }

  // 3. Cadre filter
  if (cadreId && cadreId !== 'ALL') {
    where.cadre_history = {
      ...(where.cadre_history || {}),
      some: {
        is_current: true,
        cadre_id: cadreId,
      },
    };
  }

  // 4. Joining / Promotion Date filters
  if (joiningDateFrom || joiningDateTo) {
    const joiningDateFilter: any = {};
    if (joiningDateFrom) joiningDateFilter.gte = new Date(joiningDateFrom);
    if (joiningDateTo) joiningDateFilter.lte = new Date(joiningDateTo);

    where.cadre_history = {
      ...(where.cadre_history || {}),
      some: {
        is_current: true,
        joining_date: joiningDateFilter,
      },
    };
  }

  if (promotionDateFrom) {
    where.cadre_history = {
      ...(where.cadre_history || {}),
      some: {
        promotion_date: { gte: new Date(promotionDateFrom) },
      },
    };
  }

  // 5. ED Downline or GM Downline filter
  let allowedDownlineIds: string[] | null = null;
  if (edId && edId !== 'ALL') {
    const downline = await getFlatDownline(edId, !canViewCed);
    allowedDownlineIds = downline.map((d) => d.id);
  } else if (gmId && gmId !== 'ALL') {
    const downline = await getFlatDownline(gmId, !canViewCed);
    allowedDownlineIds = downline.map((d) => d.id);
  } else if (managerId && managerId !== 'ALL') {
    const directReports = await db.reportingRelationship.findMany({
      where: { reporting_person_id: managerId, is_current: true },
      select: { person_id: true },
    });
    allowedDownlineIds = [managerId, ...directReports.map((r) => r.person_id)];
  }

  if (allowedDownlineIds !== null) {
    where.id = { in: allowedDownlineIds };
  }

  // 6. Universal query string (search by ID, Name, Mobile, WhatsApp, Email, or KYC document number)
  if (query) {
    where.OR = [
      { permanent_unique_id: { contains: query } },
      { full_name: { contains: query } },
      { mobile: { contains: query } },
      { whatsapp: { contains: query } },
      { email: { contains: query } },
      {
        kyc_documents: {
          some: {
            document_number_masked: { contains: query },
          },
        },
      },
    ];
  }

  // Execute paginated search with total count
  const [totalCount, people] = await Promise.all([
    db.person.count({ where }),
    db.person.findMany({
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
              },
            },
          },
        },
        kyc_documents: true,
        id_cards: {
          where: { is_active: true },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const results = people.map((p) => {
    const currentCadreHistory = p.cadre_history[0];
    const directManager = p.reporting_to[0]?.reporting_person;
    const grandManager = directManager?.reporting_to[0]?.reporting_person;

    // Detect ED / GM / Manager
    let edName = '-';
    let gmName = '-';
    let managerName = '-';

    if (directManager) {
      const mgrCadre = directManager.cadre_history[0]?.cadre?.name;
      if (mgrCadre === 'ED') {
        edName = directManager.full_name;
      } else if (mgrCadre === 'GM') {
        gmName = directManager.full_name;
        if (grandManager?.cadre_history[0]?.cadre?.name === 'ED') {
          edName = grandManager.full_name;
        }
      } else {
        managerName = directManager.full_name;
        if (grandManager?.cadre_history[0]?.cadre?.name === 'GM') {
          gmName = grandManager.full_name;
        }
      }
    }

    const aadhaarDoc = p.kyc_documents.find((d) => d.document_type === 'AADHAAR');
    const panDoc = p.kyc_documents.find((d) => d.document_type === 'PAN');
    const hasKyc = !!(aadhaarDoc && panDoc);

    return {
      id: p.id,
      permanentId: p.permanent_unique_id,
      fullName: p.full_name,
      dob: p.dob,
      mobile: canViewSensitive ? p.mobile : maskPhone(p.mobile),
      currentCadre: currentCadreHistory?.cadre?.name || 'Unassigned',
      cadreLevel: currentCadreHistory?.cadre?.level || 0,
      joiningDate: currentCadreHistory?.joining_date,
      promotionDate: currentCadreHistory?.promotion_date,
      edName,
      gmName,
      managerName,
      kycStatus: hasKyc ? 'VERIFIED' : 'PENDING',
      aadhaarMasked: aadhaarDoc?.document_number_masked || 'Not Uploaded',
      panMasked: panDoc?.document_number_masked || 'Not Uploaded',
      status: p.status,
      idCardId: p.id_cards[0]?.id || null,
    };
  });

  return NextResponse.json({
    results,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
}
