/**
 * studentDossierExporter.ts
 * ─────────────────────────
 * Companion utility for exporting student profiles and login credentials
 * with 100% parity with Android's StudentDossierExporter.
 * 
 * Supports:
 *  1. Print / PDF (Printable HTML document with page break styling)
 *  2. Clean Formatted Document (.txt) with ASCII dividers
 *  3. Spreadsheet (.csv) with full headers and Excel compatibility
 *  4. Clipboard text summary
 */

import { User, StudentTestResult } from '../types';

export interface StudentDossierRecord {
  index: number;
  indexFormatted: string;
  studentId: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  loginIdentifier: string;
  password: string;
  kcetTargetRank: string;
  targetStream: string;
  examYear: string | number;
  membershipType: 'PRO Premium' | 'Free Tier';
  accountStatus: 'Active' | 'Blocked' | 'Force Logged Out';
  blockReason: string;
  testsAttempted: number;
  latestScore: string;
  performanceAverage: string;
  registrationDate: string;
  lastUpdatedTime: string;
}

/**
 * Builds a standardized, enriched dossier record for a student
 */
export function buildStudentDossierRecord(
  student: User,
  index: number,
  allTestResults: StudentTestResult[]
): StudentDossierRecord {
  const studentUid = (student.uid || '').trim();
  const studentEmail = (student.email || '').trim().toLowerCase();
  const studentName = student.name || 'Student';
  const studentId = student.formattedStudentId || student.studentId || (studentUid ? `KCET-${studentUid.slice(-6).toUpperCase()}` : `KCET-${String(index + 1).padStart(6, '0')}`);
  const phone = student.phone || '+91 98450 12345';
  const password = student.password || student.displayPassword || 'kcet@user2026';
  const loginIdentifier = studentEmail || phone || studentId;

  // Filter test results for this student
  const studentResults = allTestResults.filter(r => {
    if (!r) return false;
    const rUid = (r.studentUid || r.userId || '').trim().toLowerCase();
    const rEmail = (r.studentEmail || r.userEmail || '').trim().toLowerCase();
    const rId = (r.studentId || '').trim().toLowerCase();
    const rName = (r.studentName || r.userName || '').trim().toLowerCase();

    const cleanUid = studentUid.toLowerCase();
    const cleanEmail = studentEmail;
    const cleanId = studentId.toLowerCase();
    const cleanName = studentName.toLowerCase();

    return (cleanUid && (rUid === cleanUid || rUid === cleanEmail || rUid === cleanId)) ||
           (cleanEmail && rEmail && rEmail === cleanEmail) ||
           (cleanId && rId && rId === cleanId) ||
           (cleanName && cleanName !== 'student' && rName === cleanName);
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const testsAttempted = studentResults.length;
  const latestResult = studentResults[0];
  const latestScore = latestResult 
    ? `${latestResult.score}/${latestResult.maxScore || latestResult.totalQuestions || 0} (${Number(latestResult.percentage || 0).toFixed(1)}%)`
    : 'No attempts';
  const performanceAverage = testsAttempted > 0
    ? (studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / testsAttempted).toFixed(1) + '%'
    : 'N/A';

  const regDate = student.registrationDate || student.createdAt || '2026-10-04';
  const lastUpdated = student.lastUpdatedMillis 
    ? new Date(student.lastUpdatedMillis).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recently';

  let accountStatus: 'Active' | 'Blocked' | 'Force Logged Out' = 'Active';
  if (student.isBlocked) accountStatus = 'Blocked';
  else if (student.isForceLoggedOut) accountStatus = 'Force Logged Out';

  return {
    index: index + 1,
    indexFormatted: `#${String(index + 1).padStart(2, '0')}`,
    studentId,
    uid: studentUid,
    name: studentName,
    email: studentEmail,
    phone,
    loginIdentifier,
    password,
    kcetTargetRank: student.kcetTargetRank || 'Under 500',
    targetStream: student.targetStream || 'Engineering (CS/IS)',
    examYear: student.examYear || '2026',
    membershipType: student.isPremium ? 'PRO Premium' : 'Free Tier',
    accountStatus,
    blockReason: student.blockReason || '',
    testsAttempted,
    latestScore,
    performanceAverage,
    registrationDate: regDate,
    lastUpdatedTime: lastUpdated,
  };
}

/**
 * Generates an ASCII / TXT formatted dossier document for download or copy
 */
export function generateDossierTxt(records: StudentDossierRecord[]): string {
  const line = '═'.repeat(82);
  const subLine = '─'.repeat(82);
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  let out = '';
  out += `${line}\n`;
  out += `          KCET GEN Z — OFFICIAL STUDENT DOSSIER & CREDENTIALS DIRECTORY\n`;
  out += `          Generated: ${now} | Total Students: ${records.length}\n`;
  out += `${line}\n\n`;

  records.forEach((r) => {
    out += `┌${subLine}┐\n`;
    out += `│ ${r.indexFormatted}  STUDENT: ${r.name.toUpperCase().padEnd(42)} [${r.membershipType.toUpperCase()}] │\n`;
    out += `├${subLine}┤\n`;
    out += `│ • Student ID   : ${r.studentId.padEnd(60)} │\n`;
    out += `│ • User UID     : ${r.uid.padEnd(60)} │\n`;
    out += `│ • Email        : ${r.email.padEnd(60)} │\n`;
    out += `│ • Phone Number : ${r.phone.padEnd(60)} │\n`;
    out += `├${subLine}┤\n`;
    out += `│ [LOGIN CREDENTIALS]\n`;
    out += `│ • Login ID     : ${r.loginIdentifier.padEnd(60)} │\n`;
    out += `│ • Password     : ${r.password.padEnd(60)} │\n`;
    out += `├${subLine}┤\n`;
    out += `│ [ACADEMICS & KCET TARGET]\n`;
    out += `│ • Target Rank  : ${r.kcetTargetRank.padEnd(60)} │\n`;
    out += `│ • Stream       : ${r.targetStream.padEnd(60)} │\n`;
    out += `│ • Exam Year    : ${String(r.examYear).padEnd(60)} │\n`;
    out += `├${subLine}┤\n`;
    out += `│ [MEMBERSHIP & CBT PERFORMANCE]\n`;
    out += `│ • Account Status: ${r.accountStatus.padEnd(20)} Block Reason: ${(r.blockReason || 'None').padEnd(25)} │\n`;
    out += `│ • CBT Attempts  : ${String(r.testsAttempted).padEnd(20)} Latest Score: ${r.latestScore.padEnd(25)} │\n`;
    out += `│ • Average Score : ${r.performanceAverage.padEnd(20)} Registered  : ${r.registrationDate.padEnd(25)} │\n`;
    out += `│ • Last Activity : ${r.lastUpdatedTime.padEnd(60)} │\n`;
    out += `└${subLine}┘\n\n`;
  });

  out += `${line}\n`;
  out += `End of Dossier Directory (${records.length} records). Confidential — KCET Gen Z Admin.\n`;
  out += `${line}\n`;
  return out;
}

/**
 * Generates an Excel-ready CSV spreadsheet string
 */
export function generateDossierCsv(records: StudentDossierRecord[]): string {
  const headers = [
    'Index',
    'Student ID',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Login Identifier',
    'Password',
    'Membership Type',
    'Account Status',
    'Block Reason',
    'Target KCET Rank',
    'Target Stream',
    'Exam Year',
    'CBT Tests Attempted',
    'Latest Test Score',
    'Performance Average',
    'Registration Date',
    'Last Activity',
    'Firebase UID'
  ];

  const escapeCsv = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    r.indexFormatted,
    r.studentId,
    r.name,
    r.email,
    r.phone,
    r.loginIdentifier,
    r.password,
    r.membershipType,
    r.accountStatus,
    r.blockReason,
    r.kcetTargetRank,
    r.targetStream,
    r.examYear,
    r.testsAttempted,
    r.latestScore,
    r.performanceAverage,
    r.registrationDate,
    r.lastUpdatedTime,
    r.uid
  ].map(escapeCsv).join(','));

  return [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser file download
 */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print window with an HTML layout formatted for printing & saving to PDF
 */
export function printStudentDossier(records: StudentDossierRecord[]) {
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Please allow popups to print the Student Dossier PDF.');
    return;
  }

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>KCET Gen Z - Student Dossier & Credentials Directory</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
    }
    .header-banner {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #1e1b4b;
      margin: 0 0 4px 0;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .header-badge {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #3730a3;
      text-align: right;
    }
    .student-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .student-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .student-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .student-index {
      font-family: monospace;
      font-weight: 900;
      color: #4f46e5;
      background: #eef2ff;
      padding: 2px 8px;
      border-radius: 6px;
      margin-right: 8px;
    }
    .badge-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 9999px;
      display: inline-block;
    }
    .badge-premium { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
    .badge-free { background: #f1f5f9; color: #475569; }
    .badge-active { background: #dcfce7; color: #166534; }
    .badge-blocked { background: #fee2e2; color: #991b1b; }
    .badge-logout { background: #fef3c7; color: #92400e; }
    
    .grid-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      margin-bottom: 10px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 12.5px;
      font-weight: 600;
      color: #1e293b;
      word-break: break-all;
    }
    .credentials-box {
      background: #f8fafc;
      border: 1px dashed #6366f1;
      border-radius: 8px;
      padding: 8px 12px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .credentials-label {
      font-size: 11px;
      font-weight: 800;
      color: #4338ca;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .credentials-value {
      font-family: "Courier New", Courier, monospace;
      font-weight: 800;
      color: #0f172a;
      background: #ffffff;
      padding: 3px 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
    }
    .stats-bar {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .student-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#eef2ff; padding:12px; margin-bottom:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
    <span style="font-weight:700; color:#3730a3;">🖨️ Ready to Print / Save as PDF (${records.length} Students)</span>
    <button onclick="window.print()" style="background:#4f46e5; color:white; font-weight:800; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header-banner">
    <div>
      <h1 class="brand-title">KCET Gen Z — Student Credentials Directory</h1>
      <div class="brand-subtitle">Complete personal information, access IDs, authentication passwords, and academic status</div>
    </div>
    <div class="header-badge">
      <div>Directory Dossier</div>
      <div>${now}</div>
      <div>Total: ${records.length} Students</div>
    </div>
  </div>

  ${records.map(r => `
    <div class="student-card">
      <div class="student-card-header">
        <div style="display:flex; align-items:center;">
          <span class="student-index">${r.indexFormatted}</span>
          <span class="student-name">${r.name}</span>
        </div>
        <div>
          <span class="badge-pill ${r.membershipType === 'PRO Premium' ? 'badge-premium' : 'badge-free'}">${r.membershipType}</span>
          <span class="badge-pill ${r.accountStatus === 'Active' ? 'badge-active' : r.accountStatus === 'Blocked' ? 'badge-blocked' : 'badge-logout'}">${r.accountStatus}</span>
        </div>
      </div>

      <div class="grid-section">
        <div class="info-item">
          <span class="info-label">Official Student ID</span>
          <span class="info-value" style="font-family:monospace; font-weight:700; color:#4f46e5;">${r.studentId}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email Address</span>
          <span class="info-value">${r.email || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Contact Phone</span>
          <span class="info-value">${r.phone}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Target Stream</span>
          <span class="info-value">${r.targetStream}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Target KCET Rank</span>
          <span class="info-value" style="font-weight:700; color:#2563eb;">${r.kcetTargetRank}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Exam Year & Reg Date</span>
          <span class="info-value">KCET ${r.examYear} • Registered: ${r.registrationDate}</span>
        </div>
      </div>

      <div class="credentials-box">
        <div class="credentials-label">
          <span>🔐 Login Identifier:</span>
          <span class="credentials-value">${r.loginIdentifier}</span>
        </div>
        <div class="credentials-label">
          <span>🔑 Password:</span>
          <span class="credentials-value" style="color:#b91c1c;">${r.password}</span>
        </div>
      </div>

      <div class="stats-bar">
        <span>📊 CBT Tests Attempted: <strong>${r.testsAttempted}</strong></span>
        <span>🎯 Latest Score: <strong>${r.latestScore}</strong></span>
        <span>📈 Average Performance: <strong>${r.performanceAverage}</strong></span>
        <span>🕒 Last Sync: <strong>${r.lastUpdatedTime}</strong></span>
      </div>
    </div>
  `).join('')}

  <div class="footer">
    KCET Gen Z Admin Console • Official Student Records & Authentication Dossier • Confidential
  </div>

  <script>
    // Auto-trigger print dialog after layout renders
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
