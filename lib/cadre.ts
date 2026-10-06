import { db } from './db';
import { logAudit } from './audit';
import { detectCycle } from './hierarchy';

export interface UpgradeCadreOptions {
  personId: string;
  newCadreId: string;
  joiningDate: Date;
  promotionDate?: Date;
  reportingPersonId?: string | null;
  remarks?: string;
  adminUserId?: string;
  adminUserName?: string;
  adminUserRole?: string;
  ipAddress?: string;
}

export async function upgradePersonCadre(options: UpgradeCadreOptions) {
  const {
    personId,
    newCadreId,
    joiningDate,
    promotionDate = new Date(),
    reportingPersonId,
    remarks,
    adminUserId,
    adminUserName,
    adminUserRole,
    ipAddress,
  } = options;

  // 1. Fetch person and current cadre
  const person = await db.person.findUnique({
    where: { id: personId },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
    },
  });

  if (!person) {
    throw new Error('Person not found');
  }

  // 2. Fetch new cadre
  const newCadre = await db.cadre.findUnique({
    where: { id: newCadreId },
  });

  if (!newCadre) {
    throw new Error('Selected cadre does not exist');
  }

  // Check if new cadre is CED and verify permissions
  if (newCadre.is_confidential && adminUserRole !== 'SUPER_ADMIN' && adminUserRole !== 'RESTRICTED_ADMIN') {
    throw new Error('Unauthorized: CED cadre requires CED_ASSIGN permission');
  }

  // 3. Prevent circular reporting if reportingPersonId is provided
  if (reportingPersonId) {
    if (reportingPersonId === personId) {
      throw new Error('A person cannot report to themselves');
    }
    const hasCycle = await detectCycle(personId, reportingPersonId);
    if (hasCycle) {
      throw new Error('Invalid reporting assignment: Circular hierarchy detected');
    }
  }

  const oldCurrentHistory = person.cadre_history[0];
  const oldCadreName = oldCurrentHistory?.cadre?.name || 'None';

  // 4. Execute atomic update
  const result = await db.$transaction(async (tx) => {
    const now = new Date();

    // Mark previous cadre history as no longer current (IMMUTABLE - never delete!)
    if (oldCurrentHistory) {
      await tx.cadreHistory.update({
        where: { id: oldCurrentHistory.id },
        data: {
          is_current: false,
          end_date: now,
        },
      });
    }

    // Create new cadre history record
    const newHistory = await tx.cadreHistory.create({
      data: {
        person_id: personId,
        cadre_id: newCadreId,
        joining_date: joiningDate,
        promotion_date: promotionDate,
        start_date: now,
        is_current: true,
        changed_by: adminUserName || 'Admin',
        remarks: remarks || null,
      },
      include: {
        cadre: true,
      },
    });

    // Update reporting relationship if changed
    if (reportingPersonId !== undefined) {
      // Mark old relationship as not current
      await tx.reportingRelationship.updateMany({
        where: { person_id: personId, is_current: true },
        data: { is_current: false, effective_to: now },
      });

      if (reportingPersonId) {
        await tx.reportingRelationship.create({
          data: {
            person_id: personId,
            reporting_person_id: reportingPersonId,
            effective_from: now,
            is_current: true,
          },
        });
      }
    }

    return newHistory;
  });

  // 5. Audit log
  await logAudit({
    userId: adminUserId,
    userName: adminUserName,
    userRole: adminUserRole,
    action: 'CADRE_UPGRADE',
    entityType: 'PERSON',
    entityId: personId,
    ipAddress,
    details: {
      permanent_unique_id: person.permanent_unique_id,
      oldCadre: oldCadreName,
      newCadre: newCadre.name,
      promotionDate: promotionDate.toISOString(),
      joiningDate: joiningDate.toISOString(),
      remarks,
    },
  });

  return {
    success: true,
    permanent_unique_id: person.permanent_unique_id,
    newCadre: newCadre.name,
    historyId: result.id,
  };
}

export async function getPersonCareerTimeline(personId: string) {
  const history = await db.cadreHistory.findMany({
    where: { person_id: personId },
    include: { cadre: true },
    orderBy: [{ start_date: 'asc' }, { created_at: 'asc' }],
  });

  return history.map((item) => ({
    id: item.id,
    cadreName: item.cadre.name,
    cadreLevel: item.cadre.level,
    isConfidential: item.cadre.is_confidential,
    joiningDate: item.joining_date,
    promotionDate: item.promotion_date,
    startDate: item.start_date,
    endDate: item.end_date,
    isCurrent: item.is_current,
    changedBy: item.changed_by,
    remarks: item.remarks,
  }));
}
