import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'jb_infra_super_secure_jwt_secret_key_2026_production';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'KYC_ADMIN'
  | 'CADRE_ADMIN'
  | 'RESTRICTED_ADMIN'
  | 'EXECUTIVE';

export type Permission =
  | 'ENROLLMENT_VIEW'
  | 'ENROLLMENT_EDIT'
  | 'ENROLLMENT_APPROVE'
  | 'ENROLLMENT_REJECT'
  | 'KYC_VIEW'
  | 'KYC_APPROVE'
  | 'KYC_REJECT'
  | 'CADRE_CHANGE'
  | 'CADRE_UPGRADE'
  | 'HIERARCHY_VIEW'
  | 'SEARCH_VIEW'
  | 'EXPORT_EXCEL'
  | 'CED_VIEW'
  | 'CED_ASSIGN'
  | 'CED_UPDATE'
  | 'CED_REMOVE'
  | 'SENSITIVE_KYC_VIEW'
  | 'AUDIT_VIEW'
  | 'SETTINGS_MANAGE';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'ENROLLMENT_VIEW',
    'ENROLLMENT_EDIT',
    'ENROLLMENT_APPROVE',
    'ENROLLMENT_REJECT',
    'KYC_VIEW',
    'KYC_APPROVE',
    'KYC_REJECT',
    'CADRE_CHANGE',
    'CADRE_UPGRADE',
    'HIERARCHY_VIEW',
    'SEARCH_VIEW',
    'EXPORT_EXCEL',
    'CED_VIEW',
    'CED_ASSIGN',
    'CED_UPDATE',
    'CED_REMOVE',
    'SENSITIVE_KYC_VIEW',
    'AUDIT_VIEW',
    'SETTINGS_MANAGE',
  ],
  ADMIN: [
    'ENROLLMENT_VIEW',
    'ENROLLMENT_EDIT',
    'ENROLLMENT_APPROVE',
    'ENROLLMENT_REJECT',
    'KYC_VIEW',
    'KYC_APPROVE',
    'KYC_REJECT',
    'CADRE_CHANGE',
    'CADRE_UPGRADE',
    'HIERARCHY_VIEW',
    'SEARCH_VIEW',
    'EXPORT_EXCEL',
    'AUDIT_VIEW',
  ],
  KYC_ADMIN: [
    'ENROLLMENT_VIEW',
    'KYC_VIEW',
    'KYC_APPROVE',
    'KYC_REJECT',
    'SEARCH_VIEW',
  ],
  CADRE_ADMIN: [
    'CADRE_CHANGE',
    'CADRE_UPGRADE',
    'HIERARCHY_VIEW',
    'SEARCH_VIEW',
    'EXPORT_EXCEL',
  ],
  RESTRICTED_ADMIN: [
    'ENROLLMENT_VIEW',
    'ENROLLMENT_EDIT',
    'ENROLLMENT_APPROVE',
    'ENROLLMENT_REJECT',
    'KYC_VIEW',
    'KYC_APPROVE',
    'KYC_REJECT',
    'CADRE_CHANGE',
    'CADRE_UPGRADE',
    'HIERARCHY_VIEW',
    'SEARCH_VIEW',
    'EXPORT_EXCEL',
    'CED_VIEW',
    'CED_ASSIGN',
    'CED_UPDATE',
    'CED_REMOVE',
    'SENSITIVE_KYC_VIEW',
    'AUDIT_VIEW',
  ],
  EXECUTIVE: [],
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  personId?: string | null;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export function getSession(req: NextRequest): SessionPayload | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  const cookieToken = req.cookies.get('jb_auth_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return 'XXXX XXXX XXXX';
  const clean = aadhaar.replace(/\s+/g, '');
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
}

export function maskPan(pan: string | null | undefined): string {
  if (!pan) return 'XXXXX0000X';
  const clean = pan.trim().toUpperCase();
  if (clean.length < 4) return 'XXXXX0000X';
  const last4 = clean.slice(-4);
  return `XXXXXX${last4}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return 'XXXXXX0000';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return 'XXXXXX0000';
  return `XXXXXX${clean.slice(-4)}`;
}
