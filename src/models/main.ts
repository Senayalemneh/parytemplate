export interface Option {
  value: any;
  label: string;
}

export interface Locale {
  en: string;
  am: string;
}
export interface Field {
  label: string;
  key: string;
  type:
    | "text"
    | "secure_text"
    | "select"
    | "multi-select"
    | "checkbox"
    | "number"
    | "date"
    | "textarea";
  should_take_full_width?: boolean;
  options?: Option[];
  disabled?: boolean;
}

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  hire_date: string;
  pool_id: number;
  barcode_hash: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}
