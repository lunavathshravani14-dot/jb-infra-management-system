import { db } from './db';

export interface HierarchyNode {
  id: string;
  permanent_unique_id: string;
  full_name: string;
  cadre: string;
  cadreLevel: number;
  mobile: string;
  email?: string | null;
  photo_url?: string | null;
  status: string;
  reportingToId?: string | null;
  reportingToName?: string | null;
  children: HierarchyNode[];
}

/**
 * Cycle detection: Check if assigning targetPerson as reporting to proposedManager creates a cycle.
 * Traverses up from proposedManager to root. If targetPerson is encountered, a cycle would occur!
 */
export async function detectCycle(targetPersonId: string, proposedManagerId: string): Promise<boolean> {
  if (targetPersonId === proposedManagerId) return true;

  const visited = new Set<string>();
  let currentId: string | null = proposedManagerId;

  while (currentId) {
    if (currentId === targetPersonId) {
      return true; // Cycle detected!
    }
    if (visited.has(currentId)) {
      // Existing loop in database
      break;
    }
    visited.add(currentId);

    const rel: { reporting_person_id: string } | null = await db.reportingRelationship.findFirst({
      where: { person_id: currentId, is_current: true },
      select: { reporting_person_id: true },
    });

    currentId = rel ? rel.reporting_person_id : null;
  }

  return false;
}

/**
 * Retrieve complete downline tree for any root person (e.g. ED or GM).
 * Recursively builds hierarchical tree structure.
 */
export async function getDownlineTree(rootPersonId: string, excludeConfidential: boolean = true): Promise<HierarchyNode | null> {
  const rootPerson = await db.person.findUnique({
    where: { id: rootPersonId },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
    },
  });

  if (!rootPerson) return null;

  const currentCadre = rootPerson.cadre_history[0]?.cadre;
  if (excludeConfidential && currentCadre?.is_confidential) {
    return null;
  }

  // Fetch all active reporting relationships and people in the system to build the tree in memory efficiently
  const allRelationships = await db.reportingRelationship.findMany({
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
  });

  // Group direct reportees by manager id
  const reporteesByManager = new Map<string, typeof allRelationships>();
  for (const rel of allRelationships) {
    const list = reporteesByManager.get(rel.reporting_person_id) || [];
    list.push(rel);
    reporteesByManager.set(rel.reporting_person_id, list);
  }

  function buildNode(person: any, managerName?: string | null): HierarchyNode {
    const cadreObj = person.cadre_history?.[0]?.cadre;
    const directReports = reporteesByManager.get(person.id) || [];

    const children: HierarchyNode[] = [];
    for (const rel of directReports) {
      const childPerson = rel.person;
      const childCadre = childPerson.cadre_history?.[0]?.cadre;
      // Skip confidential CED if unauthorized
      if (excludeConfidential && childCadre?.is_confidential) {
        continue;
      }
      children.push(buildNode(childPerson, person.full_name));
    }

    return {
      id: person.id,
      permanent_unique_id: person.permanent_unique_id,
      full_name: person.full_name,
      cadre: cadreObj?.name || 'Unassigned',
      cadreLevel: cadreObj?.level || 0,
      mobile: person.mobile,
      email: person.email,
      photo_url: person.photo_url,
      status: person.status,
      reportingToName: managerName || null,
      children,
    };
  }

  return buildNode(rootPerson);
}

/**
 * Get all members in downline as a flat list with depth levels
 */
export async function getFlatDownline(rootPersonId: string, excludeConfidential: boolean = true) {
  const tree = await getDownlineTree(rootPersonId, excludeConfidential);
  if (!tree) return [];

  const list: (Omit<HierarchyNode, 'children'> & { depth: number })[] = [];

  function traverse(node: HierarchyNode, depth: number) {
    const { children, ...rest } = node;
    list.push({ ...rest, depth });
    for (const child of children) {
      traverse(child, depth + 1);
    }
  }

  traverse(tree, 0);
  return list;
}
