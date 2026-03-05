// src/services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StudentReportCard } from '@/types/grade';
import type { Student } from '@/types/student';
import type { FeePaymentDetail } from '@/types/fee';

export const generateReportCardPDF = (report: StudentReportCard, student: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- 1. Header ---
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('ELIMU MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('Official Student Academic Report Card', pageWidth / 2, 27, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 33, pageWidth - 15, 33);

  // --- 2. Student details ---
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const leftX = 15;
  const leftValX = 52;
  const rightX = 115;
  const rightValX = 155;

  const field = (label: string, value: string, x: number, valX: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, valX, y);
  };

  field('STUDENT NAME:', report.student_name, leftX, leftValX, 43);
  field('CLASS:', report.class_name, leftX, leftValX, 50);
  field('ADMISSION NO:', student?.admission_number || 'N/A', rightX, rightValX, 43);
  field('TERM / YEAR:', `Term ${report.term}, ${report.year}`, rightX, rightValX, 50);

  let cursorY = 60;

  // --- 3. One table per exam session ---
  for (const session of report.sessions) {
    // Section heading
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // primary-600
    doc.text(session.session_name.toUpperCase(), leftX, cursorY);
    doc.setTextColor(0, 0, 0);
    cursorY += 3;

    const rows = session.results.map((res) => [
      res.subject_name,
      res.subject_code,
      `${res.score}%`,
      res.grade,
      res.label,
      res.points.toString(),
      res.comment || '—',
    ]);

    // Subtotal row
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
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], halign: 'center', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'center' },
      },
      // Style the subtotal row differently
      didParseCell(data) {
        const isSubtotal = data.row.index === rows.length - 1 && data.section === 'body';
        if (isSubtotal) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 238, 255]; // very light purple
        }
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 10;

    // Page break guard
    if (cursorY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      cursorY = 20;
    }
  }

  // --- 4. Overall summary box ---
  doc.setFillColor(245, 245, 250);
  doc.rect(leftX, cursorY, pageWidth - 30, 22, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`OVERALL AVERAGE: ${report.overall_average}%`, leftX + 8, cursorY + 9);
  doc.text(`OVERALL TOTAL POINTS: ${report.overall_total_points}`, leftX + 8, cursorY + 17);

  // --- 5. Signatures ---
  const signY = cursorY + 45;
  if (signY < doc.internal.pageSize.height - 20) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.line(leftX, signY, leftX + 55, signY);
    doc.text("Class Teacher's Signature", leftX, signY + 5);

    doc.line(pageWidth - 70, signY, pageWidth - 15, signY);
    doc.text("Headteacher's Signature", pageWidth - 70, signY + 5);
  }

  doc.save(`${report.student_name}_Report_Card_Term${report.term}_${report.year}.pdf`);
};


export const generatePaymentReceiptPDF = (payment: FeePaymentDetail, student: Student) => {
  const doc = new jsPDF({
    format: [148, 210],
    orientation: 'landscape',
  });

  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('ELIMU MANAGEMENT SYSTEM', 15, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Official Payment Receipt', 15, 26);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`RECEIPT NO: ${payment.reference_number}`, pageWidth - 15, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(payment.payment_date).toLocaleDateString()}`, pageWidth - 15, 26, { align: 'right' });

  doc.setDrawColor(230, 230, 230);
  doc.line(15, 32, pageWidth - 15, 32);

  doc.setFontSize(11);
  doc.text('RECEIVED FROM:', 15, 45);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.first_name} ${student.last_name}`.toUpperCase(), 55, 45);

  doc.setFont('helvetica', 'normal');
  doc.text('ADMISSION NO:', 15, 52);
  doc.text(`${student.admission_number}`, 55, 52);

  doc.text('CLASS / STREAM:', 15, 59);
  doc.text(`${student.class_name}`, 55, 59);

  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Payment Method', 'Amount (UGX)']],
    body: [[
      payment.fee_structure_name,
      payment.payment_method.replace('_', ' '),
      `UGX ${payment.amount_paid.toLocaleString()}`,
    ]],
    theme: 'plain',
    headStyles: { fillColor: [245, 245, 250], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(
    'Thank you for your payment. Education is the key to the future.',
    pageWidth / 2,
    finalY,
    { align: 'center' },
  );

  doc.line(pageWidth - 70, finalY + 20, pageWidth - 15, finalY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text('Bursar / Authorized Signatory', pageWidth - 15, finalY + 25, { align: 'right' });

  doc.save(`Receipt_${payment.reference_number}.pdf`);
};