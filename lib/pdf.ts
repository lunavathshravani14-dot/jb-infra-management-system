import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface IdCardData {
  permanentId: string;
  fullName: string;
  cadre: string;
  team?: string | null;
  mobile: string;
  dob?: string | null;
  joiningDate: string;
  photoBuffer?: Buffer | null;
  version: number;
}

/**
 * Generate a professional vertical wallet-sized ID card PDF.
 * Dimensions: standard CR80 portrait ratio (240pt x 380pt)
 */
export async function generateIdCardPdf(data: IdCardData): Promise<Buffer> {
  // Generate QR Code pointing to public verification certificate
  const verifyUrl = `/verify/${data.permanentId}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    width: 90,
    margin: 1,
    color: {
      dark: '#082849',
      light: '#ffffff',
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [240, 380], // Wallet ID card size
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // --- Background Design ---
    // Top Navy Header
    doc.rect(0, 0, 240, 75).fill('#082849');

    // Gold accent divider stripe
    doc.rect(0, 75, 240, 5).fill('#d97706');

    // White Card Body
    doc.rect(0, 80, 240, 300).fill('#ffffff');

    // Header: Logo & Text
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 16, 12, { height: 32 });
        doc.fillColor('#fbbf24').fontSize(13).font('Helvetica-Bold');
        doc.text('JB INFRA', 55, 16, { align: 'center', width: 170 });
        doc.fillColor('#ffffff').fontSize(7).font('Helvetica');
        doc.text('EXECUTIVE IDENTITY CARD', 55, 33, { align: 'center', width: 170 });
      } catch (err) {
        doc.fillColor('#fbbf24').fontSize(14).font('Helvetica-Bold');
        doc.text('JB INFRA', 0, 18, { align: 'center', width: 240 });
        doc.fillColor('#ffffff').fontSize(7).font('Helvetica');
        doc.text('EXECUTIVE IDENTITY CARD', 0, 36, { align: 'center', width: 240 });
      }
    } else {
      doc.fillColor('#fbbf24').fontSize(14).font('Helvetica-Bold');
      doc.text('JB INFRA', 0, 18, { align: 'center', width: 240 });
      doc.fillColor('#ffffff').fontSize(7).font('Helvetica');
      doc.text('EXECUTIVE IDENTITY CARD', 0, 36, { align: 'center', width: 240 });
    }

    // Decorative ID pill
    doc.roundedRect(60, 48, 120, 18, 4).fill('#026fc7');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text(data.permanentId, 60, 52, { align: 'center', width: 120 });

    // --- Photo Avatar Frame ---
    doc.roundedRect(85, 95, 70, 75, 6).lineWidth(2).strokeColor('#026fc7').fillColor('#f0f7ff').fillAndStroke();

    let photoRendered = false;
    if (data.photoBuffer && data.photoBuffer.length > 0) {
      try {
        doc.image(data.photoBuffer, 86, 96, { width: 68, height: 73, fit: [68, 73], align: 'center', valign: 'center' });
        photoRendered = true;
      } catch {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      // Initials avatar
      const initials = data.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'JB';

      doc.fillColor('#0358a1').fontSize(24).font('Helvetica-Bold');
      doc.text(initials, 85, 120, { align: 'center', width: 70 });
    }

    // --- Person Name ---
    doc.fillColor('#082849').fontSize(12).font('Helvetica-Bold');
    doc.text(data.fullName.toUpperCase(), 15, 180, { align: 'center', width: 210 });

    // Cadre Badge
    doc.roundedRect(65, 198, 110, 16, 8).fill('#e0effe');
    doc.fillColor('#0358a1').fontSize(8).font('Helvetica-Bold');
    doc.text(data.cadre.toUpperCase(), 65, 202, { align: 'center', width: 110 });

    // --- Metadata Rows ---
    let y = 222;
    const addRow = (label: string, value: string) => {
      doc.fillColor('#64748b').fontSize(7).font('Helvetica');
      doc.text(label, 20, y, { width: 70 });
      doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold');
      doc.text(value, 95, y, { width: 125 });
      y += 14;
    };

    addRow('Team / Unit:', data.team || 'Corporate Operations');
    addRow('Joining Date:', data.joiningDate);
    addRow('Mobile:', data.mobile);

    // --- QR Code Section ---
    doc.image(qrBuffer, 75, 268, { width: 90, height: 90 });

    // --- Bottom Bar ---
    doc.rect(0, 365, 240, 15).fill('#082849');
    doc.fillColor('#94a3b8').fontSize(6).font('Helvetica');
    doc.text('Property of JB Infra • If found, please return to HQ', 0, 370, { align: 'center', width: 240 });

    doc.end();
  });
}
