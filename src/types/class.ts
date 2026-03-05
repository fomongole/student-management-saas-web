// src/types/class.ts
export type AcademicLevel = 'NURSERY' | 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL';

/**
 * Only applicable to A_LEVEL classes.
 * S5/S6 each split into Sciences or Arts.
 */
export type ALevelCategory = 'SCIENCES' | 'ARTS';

export interface Class {
  id: string;
  name: string;
  stream: string | null;
  level: AcademicLevel;
  /**
   * Present only when level === 'A_LEVEL'.
   * null for all other levels.
   */
  category: ALevelCategory | null;
  capacity: number | null;
  school_id: string;
  form_teacher_id: string | null;
  form_teacher?: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  } | null;
}