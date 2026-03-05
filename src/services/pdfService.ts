import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StudentReportCard } from '@/types/grade';
import type { Student } from '@/types/student';
import type { FeePaymentDetail } from '@/types/fee';

export const generateReportCardPDF = (report: StudentReportCard, student: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- 1. Header ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('ELIMU MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Official Student Academic Report Card', pageWidth / 2, 27, { align: 'center' });

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(15, 34, pageWidth - 15, 34);

  // --- 2. Student details ---
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900

  const leftX = 15;
  const leftValX = 52;
  const rightX = 115;
  const rightValX = 155;

  const field = (label: string, value: string, x: number, valX: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // subtle label
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // bold value
    doc.text(value, valX, y);
  };

  field('STUDENT NAME:', report.student_name.toUpperCase(), leftX, leftValX, 45);
  field('CLASS:', report.class_name.toUpperCase(), leftX, leftValX, 52);
  field('ADMISSION NO:', student?.admission_number || 'N/A', rightX, rightValX, 45);
  field('TERM / YEAR:', `TERM ${report.term}, ${report.year}`, rightX, rightValX, 52);

  let cursorY = 65;

  // --- 3. One table per exam session ---
  for (const session of report.sessions) {
    // Section heading
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // primary-600
    doc.text(session.session_name.toUpperCase(), leftX, cursorY);
    doc.setTextColor(15, 23, 42);
    cursorY += 4;

    const rows = session.results.map((res) => [
      res.subject_name,
      res.subject_code,
      `${res.score}%`,
      res.grade,
      res.label,
      res.points.toString(),
      res.comment || '—',
    ]);

    // Subtotal row appended to data
    rows.push([
      'SESSION TOTAL',
      '',
      `${session.session_average}%`,
      '',
      '',
      `${session.session_total_points} pts`,
      '',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Subject', 'Code', 'Score', 'Grade', 'Remarks', 'Pts', 'Teacher Comment']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], halign: 'center', fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'center', fontStyle: 'bold' },
      },
      // Safely style the subtotal row
      didParseCell: function(data) {
        if (data.section === 'body' && data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [238, 242, 255]; // indigo-50
          data.cell.styles.textColor = [67, 56, 202]; // indigo-700
        }
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;

    // Page break guard
    if (cursorY > doc.internal.pageSize.height - 50) {
      doc.addPage();
      cursorY = 20;
    }
  }

  // --- 4. Overall summary box ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(leftX, cursorY, pageWidth - 30, 24, 'FD'); // Fill and Draw border

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`OVERALL AVERAGE: ${report.overall_average}%`, leftX + 10, cursorY + 10);
  doc.text(`OVERALL TOTAL POINTS: ${report.overall_total_points}`, leftX + 10, cursorY + 18);

  // --- 5. Signatures ---
  const signY = cursorY + 45;
  if (signY < doc.internal.pageSize.height - 20) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.line(leftX, signY, leftX + 60, signY);
    doc.text("CLASS TEACHER'S SIGNATURE", leftX, signY + 6);

    doc.line(pageWidth - 75, signY, pageWidth - 15, signY);
    doc.text("HEADTEACHER'S SIGNATURE", pageWidth - 75, signY + 6);
  }

  doc.save(`${report.student_name.replace(/\s+/g, '_')}_Report_Card_Term${report.term}_${report.year}.pdf`);
};

export const generatePaymentReceiptPDF = (payment: FeePaymentDetail, student: Student) => {
  const doc = new jsPDF({
    format: [148, 210], // A5 landscape
    orientation: 'landscape',
  });

  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('ELIMU MANAGEMENT SYSTEM', 15, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Official Payment Receipt', 15, 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`RECEIPT NO: ${payment.reference_number}`, pageWidth - 15, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(payment.payment_date).toLocaleDateString()}`, pageWidth - 15, 29, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 36, pageWidth - 15, 36);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIVED FROM:', 15, 48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.first_name} ${student.last_name}`.toUpperCase(), 55, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ADMISSION NO:', 15, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.admission_number}`, 55, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('CLASS / STREAM:', 15, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.class_name}`.toUpperCase(), 55, 64);

  autoTable(doc, {
    startY: 75,
    head: [['Description', 'Payment Method', 'Amount (UGX)']],
    body: [[
      payment.fee_structure_name,
      payment.payment_method.replace('_', ' ').toUpperCase(),
      `UGX ${payment.amount_paid.toLocaleString()}`,
    ]],
    theme: 'grid',
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 10, textColor: [15, 23, 42] },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 25;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Thank you for your payment. Education is the key to the future.',
    pageWidth / 2,
    finalY,
    { align: 'center' },
  );

  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 70, finalY + 15, pageWidth - 15, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory', pageWidth - 15, finalY + 21, { align: 'right' });

  doc.save(`Receipt_${payment.reference_number}.pdf`);
};