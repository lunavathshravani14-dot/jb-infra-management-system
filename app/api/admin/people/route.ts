import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission, maskAadhaar, maskPan, maskPhone } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const cadreId = searchParams.get('cadreId');
  const status = searchParams.get('status');

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';
  const canViewSensitiveKyc = hasPermission(session.role, 'SENSITIVE_KYC_VIEW') || session.role === 'SUPER_ADMIN';

  const where: any = {};

  if (!canViewCed) {
    where.cadre_history = {
      none: {
        is_current: true,
        cadre: { is_confidential: true },
      },
    };
  }

  if (cadreId && cadreId !== 'ALL') {
    where.cadre_history = {
      some: {
        is_current: true,
        cadre_id: cadreId,
      },
    };
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { permanent_unique_id: { contains: search } },
      { full_name: { contains: search } },
      { mobile: { contains: search } },
      { email: { contains: search } },
    ];
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
        include: { reporting_person: true },
      },
      kyc_documents: true,
      id_cards: {
        where: { is_active: true },
        take: 1,
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const formatted = people.map((p) => {
    const currentCadre = p.cadre_history[0]?.cadre?.name || 'Unassigned';
    const reportingTo = p.reporting_to[0]?.reporting_person;
    const aadhaarDoc = p.kyc_documents.find((d) => d.document_type === 'AADHAAR');
    const panDoc = p.kyc_documents.find((d) => d.document_type === 'PAN');

    return {
      id: p.id,
      permanentId: p.permanent_unique_id,
      fullName: p.full_name,
      dob: p.dob,
      mobile: canViewSensitiveKyc ? p.mobile : maskPhone(p.mobile),
      whatsapp: p.whatsapp ? (canViewSensitiveKyc ? p.whatsapp : maskPhone(p.whatsapp)) : null,
      email: p.email,
      address: p.address,
      status: p.status,
      currentCadre,
      cadreLevel: p.cadre_history[0]?.cadre?.level || 0,
      joiningDate: p.cadre_history[0]?.joining_date,
      promotionDate: p.cadre_history[0]?.promotion_date,
      reportingToName: reportingTo ? `${reportingTo.full_name} (${reportingTo.permanent_unique_id})` : null,
      reportingToId: reportingTo ? reportingTo.id : null,
      aadhaarMasked: aadhaarDoc?.document_number_masked || 'Not Submitted',
      panMasked: panDoc?.document_number_masked || 'Not Submitted',
      kycStatus: aadhaarDoc && panDoc ? 'Verified' : 'Pending',
      idCardId: p.id_cards[0]?.id || null,
    };
  });

  return NextResponse.json({ people: formatted });
}
