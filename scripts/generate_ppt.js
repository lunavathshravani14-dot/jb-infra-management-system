const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'JB Infra Group';
  pptx.company = 'JB Infra Group';
  pptx.title = 'JB Infra Executive & Cadre Management System';
  pptx.subject = 'Enterprise Digital Transformation Presentation';

  const logoPath = path.resolve(__dirname, '../public/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Color Palette
  const C_BG_DARK = '0B132B';
  const C_NAVY = '1C2541';
  const C_CARD = '1E293B';
  const C_CARD_BORDER = '334155';
  const C_BLUE = '3B82F6';
  const C_AMBER = 'F59E0B';
  const C_EMERALD = '10B981';
  const C_WHITE = 'FFFFFF';
  const C_MUTED = '94A3B8';
  const C_LIGHT_GRAY = 'F1F5F9';
  const C_PURPLE = '8B5CF6';

  const FONT_TITLE = 'Segoe UI';
  const FONT_BODY = 'Segoe UI';

  // Helper for slide base decoration
  function applyHeader(slide, title, category = 'JB INFRA MANAGEMENT SYSTEM') {
    slide.background = { color: C_BG_DARK };

    // Top Category Tag
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 8.5,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
      letterSpacing: 2,
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.65,
      w: 9.5,
      h: 0.6,
      fontSize: 22,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });

    // Top Right Small Logo or Watermark
    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 11.2,
        y: 0.4,
        w: 1.3,
        h: 0.65,
        sizing: { type: 'contain', w: 1.3, h: 0.65 },
      });
    }

    // Bottom Footer Line
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8,
      y: 7.0,
      w: 11.7,
      h: 0.02,
      fill: { color: C_CARD_BORDER },
      line: { color: C_CARD_BORDER, width: 0 },
    });

    // Footer Text
    slide.addText('JB Infra Group • Executive & Cadre Management System • Confidential & Proprietary', {
      x: 0.8,
      y: 7.05,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_BODY,
      color: C_MUTED,
    });
  }

  // ==========================================
  // SLIDE 1: TITLE SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };

    // Decorative gradient-like accent shapes
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.15,
      fill: { color: C_BLUE },
      line: { color: C_BLUE, width: 0 },
    });

    // Center Logo
    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 5.4,
        y: 1.0,
        w: 2.5,
        h: 1.3,
        sizing: { type: 'contain', w: 2.5, h: 1.3 },
      });
    }

    // Pill Badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.6,
      y: 2.5,
      w: 6.13,
      h: 0.4,
      fill: { color: '172554' },
      line: { color: C_BLUE, width: 1 },
      rectRadius: 0.2,
    });
    slide.addText('ENTERPRISE RULE: ONE PERSON = ONE PERMANENT UNIQUE ID', {
      x: 3.6,
      y: 2.5,
      w: 6.13,
      h: 0.4,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Big Title
    slide.addText('JB INFRA MANAGEMENT SYSTEM', {
      x: 1.0,
      y: 3.0,
      w: 11.33,
      h: 0.9,
      fontSize: 34,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
      align: 'center',
    });

    // Subtitle
    slide.addText('Next-Generation Associate Onboarding, Cadre Hierarchy & Smart ID Governance', {
      x: 1.5,
      y: 3.9,
      w: 10.33,
      h: 0.6,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: C_MUTED,
      align: 'center',
    });

    // 3 Highlight Feature Badges at Bottom
    const highlights = [
      { text: 'Split-Screen KYC Review', color: C_EMERALD },
      { text: 'Instant Anti-Counterfeit QR ID Cards', color: C_BLUE },
      { text: 'Dynamic Downline Tree Tracking', color: C_PURPLE },
    ];
    highlights.forEach((item, idx) => {
      const xPos = 1.8 + idx * 3.4;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 4.8,
        w: 3.1,
        h: 0.9,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.1,
      });
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: xPos,
        y: 4.8,
        w: 0.1,
        h: 0.9,
        fill: { color: item.color },
        line: { color: item.color, width: 0 },
      });
      slide.addText(item.text, {
        x: xPos + 0.2,
        y: 4.8,
        w: 2.8,
        h: 0.9,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_WHITE,
        bold: true,
        valign: 'middle',
      });
    });

    // Presenter Info
    slide.addText('Comprehensive Technical & Business Pitch • Ready for Production Deployment', {
      x: 1.0,
      y: 6.4,
      w: 11.33,
      h: 0.4,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_MUTED,
      align: 'center',
    });
  }

  // ==========================================
  // SLIDE 2: THE CORE CHALLENGE (PROBLEM STATEMENT)
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Current Operational Bottlenecks in Field Management', 'The Problem');

    const problems = [
      {
        num: '01',
        title: 'Fragmented Identities Across Promotions',
        desc: 'When field associates are promoted from ME to GM or ED, manual records lose history. Duplicate IDs are created, breaking downline lineage and sales tracking.',
        tag: 'Identity Duplication',
        tagColor: 'EF4444',
      },
      {
        num: '02',
        title: 'Slow, Paper-Heavy KYC Approval Cycles',
        desc: 'Physical paper collection of Aadhaar and PAN documents takes 3-7 days. Incomplete documents stall onboarding, and sensitive PII gets scattered insecurely.',
        tag: 'High Turnaround Latency',
        tagColor: C_AMBER,
      },
      {
        num: '03',
        title: 'Counterfeiting & Unauthorized Representation',
        desc: 'Printed cards lack dynamic digital verification. Clients and authorities cannot confirm real-time active status, exposing the firm to brand impersonation.',
        tag: 'Brand Vulnerability',
        tagColor: 'EF4444',
      },
    ];

    problems.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 1.6,
        w: 3.7,
        h: 4.9,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.15,
      });

      // Number badge
      slide.addText(p.num, {
        x: xPos + 0.3,
        y: 1.9,
        w: 1.0,
        h: 0.5,
        fontSize: 24,
        fontFace: FONT_TITLE,
        color: C_BLUE,
        bold: true,
      });

      // Category Pill
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos + 1.3,
        y: 1.95,
        w: 2.1,
        h: 0.35,
        fill: { color: '2A1215' },
        line: { color: p.tagColor, width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(p.tag, {
        x: xPos + 1.3,
        y: 1.95,
        w: 2.1,
        h: 0.35,
        fontSize: 9,
        fontFace: FONT_BODY,
        color: p.tagColor,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      // Title
      slide.addText(p.title, {
        x: xPos + 0.3,
        y: 2.6,
        w: 3.1,
        h: 0.9,
        fontSize: 15,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
      });

      // Description
      slide.addText(p.desc, {
        x: xPos + 0.3,
        y: 3.6,
        w: 3.1,
        h: 2.4,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_MUTED,
        lineSpacing: 18,
      });
    });
  }

  // ==========================================
  // SLIDE 3: THE SOLUTION ARCHITECTURE
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'The Solution: Unified Dual-Portal Ecosystem', 'Platform Architecture');

    // Left Portal: Executive Portal
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: '0F223D' },
      line: { color: C_BLUE, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('PORTAL 01', {
      x: 1.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_BLUE,
      bold: true,
    });
    slide.addText('Field Executive Self-Service Portal', {
      x: 1.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• 3-Minute Mobile Self-Enrollment\n', options: { bold: true, color: C_WHITE } },
      { text: '  Multi-step wizard with Zod real-time validation.\n\n', options: { color: C_MUTED } },
      { text: '• Mandatory Digital Document Upload\n', options: { bold: true, color: C_WHITE } },
      { text: '  Client-side validation of Aadhaar & PAN PDFs.\n\n', options: { color: C_MUTED } },
      { text: '• Real-Time Application Tracker\n', options: { bold: true, color: C_WHITE } },
      { text: '  Live statuses: Pending, Review, Approved, or Correction.\n\n', options: { color: C_MUTED } },
      { text: '• Instant Smart ID Card Download\n', options: { bold: true, color: C_WHITE } },
      { text: '  Print-ready dual-sided wallet card with verification QR.\n', options: { color: C_MUTED } },
    ], {
      x: 1.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 15,
    });

    // Right Portal: Admin Control Center
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: '2B1D0F' },
      line: { color: C_AMBER, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('PORTAL 02', {
      x: 7.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
    });
    slide.addText('Enterprise Admin Command Center', {
      x: 7.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Split-Screen Live KYC Engine\n', options: { bold: true, color: C_WHITE } },
      { text: '  Side-by-side applicant data and PDF viewer without download.\n\n', options: { color: C_MUTED } },
      { text: '• Seamless Cadre Progression\n', options: { bold: true, color: C_WHITE } },
      { text: '  Promotions update career records without changing ID.\n\n', options: { color: C_MUTED } },
      { text: '• Dynamic Downline Hierarchy\n', options: { bold: true, color: C_WHITE } },
      { text: '  Interactive organizational tree with cycle-loop safeguards.\n\n', options: { color: C_MUTED } },
      { text: '• ExcelJS Automated Reporting\n', options: { bold: true, color: C_WHITE } },
      { text: '  Single-click export with cell formulas and styled sheets.\n', options: { color: C_MUTED } },
    ], {
      x: 7.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 15,
    });
  }

  // ==========================================
  // SLIDE 4: THE PERMANENT UNIQUE ID ENGINE
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Core Innovation: "One Person = One Permanent Unique ID"', 'Identity Foundation');

    // Central Banner
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 1.1,
      fill: { color: C_CARD },
      line: { color: C_BLUE, width: 1.5 },
      rectRadius: 0.1,
    });
    slide.addText('THE GOLDEN ENTERPRISE RULE', {
      x: 1.1,
      y: 1.8,
      w: 11.0,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
      letterSpacing: 2,
    });
    slide.addText('Every associate receives a single permanent code (e.g. JBIN000104) that remains immutable for life.', {
      x: 1.1,
      y: 2.1,
      w: 11.0,
      h: 0.45,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });

    // 3 Lifecycle Pillars
    const pillars = [
      {
        title: 'Promotion Without Fractured Records',
        desc: 'When an executive rises to Manager, GM, or Executive Director, their cadre history updates in the database. Their JBIN ID and client relationships remain 100% consistent.',
      },
      {
        title: 'Automated Deduplication Protocol',
        desc: 'The system automatically performs cryptographic hash checks on Aadhaar and PAN documents. An applicant cannot register duplicate profiles under aliases.',
      },
      {
        title: 'Flexible Sequence Management',
        desc: 'Supports dynamic auto-incrementing JBIN 6-digit series as well as continuing legacy numbering series (e.g. continuing from JB10250) for zero disruption.',
      },
    ];

    pillars.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 3.0,
        w: 3.7,
        h: 3.7,
        fill: { color: C_NAVY },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.15,
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: xPos + 0.3,
        y: 3.3,
        w: 0.6,
        h: 0.6,
        fill: { color: C_BLUE },
        line: { color: C_BLUE, width: 0 },
      });
      slide.addText(`${idx + 1}`, {
        x: xPos + 0.3,
        y: 3.3,
        w: 0.6,
        h: 0.6,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(p.title, {
        x: xPos + 0.3,
        y: 4.1,
        w: 3.1,
        h: 0.7,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
      });

      slide.addText(p.desc, {
        x: xPos + 0.3,
        y: 4.9,
        w: 3.1,
        h: 1.6,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_MUTED,
        lineSpacing: 16,
      });
    });
  }

  // ==========================================
  // SLIDE 5: 8-TIER CADRE & HIERARCHY
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, '8-Tier Cadre Hierarchy & Organizational Tree', 'Structure & Governance');

    // Cadre Ladder
    const cadres = [
      { name: 'ME', label: 'Marketing Executive', lvl: 'L1', col: '64748B' },
      { name: 'MM', label: 'Marketing Manager', lvl: 'L2', col: '0284C7' },
      { name: 'SMM', label: 'Sr. Marketing Manager', lvl: 'L3', col: '2563EB' },
      { name: 'AGM', label: 'Asst. General Manager', lvl: 'L4', col: '4F46E5' },
      { name: 'DGM', label: 'Deputy General Manager', lvl: 'L5', col: '7C3AED' },
      { name: 'GM', label: 'General Manager', lvl: 'L6', col: '9333EA' },
      { name: 'ED', label: 'Executive Director', lvl: 'L7', col: 'D97706' },
      { name: 'CED', label: 'Chief Executive Director', lvl: 'L8 (Confidential)', col: 'DC2626' },
    ];

    cadres.forEach((c, idx) => {
      const yPos = 1.6 + idx * 0.62;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: yPos,
        w: 5.7,
        h: 0.52,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.08,
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.8,
        y: yPos,
        w: 0.6,
        h: 0.52,
        fill: { color: c.col },
        line: { color: c.col, width: 0 },
      });
      slide.addText(c.name, {
        x: 0.8,
        y: yPos,
        w: 0.6,
        h: 0.52,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C_WHITE,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(c.label, {
        x: 1.5,
        y: yPos,
        w: 3.2,
        h: 0.52,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_WHITE,
        bold: true,
        valign: 'middle',
      });

      slide.addText(c.lvl, {
        x: 4.8,
        y: yPos,
        w: 1.6,
        h: 0.52,
        fontSize: 9,
        fontFace: FONT_BODY,
        color: C_MUTED,
        align: 'right',
        valign: 'middle',
      });
    });

    // Right Side: Hierarchy Tree Highlights
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: C_NAVY },
      line: { color: C_PURPLE, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('DOWNLINE & TREE TRACKING', {
      x: 7.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_PURPLE,
      bold: true,
    });
    slide.addText('Real-Time Downline Visualization', {
      x: 7.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Full Recursive Downline Explorer\n', options: { bold: true, color: C_WHITE } },
      { text: '  View the entire reporting chain under any ED or GM in a responsive interactive tree.\n\n', options: { color: C_MUTED } },
      { text: '• Cycle-Loop Prevention Engine\n', options: { bold: true, color: C_WHITE } },
      { text: '  Built-in graph validator prohibits circular reporting (e.g., A reports to B who reports to A).\n\n', options: { color: C_MUTED } },
      { text: '• Chain-of-Command Metadata\n', options: { bold: true, color: C_WHITE } },
      { text: '  Tracks ME, MM, SMM, AGM, DGM, and GM upline assignments automatically.\n\n', options: { color: C_MUTED } },
      { text: '• Instant Reassignment\n', options: { bold: true, color: C_WHITE } },
      { text: '  Update reporting managers seamlessly when leaders move or expand teams.\n', options: { color: C_MUTED } },
    ], {
      x: 7.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 15,
    });
  }

  // ==========================================
  // SLIDE 6: MODULE 1 - DIGITAL ONBOARDING
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Module 1: Paperless Self-Enrollment & Onboarding', 'Field Experience');

    const steps = [
      {
        step: 'STEP 1',
        title: 'Personal & Family Data',
        items: ['Full Name & DOB', 'Automatic age calculation', 'Father/Husband name', 'Mobile & WhatsApp sync'],
      },
      {
        step: 'STEP 2',
        title: 'Geographic Address',
        items: ['House No. & Street', 'Village / City & Mandal', 'District & State mapping', 'Pincode postal validation'],
      },
      {
        step: 'STEP 3',
        title: 'Cadre & Reporting Chain',
        items: ['Select applied rank (ME/MM)', 'Designated sales team', 'Select reporting manager', 'Automatic upline hierarchy linking'],
      },
      {
        step: 'STEP 4',
        title: 'Instant KYC Document Upload',
        items: ['Mandatory Aadhaar Front PDF', 'Mandatory Aadhaar Back PDF', 'Mandatory PAN Card PDF', 'Applicant passport photo'],
      },
    ];

    steps.forEach((s, idx) => {
      const xPos = 0.8 + idx * 3.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 1.6,
        w: 2.8,
        h: 4.9,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.12,
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos + 0.2,
        y: 1.9,
        w: 1.0,
        h: 0.35,
        fill: { color: '1E3A8A' },
        line: { color: C_BLUE, width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(s.step, {
        x: xPos + 0.2,
        y: 1.9,
        w: 1.0,
        h: 0.35,
        fontSize: 9,
        fontFace: FONT_BODY,
        color: C_BLUE,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(s.title, {
        x: xPos + 0.2,
        y: 2.4,
        w: 2.4,
        h: 0.7,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
      });

      const bullets = s.items.map(item => `• ${item}`).join('\n\n');
      slide.addText(bullets, {
        x: xPos + 0.2,
        y: 3.2,
        w: 2.4,
        h: 3.1,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_MUTED,
        lineSpacing: 14,
      });
    });
  }

  // ==========================================
  // SLIDE 7: MODULE 2 - SPLIT-SCREEN KYC REVIEW
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Module 2: Split-Screen KYC Review Engine', 'Compliance & Review');

    // Big Mockup Container
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 4.1,
      fill: { color: '0A1120' },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.15,
    });

    // Left Panel: Form Data (50%)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1,
      y: 1.9,
      w: 5.4,
      h: 3.5,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('LEFT PANE: APPLICANT METADATA', {
      x: 1.3,
      y: 2.1,
      w: 5.0,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_BLUE,
      bold: true,
    });
    slide.addText([
      { text: 'Applicant Name: ', options: { bold: true, color: C_WHITE } },
      { text: 'Rajesh Kumar Verma\n', options: { color: C_AMBER } },
      { text: 'Applied Cadre: ', options: { bold: true, color: C_WHITE } },
      { text: 'Marketing Executive (ME)\n', options: { color: C_MUTED } },
      { text: 'Mobile / WhatsApp: ', options: { bold: true, color: C_WHITE } },
      { text: '+91 98765 43210\n', options: { color: C_MUTED } },
      { text: 'Reporting Leader: ', options: { bold: true, color: C_WHITE } },
      { text: 'K. Venkatesh (GM - Hyderabad South)\n', options: { color: C_MUTED } },
      { text: 'Address: ', options: { bold: true, color: C_WHITE } },
      { text: 'Plot 42, Hitech City, R.R. District, Telangana\n', options: { color: C_MUTED } },
    ], {
      x: 1.3,
      y: 2.5,
      w: 5.0,
      h: 2.7,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 14,
    });

    // Right Panel: Live PDF Viewer (50%)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8,
      y: 1.9,
      w: 5.4,
      h: 3.5,
      fill: { color: '141E33' },
      line: { color: C_EMERALD, width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('RIGHT PANE: LIVE IN-BROWSER PDF VIEWER', {
      x: 7.0,
      y: 2.1,
      w: 5.0,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_EMERALD,
      bold: true,
    });
    slide.addText([
      { text: '📄 Aadhaar Front PDF — Verified (DOB & Name match)\n', options: { bold: true, color: C_WHITE } },
      { text: '📄 Aadhaar Back PDF — Verified (Address match)\n', options: { bold: true, color: C_WHITE } },
      { text: '📄 PAN Card PDF — Verified (Tax ID hash unique)\n\n', options: { bold: true, color: C_WHITE } },
      { text: 'Zero Client File Downloads:\n', options: { bold: true, color: C_AMBER } },
      { text: 'Documents are streamed securely via authenticated APIs. No sensitive citizen PII is ever leaked to admin desktop folders.', options: { color: C_MUTED } },
    ], {
      x: 7.0,
      y: 2.5,
      w: 5.0,
      h: 2.7,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 14,
    });

    // 3 Action Buttons below
    const actions = [
      { text: '✓ APPROVE & GENERATE ID CARD', col: C_EMERALD, fill: '064E3B' },
      { text: '⚠️ REQUEST CORRECTION (SPECIFIC NOTE)', col: C_AMBER, fill: '451A03' },
      { text: '✕ REJECT WITH AUDIT REASON', col: 'EF4444', fill: '450A0A' },
    ];
    actions.forEach((a, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 5.9,
        w: 3.7,
        h: 0.8,
        fill: { color: a.fill },
        line: { color: a.col, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(a.text, {
        x: xPos,
        y: 5.9,
        w: 3.7,
        h: 0.8,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: a.col,
        bold: true,
        align: 'center',
        valign: 'middle',
      });
    });
  }

  // ==========================================
  // SLIDE 8: MODULE 3 - SMART WALLET ID CARDS
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Module 3: Instant Wallet ID Cards & QR Anti-Counterfeit', 'Smart Credentials');

    // Left Card: Physical Spec & Visuals
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: C_NAVY },
      line: { color: C_BLUE, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('OFFICIAL CR80 SPECIFICATION', {
      x: 1.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_BLUE,
      bold: true,
    });
    slide.addText('Print-Ready Dual-Sided ID Card', {
      x: 1.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Standard CR80 Dimensions:\n', options: { bold: true, color: C_WHITE } },
      { text: '  54mm x 85.6mm wallet format. Fits standard PVC card printers.\n\n', options: { color: C_MUTED } },
      { text: '• Front Side Elements:\n', options: { bold: true, color: C_WHITE } },
      { text: '  JB Infra Logo, Associate Photo, Full Name, Cadre Badge, Permanent JBIN ID, and Contact Mobile.\n\n', options: { color: C_MUTED } },
      { text: '• Back Side Elements:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Complete Address, Emergency Contacts, Authorized Signatory, and Anti-Counterfeit QR Code.\n\n', options: { color: C_MUTED } },
      { text: '• Vector PDF Generation:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Built with PDFKit at 300+ DPI sharpness. Never pixelated.\n', options: { color: C_MUTED } },
    ], {
      x: 1.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 14,
    });

    // Right Card: Dynamic Anti-Counterfeit
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: '1E293B' },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('REAL-TIME FRAUD PREVENTION', {
      x: 7.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_EMERALD,
      bold: true,
    });
    slide.addText('Dynamic QR Code Verification', {
      x: 7.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Instant Smartphone Scan:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Scanning the QR directs to jbinfragroup.com/verify/[JBIN_CODE].\n\n', options: { color: C_MUTED } },
      { text: '• Live Public Credential Check:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Displays verified badge, active employment status, official photo, and cadre tier.\n\n', options: { color: C_MUTED } },
      { text: '• Automatic Invalidation:\n', options: { bold: true, color: C_WHITE } },
      { text: '  If an associate leaves or is suspended, the QR verification immediately reflects "INACTIVE" to prevent misuse.\n\n', options: { color: C_MUTED } },
      { text: '• WhatsApp Automated Dispatch:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Dispatches high-res ID card PDF directly to associate WhatsApp number upon approval.\n', options: { color: C_MUTED } },
    ], {
      x: 7.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 14,
    });
  }

  // ==========================================
  // SLIDE 9: MODULE 4 - GOVERNANCE, RBAC & CED
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Module 4: Enterprise Governance, CED Security & Audit', 'Security Architecture');

    // 6 RBAC Roles Grid
    const roles = [
      { name: 'SUPER_ADMIN', desc: 'Complete access to configuration, database sequences, and user permissions.' },
      { name: 'RESTRICTED_ADMIN', desc: 'Exclusive access to confidential Chief Executive Director (CED) cadre records.' },
      { name: 'KYC_ADMIN', desc: 'Dedicated focus on split-screen verification, approvals, and correction requests.' },
      { name: 'CADRE_ADMIN', desc: 'Authority to process cadre promotions and reorganize team uplines.' },
      { name: 'ADMIN', desc: 'General administrative operations, universal search, and Excel exports.' },
      { name: 'EXECUTIVE', desc: 'Field self-service portal to submit applications and view digital ID card.' },
    ];

    roles.forEach((r, idx) => {
      const colIdx = idx % 3;
      const rowIdx = Math.floor(idx / 3);
      const xPos = 0.8 + colIdx * 4.0;
      const yPos = 1.6 + rowIdx * 1.7;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: yPos,
        w: 3.7,
        h: 1.5,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(r.name, {
        x: xPos + 0.2,
        y: yPos + 0.15,
        w: 3.3,
        h: 0.35,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: r.name === 'RESTRICTED_ADMIN' ? C_AMBER : C_BLUE,
        bold: true,
      });

      slide.addText(r.desc, {
        x: xPos + 0.2,
        y: yPos + 0.5,
        w: 3.3,
        h: 0.9,
        fontSize: 9.5,
        fontFace: FONT_BODY,
        color: C_MUTED,
        lineSpacing: 13,
      });
    });

    // Bottom Compliance & Audit Bar
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 5.3,
      w: 11.7,
      h: 1.4,
      fill: { color: '18181B' },
      line: { color: C_AMBER, width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('TAMPER-PROOF AUDIT TRAIL & PRIVACY GUARANTEE', {
      x: 1.1,
      y: 5.45,
      w: 11.0,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
    });
    slide.addText('Every user action (logins, card regenerations, KYC decisions, and cadre promotions) is written to an immutable AuditLog with IP address, user ID, timestamp, and metadata. Confidential CED records are blocked at the SQL/Prisma query level to prevent unauthorized internal snooping.', {
      x: 1.1,
      y: 5.75,
      w: 11.0,
      h: 0.8,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_LIGHT_GRAY,
      lineSpacing: 16,
    });
  }

  // ==========================================
  // SLIDE 10: MODULE 5 - SEARCH & EXCEL REPORTING
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Module 5: Multi-Filter Search & Excel Reporting', 'Business Intelligence');

    // Left Box: Universal Search
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: C_CARD },
      line: { color: C_BLUE, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('UNIVERSAL MULTI-FILTER SEARCH', {
      x: 1.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_BLUE,
      bold: true,
    });
    slide.addText('Instant Field Query Engine', {
      x: 1.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Multi-Dimensional Query Filters:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Search by Cadre, Team, Mandal, District, State, Application Date, or Active Status.\n\n', options: { color: C_MUTED } },
      { text: '• Full-Text Instant Matching:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Query across Permanent ID, Name, Mobile, Father Name, or Upline Leader in < 50ms.\n\n', options: { color: C_MUTED } },
      { text: '• Confidential Exclusion by Default:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Protects executive leadership records automatically from unprivileged staff queries.\n', options: { color: C_MUTED } },
    ], {
      x: 1.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 15,
    });

    // Right Box: Excel Export Engine
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.0,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.15,
    });
    slide.addText('EXCELJS AUTOMATED REPORTING', {
      x: 7.2,
      y: 1.9,
      w: 4.9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_EMERALD,
      bold: true,
    });
    slide.addText('One-Click Formatted Spreadsheets', {
      x: 7.2,
      y: 2.2,
      w: 4.9,
      h: 0.5,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
    });
    slide.addText([
      { text: '• Formatted Corporate Excel Workbooks:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Generates styled .xlsx files with company header banner, bold columns, and alternating row colors.\n\n', options: { color: C_MUTED } },
      { text: '• Dynamic Excel Formula Summaries:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Includes automated COUNTA, COUNTIF, and cadre distribution statistics for leadership meetings.\n\n', options: { color: C_MUTED } },
      { text: '• Streamlined Compliance Auditing:\n', options: { bold: true, color: C_WHITE } },
      { text: '  Instantly export all KYC approved or pending records for statutory inspection.\n', options: { color: C_MUTED } },
    ], {
      x: 7.2,
      y: 2.8,
      w: 4.9,
      h: 3.5,
      fontSize: 11,
      fontFace: FONT_BODY,
      lineSpacing: 15,
    });
  }

  // ==========================================
  // SLIDE 11: MODERN TECHNOLOGY STACK
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Modern, Enterprise-Grade Technology Stack', 'Architecture & Performance');

    const stack = [
      { layer: 'Frontend & UI', tech: 'Next.js 14 + React 18', desc: 'App Router, Server Components, sub-second page loads, and sleek Tailwind CSS dark/light theme.' },
      { layer: 'Backend & APIs', tech: 'Edge-Ready Route Handlers', desc: 'Type-safe endpoints with Zod schema validation and robust error handling.' },
      { layer: 'Database & ORM', tech: 'Prisma ORM + Relational DB', desc: 'Strict relational data model, indexed queries, and migration version control.' },
      { layer: 'Security & Auth', tech: 'BCrypt + JWT Tokens', desc: 'Military-grade salted password hashing, HTTP-only cookie tokens, and role-based middleware.' },
      { layer: 'Document Engine', tech: 'PDFKit + QRCode', desc: 'In-memory 300+ DPI vector ID card rendering with dynamic verification URLs.' },
      { layer: 'Spreadsheet Engine', tech: 'ExcelJS', desc: 'Server-side native spreadsheet compilation with styling, headers, and formula cells.' },
    ];

    stack.forEach((s, idx) => {
      const colIdx = idx % 3;
      const rowIdx = Math.floor(idx / 3);
      const xPos = 0.8 + colIdx * 4.0;
      const yPos = 1.6 + rowIdx * 2.5;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: yPos,
        w: 3.7,
        h: 2.2,
        fill: { color: C_NAVY },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.12,
      });

      slide.addText(s.layer.toUpperCase(), {
        x: xPos + 0.3,
        y: yPos + 0.2,
        w: 3.1,
        h: 0.3,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C_BLUE,
        bold: true,
      });

      slide.addText(s.tech, {
        x: xPos + 0.3,
        y: yPos + 0.5,
        w: 3.1,
        h: 0.5,
        fontSize: 14,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
      });

      slide.addText(s.desc, {
        x: xPos + 0.3,
        y: yPos + 1.05,
        w: 3.1,
        h: 1.0,
        fontSize: 10.5,
        fontFace: FONT_BODY,
        color: C_MUTED,
        lineSpacing: 14,
      });
    });
  }

  // ==========================================
  // SLIDE 12: QUANTIFIABLE BUSINESS ADVANTAGES (ROI)
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Quantifiable Business Advantages & ROI', 'Business Case');

    const metrics = [
      { stat: '90%', label: 'Turnaround Time Reduction', detail: 'From 3-5 days of physical courier & paperwork down to under 15 minutes of digital onboarding.' },
      { stat: '100%', label: 'Zero Duplicate Identities', detail: 'Guaranteed unique JBIN identity eliminates duplicate registrations and fractured downlines.' },
      { stat: '75%', label: 'Administrative Cost Savings', detail: 'Eliminates paper printing, physical photo processing, storage filing, and manual courier overhead.' },
      { stat: '0%', label: 'Counterfeiting Vulnerability', detail: 'Instant QR code scan allows clients & authorities to verify authentic credentials on the spot.' },
    ];

    metrics.forEach((m, idx) => {
      const xPos = 0.8 + idx * 3.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 1.6,
        w: 2.8,
        h: 4.9,
        fill: { color: C_CARD },
        line: { color: C_CARD_BORDER, width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(m.stat, {
        x: xPos + 0.2,
        y: 2.0,
        w: 2.4,
        h: 0.9,
        fontSize: 36,
        fontFace: FONT_TITLE,
        color: idx % 2 === 0 ? C_AMBER : C_BLUE,
        bold: true,
        align: 'center',
      });

      slide.addText(m.label, {
        x: xPos + 0.2,
        y: 3.0,
        w: 2.4,
        h: 0.7,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
        align: 'center',
      });

      slide.addText(m.detail, {
        x: xPos + 0.2,
        y: 3.8,
        w: 2.4,
        h: 2.3,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_MUTED,
        align: 'center',
        lineSpacing: 15,
      });
    });
  }

  // ==========================================
  // SLIDE 13: IMPLEMENTATION ROADMAP
  // ==========================================
  {
    const slide = pptx.addSlide();
    applyHeader(slide, 'Rapid 3-Week Phased Implementation Plan', 'Rollout Roadmap');

    const phases = [
      {
        phase: 'WEEK 01',
        title: 'Environment & Admin Onboarding',
        desc: '• Database deployment & seed execution.\n• Role creation (Super Admin, KYC Admin, CED).\n• ID Sequence initialization (JBIN series).\n• Administrative staff walkthrough.',
      },
      {
        phase: 'WEEK 02',
        title: 'Pilot Launch & Hierarchy Setup',
        desc: '• Pilot enrollment with select Hyderabad branches.\n• Upline hierarchy linking for EDs & GMs.\n• Split-screen KYC review workflow testing.\n• Smart ID card generation and QR scan drills.',
      },
      {
        phase: 'WEEK 03+',
        title: 'Full Rollout & Legacy Migration',
        desc: '• Organization-wide launch across all district teams.\n• Migration of active legacy associate data.\n• Automated WhatsApp ID card dispatch live.\n• Ongoing performance and audit monitoring.',
      },
    ];

    phases.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 1.6,
        w: 3.7,
        h: 4.9,
        fill: { color: C_NAVY },
        line: { color: C_BLUE, width: 1.5 },
        rectRadius: 0.15,
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos + 0.3,
        y: 1.9,
        w: 1.5,
        h: 0.4,
        fill: { color: '172554' },
        line: { color: C_BLUE, width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(p.phase, {
        x: xPos + 0.3,
        y: 1.9,
        w: 1.5,
        h: 0.4,
        fontSize: 10,
        fontFace: FONT_BODY,
        color: C_AMBER,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(p.title, {
        x: xPos + 0.3,
        y: 2.5,
        w: 3.1,
        h: 0.8,
        fontSize: 16,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
      });

      slide.addText(p.desc, {
        x: xPos + 0.3,
        y: 3.4,
        w: 3.1,
        h: 2.8,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_LIGHT_GRAY,
        lineSpacing: 18,
      });
    });
  }

  // ==========================================
  // SLIDE 14: CONCLUSION & CALL TO ACTION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_DARK };

    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 5.4,
        y: 0.9,
        w: 2.5,
        h: 1.2,
        sizing: { type: 'contain', w: 2.5, h: 1.2 },
      });
    }

    slide.addText('TRANSFORMING ASSOCIATE MANAGEMENT TODAY', {
      x: 1.0,
      y: 2.3,
      w: 11.33,
      h: 0.5,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: C_AMBER,
      bold: true,
      align: 'center',
      letterSpacing: 2,
    });

    slide.addText('Ready for Immediate Enterprise Adoption', {
      x: 1.0,
      y: 2.8,
      w: 11.33,
      h: 0.8,
      fontSize: 32,
      fontFace: FONT_TITLE,
      color: C_WHITE,
      bold: true,
      align: 'center',
    });

    slide.addText('The JB Infra Management System is not an idea or concept—it is a production-ready, fully engineered platform that solves core operational bottlenecks from Day 1.', {
      x: 2.0,
      y: 3.6,
      w: 9.33,
      h: 0.8,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: C_MUTED,
      align: 'center',
      lineSpacing: 18,
    });

    // 3 Big Takeaways
    const takeaways = [
      { title: 'Zero Identity Loss', desc: 'Permanent JBIN identity preserves associate careers for life.' },
      { title: 'Instant Verification', desc: 'Live split-screen KYC and smartphone QR authentication.' },
      { title: 'Enterprise Control', desc: 'Fine-grained RBAC, confidential CED, and full audit logs.' },
    ];
    takeaways.forEach((t, idx) => {
      const xPos = 1.2 + idx * 3.8;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos,
        y: 4.6,
        w: 3.4,
        h: 1.4,
        fill: { color: C_CARD },
        line: { color: C_BLUE, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(t.title, {
        x: xPos + 0.2,
        y: 4.8,
        w: 3.0,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_TITLE,
        color: C_WHITE,
        bold: true,
        align: 'center',
      });
      slide.addText(t.desc, {
        x: xPos + 0.2,
        y: 5.2,
        w: 3.0,
        h: 0.65,
        fontSize: 10.5,
        fontFace: FONT_BODY,
        color: C_MUTED,
        align: 'center',
      });
    });

    // Action CTA
    slide.addText('Action Requested: Approve System Deployment & Initiate Week 1 Implementation', {
      x: 1.0,
      y: 6.3,
      w: 11.33,
      h: 0.5,
      fontSize: 13,
      fontFace: FONT_BODY,
      color: C_EMERALD,
      bold: true,
      align: 'center',
    });
  }

  const outputPath = path.resolve(__dirname, '../JB_Infra_Management_System_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation successfully created at: ${outputPath}`);
}

createPresentation().catch(console.error);
