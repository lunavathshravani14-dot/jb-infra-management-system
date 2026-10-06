import { NextRequest, NextResponse } from 'next/server';
import { getSession, maskAadhaar, maskPan } from '@/lib/auth';
import { db } from '@/lib/db';
import { savePrivateDocument } from '@/lib/storage';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = getSession(req);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let documentType = (formData.get('documentType') as string || '').toUpperCase(); // 'PHOTO', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN'
    const rawNumber = formData.get('documentNumber') as string | null;

    if (documentType === 'SELFIE') documentType = 'PHOTO';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['PHOTO', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'AADHAAR', 'PAN'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ error: `Invalid document type (${documentType}). Must be PHOTO, AADHAAR_FRONT, AADHAAR_BACK, or PAN.` }, { status: 400 });
    }

    // 10MB file size limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const mimeType = file.type || 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (documentType === 'PHOTO' && !isImage) {
      return NextResponse.json({ error: 'Photo/Selfie must be an image file (JPEG, PNG, WEBP).' }, { status: 400 });
    }

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'Invalid file format. Only Image (JPG, PNG) and PDF files are allowed.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Document hash for integrity
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const tempEntityId = session?.personId || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Save to private storage
    const relativePath = await savePrivateDocument({
      subFolder: 'kyc',
      entityId: tempEntityId,
      docType: documentType.toLowerCase(),
      version: 1,
      buffer,
      fileName: file.name,
    });

    let maskedNumber: string | null = null;
    if (documentType.includes('AADHAAR')) {
      maskedNumber = rawNumber ? maskAadhaar(rawNumber) : null;
    } else if (documentType === 'PAN') {
      maskedNumber = rawNumber ? maskPan(rawNumber) : null;
    }

    // Create record in KycDocument table
    const kycDoc = await db.kycDocument.create({
      data: {
        document_type: documentType,
        document_number_masked: maskedNumber,
        document_hash: hash,
        file_path: relativePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
        version: 1,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      documentId: kycDoc.id,
      documentType: kycDoc.document_type,
      maskedNumber: kycDoc.document_number_masked,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: `/api/documents/kyc/${kycDoc.id}`,
      isImage,
    });
  } catch (error: any) {
    console.error('KYC Upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
