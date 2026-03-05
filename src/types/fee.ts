// src/types/fee.ts
export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  year: number;
  term: number;
  class_id: string | null;
  school_id: string;
}

export interface StudentBalance {
  student_id: string;
  total_billed: number;
  total_paid: number;
  outstanding_balance: number;
}

export interface FeePaymentDetail {
  id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  fee_structure_name: string;
}