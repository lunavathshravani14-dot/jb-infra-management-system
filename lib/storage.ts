import fs from 'fs';
import path from 'path';

// Private storage directory outside public folder
const STORAGE_BASE = path.join(process.cwd(), 'private_storage');

export interface SaveDocumentOptions {
  subFolder: 'kyc' | 'id-cards';
  entityId: string; // personId or enrollmentId
  docType: string;
  version: number;
  buffer: Buffer;
  fileName?: string;
  extension?: string;
}

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function savePrivateDocument(options: SaveDocumentOptions): Promise<string> {
  const { subFolder, entityId, docType, version, buffer, fileName, extension } = options;

  let ext = extension;
  if (!ext && fileName) {
    ext = path.extname(fileName);
  }
  if (!ext) {
    ext = docType.toLowerCase().includes('photo') || docType.toLowerCase().includes('selfie') ? '.jpg' : '.pdf';
  }
  if (!ext.startsWith('.')) ext = `.${ext}`;

  let relativePath = '';
  if (subFolder === 'kyc') {
    relativePath = path.join('kyc', entityId, docType.toLowerCase(), `v${version}${ext}`);
  } else {
    relativePath = path.join('id-cards', `${entityId}_v${version}${ext}`);
  }

  const absolutePath = path.join(STORAGE_BASE, relativePath);
  ensureDirectoryExists(path.dirname(absolutePath));

  await fs.promises.writeFile(absolutePath, buffer);
  return relativePath;
}

export function getPrivateDocumentStream(relativePath: string) {
  const absolutePath = path.join(STORAGE_BASE, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return fs.createReadStream(absolutePath);
}

export function getPrivateDocumentBuffer(relativePath: string): Buffer | null {
  const absolutePath = path.join(STORAGE_BASE, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return fs.readFileSync(absolutePath);
}
