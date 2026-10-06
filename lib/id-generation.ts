import { db } from './db';
import { logAudit } from './audit';

export interface GenerateIdOptions {
  seriesName?: string;
  adminUserId?: string;
  adminUserName?: string;
  ipAddress?: string;
}

/**
 * Formats an ID according to the pattern template.
 * Supports:
 * - {PREFIX}: Prefix string e.g. JB26 or JB
 * - {YEAR:2}: 2-digit year (e.g. 26)
 * - {YEAR}: 4-digit year (e.g. 2026)
 * - {SERIAL:N}: Serial integer padded to N digits (e.g. {SERIAL:4} -> 0000)
 * - {SERIAL}: Standard serial without fixed padding
 */
export function formatId(pattern: string, prefix: string, currentYear: string, serialValue: number): string {
  let result = pattern || '{PREFIX}{SERIAL:4}';
  const shortYear = currentYear.slice(-2);

  result = result.replace(/\{PREFIX\}/g, prefix);
  result = result.replace(/\{YEAR:2\}/g, shortYear);
  result = result.replace(/\{YEAR:4\}/g, currentYear);
  result = result.replace(/\{YEAR\}/g, currentYear);

  // Match {SERIAL:N} e.g. {SERIAL:4} or {SERIAL:6}
  result = result.replace(/\{SERIAL:(\d+)\}/g, (_, length) => {
    return String(Math.max(0, serialValue)).padStart(parseInt(length, 10), '0');
  });

  // Match {SERIAL}
  if (result.includes('{SERIAL}')) {
    result = result.replace(/\{SERIAL\}/g, String(serialValue));
  }

  // Fallback if not templated
  if (result === pattern && !pattern.includes('{')) {
    result = `${prefix}${String(Math.max(0, serialValue)).padStart(4, '0')}`;
  }

  return result;
}

/**
 * Transaction-safe, concurrency-safe Permanent Unique ID Generation
 * Supports format JB260000, JB260001, JB260002... or continuing legacy series (JB10250 -> JB10251).
 */
export async function generatePermanentUniqueId(options: GenerateIdOptions = {}): Promise<string> {
  const seriesName = options.seriesName || 'DEFAULT';

  // Use interactive Prisma transaction to atomically increment sequence
  const generatedId = await db.$transaction(async (tx) => {
    // 1. Get or create sequence
    let sequence = await tx.idSequence.findUnique({
      where: { series_name: seriesName },
    });

    const currentYear = new Date().getFullYear().toString();

    if (!sequence) {
      // Default initial sequence: JB260000 (Prefix JB26 with 4 zeros: 0000)
      sequence = await tx.idSequence.create({
        data: {
          series_name: seriesName,
          prefix: 'JB26',
          current_value: 0,
          pattern: '{PREFIX}{SERIAL:4}',
          is_active: true,
        },
      });
    }

    const isFixedZeroIndexed = sequence.pattern.includes('{SERIAL:');
    let nextValue = isFixedZeroIndexed ? sequence.current_value : sequence.current_value + 1;
    let candidateId = '';
    let isUnique = false;
    let attempts = 0;

    // Loop until we find a strictly unique ID in the database (ensuring never reused and no collisions)
    while (!isUnique && attempts < 100) {
      attempts++;
      candidateId = formatId(sequence.pattern, sequence.prefix, currentYear, nextValue);

      // Verify uniqueness in Person table
      const existing = await tx.person.findUnique({
        where: { permanent_unique_id: candidateId },
      });

      if (!existing) {
        isUnique = true;
      } else {
        nextValue++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate a unique permanent ID after 100 attempts.');
    }

    // Atomically update sequence current_value
    await tx.idSequence.update({
      where: { id: sequence.id },
      data: { current_value: isFixedZeroIndexed ? nextValue + 1 : nextValue },
    });

    return candidateId;
  });

  // Record audit log
  await logAudit({
    userId: options.adminUserId,
    userName: options.adminUserName,
    action: 'ID_GENERATED',
    entityType: 'ID_SEQUENCE',
    entityId: generatedId,
    ipAddress: options.ipAddress,
    details: {
      seriesName,
      generatedId,
      timestamp: new Date().toISOString(),
    },
  });

  return generatedId;
}

/**
 * Configure or continue an existing ID series
 * Example: configureSequence('LEGACY_SERIES', 'JB', 10250, '{PREFIX}{SERIAL}')
 */
export async function configureSequence(
  seriesName: string,
  prefix: string,
  startValue: number,
  pattern: string = '{PREFIX}{SERIAL}'
) {
  return db.idSequence.upsert({
    where: { series_name: seriesName },
    update: {
      prefix,
      current_value: startValue,
      pattern,
      is_active: true,
    },
    create: {
      series_name: seriesName,
      prefix,
      current_value: startValue,
      pattern,
      is_active: true,
    },
  });
}
