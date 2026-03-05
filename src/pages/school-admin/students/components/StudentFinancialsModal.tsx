// src/pages/school-admin/students/components/StudentFinancialsModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Banknote, History, Receipt, AlertCircle, Printer, TrendingUp } from 'lucide-react';

import { 
  recordPaymentSchema, 
  type RecordPaymentFormValues,
  type RecordPaymentFormInput
} from '@/schemas/fee.schema';
import {
  useStudentBalance,
  useStudentPaymentHistory,
  useFeeStructures,
  useRecordPayment,
} from '@/hooks/useFees';
import { useSchoolConfig } from '@/hooks/useSettings';
import type { FeeStructure } from '@/types/fee';
import type { Student } from '@/types/student';
import { Skeleton } from '@/components/ui/Skeleton';
import { generatePaymentReceiptPDF } from '@/services/pdfService';

interface StudentFinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentFinancialsModal({ isOpen, onClose, student }: StudentFinancialsModalProps) {
  /*
   * YEAR / TERM — seeded from the school's active configuration.
   * ─────────────────────────────────────────────────────────────────────────────
   * Why: The school admin already sets the active academic period in Settings.
   * Forcing them to re-select it on every financial ledger view is redundant and
   * error-prone (they could accidentally view the wrong term's data).
   *
   * The selectors are kept visible for intentional historical lookups
   * (e.g. "what did this student owe last term?") — they just default to the
   * configured values instead of hardcoded constants.
   * ─────────────────────────────────────────────────────────────────────────────
   */
  const { data: schoolConfig } = useSchoolConfig();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState<number>(1);

  // Sync selectors to school config the moment it loads (one-time initialisation).
  // We only apply this once — afterwards the admin can freely override for history lookups.
  const [configApplied, setConfigApplied] = useState(false);
  useEffect(() => {
    if (schoolConfig && !configApplied) {
      setSelectedYear(schoolConfig.current_academic_year);
      setSelectedTerm(schoolConfig.current_term);
      setConfigApplied(true);
    }
  }, [schoolConfig, configApplied]);

  const { data: balance, isLoading: loadingBalance } = useStudentBalance(
    student?.id || '',
    selectedYear,
    selectedTerm,
  );
  const { data: history, isLoading: loadingHistory } = useStudentPaymentHistory(student?.id || '');

  // Fee structures already filtered to the selected year+term by the hook
  const { data: feeStructures, isLoading: loadingFees } = useFeeStructures(selectedYear, selectedTerm);

  const { mutate: recordPayment, isPending } = useRecordPayment(student?.id || '');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<
    RecordPaymentFormInput, 
    any, 
    RecordPaymentFormValues
  >({
    resolver: zodResolver(recordPaymentSchema),
  });

  if (!isOpen || !student) return null;

  const onSubmit = (data: RecordPaymentFormValues) => {
    recordPayment(data, { onSuccess: () => reset() });
  };

