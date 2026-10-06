import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission, maskAadhaar, maskPan, maskPhone } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPersonCareerTimeline } from '@/lib/cadre';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(req);
  if (!session || session.role === 'EXECUTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canViewCed = hasPermission(session.role, 'CED_VIEW') || session.role === 'SUPER_ADMIN';
  const canViewSensitive = hasPermission(session.role, 'SENSITIVE_KYC_VIEW') || session.role === 'SUPER_ADMIN';

  const person = await db.person.findUnique({
    where: { id: params.id },
    include: {
      cadre_history: {
        include: { cadre: true },
        orderBy: [{ start_date: 'asc' }, { created_at: 'asc' }],
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
      reportees: {
        where: { is_current: true },
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
      },
      kyc_documents: {
        orderBy: { version: 'desc' },
      },
      id_cards: {
        orderBy: { version: 'desc' },
      },
    },
  });

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  // If person has confidential CED cadre and user lacks permission, return 403 Forbidden!
  const isCed = person.cadre_history.some((h) => h.is_current && h.cadre.is_confidential);
  if (isCed && !canViewCed) {
    return NextResponse.json({ error: 'Forbidden: Access to CED records restricted' }, { status: 403 });
  }

  const timeline = await getPersonCareerTimeline(person.id);
  const currentCadreHistory = person.cadre_history.find((h) => h.is_current);
  const directManager = person.reporting_to[0]?.reporting_person;

  // Available cadres for upgrade
  const availableCadres = await db.cadre.findMany({
    where: canViewCed ? {} : { is_confidential: false },
    orderBy: { level: 'asc' },
  });

  // Available managers (excluding this person to prevent self-assignment)
  const potentialManagers = await db.person.findMany({
    where: {
      id: { not: person.id },
      status: 'ACTIVE',
      ...(canViewCed ? {} : {
        cadre_history: {
          none: { is_current: true, cadre: { is_confidential: true } },
        },
      }),
    },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
    },
    take: 100,
  });

  return NextResponse.json({
    person: {
      id: person.id,
      permanentId: person.permanent_unique_id,
      fullName: person.full_name,
      dob: person.dob,
      mobile: canViewSensitive ? person.mobile : maskPhone(person.mobile),
      whatsapp: person.whatsapp ? (canViewSensitive ? person.whatsapp : maskPhone(person.whatsapp)) : null,
      email: person.email,
      address: person.address,
      status: person.status,
      currentCadre: currentCadreHistory?.cadre?.name || 'Unassigned',
      currentCadreId: currentCadreHistory?.cadre_id,
      currentJoiningDate: currentCadreHistory?.joining_date,
      currentPromotionDate: currentCadreHistory?.promotion_date,
      reportingTo: directManager ? {
        id: directManager.id,
        name: directManager.full_name,
        permanentId: directManager.permanent_unique_id,
        cadre: directManager.cadre_history[0]?.cadre?.name || 'Manager',
      } : null,
      timeline,
      directReportees: person.reportees.map((r) => ({
        id: r.person.id,
        name: r.person.full_name,
        permanentId: r.person.permanent_unique_id,
        cadre: r.person.cadre_history[0]?.cadre?.name || 'Executive',
      })),
      kycDocuments: person.kyc_documents.map((d) => ({
        id: d.id,
        documentType: d.document_type,
        maskedNumber: d.document_number_masked,
        version: d.version,
        status: d.status,
        fileSize: d.file_size,
        uploadedAt: d.uploaded_at,
      })),
      idCards: person.id_cards.map((c) => ({
        id: c.id,
        cardNumber: c.card_number,
        version: c.version,
        generatedAt: c.generated_at,
        generatedBy: c.generated_by,
      })),
    },
    availableCadres,
    potentialManagers: potentialManagers.map((m) => ({
      id: m.id,
      name: m.full_name,
      permanentId: m.permanent_unique_id,
      cadre: m.cadre_history[0]?.cadre?.name || 'Manager',
    })),
  });
}