  /*
   * CLEARED FEE DETECTION
   * ─────────────────────────────────────────────────────────────────────────────
   * Problem: a fee that has already been fully paid should NOT be selectable again.
   * Re-selecting it would create a duplicate payment and inflate the student's
   * "total paid" beyond what they owe, sending the balance negative.
   *
   * Approach (no backend change required):
   *   - `feeStructures` is already scoped to `selectedYear` + `selectedTerm`.
   *   - `history` contains all payments ever made by this student.
   *   - Any payment whose `fee_structure_id` matches a structure in the current
   *     filtered list means that fee was addressed this term.
   *   - We sum payments per fee_structure_id and compare against the fee's
   *     full amount to determine if it is FULLY cleared (not just partially paid).
   * ─────────────────────────────────────────────────────────────────────────────
   */
  const paidAmountByFeeId = (history ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.fee_structure_id] = (acc[p.fee_structure_id] || 0) + p.amount_paid;
    return acc;
  }, {});

  const isFeeCleared = (fee: FeeStructure): boolean =>
    (paidAmountByFeeId[fee.id] || 0) >= fee.amount;

  /*
   * BALANCE DISPLAY STATES
   * ─────────────────────────────────────────────────────────────────────────────
   * Three possible states:
   *   outstanding  — student still owes money  (red)
   *   clear        — student has paid in full   (green, outstanding = 0)
   *   overpaid     — student paid more than billed (teal, outstanding < 0)
   *
   * Overpayments are a data-integrity signal, not a normal state. Surfacing
   * them explicitly lets the admin investigate instead of silently hiding
   * the issue behind "Fully Paid."
   * ─────────────────────────────────────────────────────────────────────────────
   */
  const outstanding = balance?.outstanding_balance ?? 0;
  const isClear    = outstanding === 0;
  const isOverpaid = outstanding < 0;

  // Build year options: 3 years back and 2 years forward from current
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-gray-50 shadow-2xl my-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b bg-white p-5 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Banknote className="mr-2 h-6 w-6 text-green-600" />
              Financial Ledger
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {student.first_name} {student.last_name} • {student.admission_number} • {student.class_name}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN: Stats & Payment Form ─────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Year / Term selectors — defaulted from school settings */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Viewing Period
                {schoolConfig && (
                  <span className="ml-1 normal-case font-normal text-primary-500">
                    (Active: {schoolConfig.current_academic_year} · Term {schoolConfig.current_term})
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="w-1/2 text-sm border-gray-300 rounded-md py-1.5 border px-2"
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={selectedTerm}
                  onChange={e => setSelectedTerm(Number(e.target.value))}
                  className="w-1/2 text-sm border-gray-300 rounded-md py-1.5 border px-2"
                >
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Balance</h4>
              {loadingBalance ? (
                <div className="space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed">
                    <span className="text-sm text-gray-600">Total Billed:</span>
                    <span className="font-semibold text-gray-900">UGX {balance?.total_billed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dashed">
                    <span className="text-sm text-gray-600">Total Paid:</span>
                    <span className="font-semibold text-green-600">UGX {balance?.total_paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-gray-900">Outstanding:</span>
                    <span className={`text-lg font-black ${
                      isOverpaid ? 'text-teal-500' : isClear ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {/*
                        Show absolute value when overpaid — a negative outstanding
                        balance displayed as "UGX -50,000" is confusing to staff.
                        The badge below communicates the overpayment context clearly.
                      */}
                      UGX {Math.abs(outstanding).toLocaleString()}
                    </span>
                  </div>

                  {/* Status badges */}
                  {isClear && !isOverpaid && (
                    <div className="mt-2 flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-md font-medium">
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      Fully paid for this term.
                    </div>
                  )}
                  {isOverpaid && (
                    // Overpayment is a data-integrity flag — surface it explicitly
                    // so the admin can investigate rather than silently treating
                    // a negative balance as "fully paid."
                    <div className="mt-2 flex items-center text-xs text-teal-700 bg-teal-50 p-2 rounded-md font-medium">
                      <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
                      Overpaid by UGX {Math.abs(outstanding).toLocaleString()} — please review payments.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Record Payment Form */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                <Receipt className="w-4 h-4 mr-2" /> Record Payment
              </h4>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Fee item selector — cleared fees are visually marked and disabled */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment For</label>
                  <select
                    {...register('fee_structure_id')}
                    disabled={loadingFees}
                    className="w-full text-sm rounded-md border-gray-300 py-2 border px-2 disabled:opacity-60"
                  >
                    <option value="">-- Select Fee Item --</option>
                    {/*
                      CLEARED FEE GUARD
                      ─────────────────────────────────────────────────────────
                      Fee items that the student has already fully paid for this
                      term are labelled "✓ Cleared" and disabled in the dropdown.

                      This prevents:
                        (a) Accidental double-payment against the same fee.
                        (b) The outstanding balance going negative.

                      Partial payments are allowed: if a student has paid
                      UGX 100,000 against a UGX 200,000 tuition fee, the item
                      remains enabled so the remainder can be recorded.

                      Note: the backend's duplicate `reference_number` check is
                      the hard data-integrity guard. This is a UX convenience
                      layer on top of it.
                      ─────────────────────────────────────────────────────────
                    */}
                    {(feeStructures ?? []).map(fee => {
                      const cleared = isFeeCleared(fee);
                      const paidSoFar = paidAmountByFeeId[fee.id] || 0;
                      const remaining = fee.amount - paidSoFar;
                      return (
                        <option key={fee.id} value={fee.id} disabled={cleared}>
                          {cleared
                            ? `✓ ${fee.name} — Cleared`
                            : paidSoFar > 0
                              ? `${fee.name} — UGX ${remaining.toLocaleString()} remaining`
                              : `${fee.name} — UGX ${fee.amount.toLocaleString()}`
                          }
                        </option>
                      );
                    })}
                  </select>
                  {errors.fee_structure_id && (
                    <p className="mt-1 text-[10px] text-red-500">{errors.fee_structure_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (UGX)</label>
                  <input
                    type="number"
                    {...register('amount_paid')}
                    className="w-full text-sm rounded-md border-gray-300 py-2 border px-2"
                  />
                  {errors.amount_paid && (
                    <p className="mt-1 text-[10px] text-red-500">{errors.amount_paid.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                    <select {...register('payment_method')} className="w-full text-sm rounded-md border-gray-300 py-2 border px-2">
                      <option value="BANK_DEPOSIT">Bank Deposit</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Receipt No.</label>
                    {/*
                      The backend enforces uniqueness of reference_number per school
                      (ConflictException → DUPLICATE_PAYMENT_REFERENCE).
                      useFees.ts now correctly surfaces that error message via
                      error.response?.data?.error?.message instead of the
                      generic "An unexpected error occurred" fallback.
                    */}
                    <input
                      {...register('reference_number')}
                      placeholder="e.g. TRX-123"
                      className="w-full text-sm rounded-md border-gray-300 py-2 uppercase border px-2"
                    />
                    {errors.reference_number && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.reference_number.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-2.5 bg-primary-600 text-white rounded-md text-sm font-bold hover:bg-primary-700 disabled:opacity-50 mt-2 transition-colors"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Payment History Ledger ──────────────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                <History className="w-4 h-4 mr-2" /> Payment History
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fee Item</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                      </td>
                    </tr>
                  ) : history?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500 italic text-sm">
                        No transaction records found.
                      </td>
                    </tr>
                  ) : (
                    history?.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {payment.fee_structure_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <span className="block font-mono text-[10px] text-gray-400">{payment.payment_method}</span>
                          <span className="font-bold text-gray-700">{payment.reference_number}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                          UGX {payment.amount_paid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => generatePaymentReceiptPDF(payment, student)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
                            title="Download Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}