/**
 * Saarthi AI API client.
 * For now, all endpoints are mocked locally so the full UX flow works
 * without a backend. Swap fetch/axios calls in here when ready.
 */
import { UserProfile } from "@/context/AuthContext";

export interface DetectedField {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "checkbox" | "radio";
  required: boolean;
  matchedFromProfile: boolean;
  value?: string;
}

export interface AnalysisResult {
  formType: string;
  pageCount: number;
  fields: DetectedField[];
  coverage: number; // 0-100
}

export interface AutofillResult {
  values: Record<string, string>;
  filled: number;
  manual: number;
}

export interface ValidationIssue {
  fieldId: string;
  fieldLabel: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface ValidationResult {
  score: number; // 0-100
  risk: "low" | "medium" | "high";
  errors: ValidationIssue[];
  suggestions: string[];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SAMPLE_FIELDS: DetectedField[] = [
  { id: "fullName", label: "Full Name", type: "text", required: true, matchedFromProfile: true },
  { id: "dob", label: "Date of Birth", type: "date", required: true, matchedFromProfile: true },
  { id: "age", label: "Age", type: "number", required: false, matchedFromProfile: true },
  { id: "gender", label: "Gender", type: "radio", required: true, matchedFromProfile: true },
  { id: "fatherName", label: "Father's Name", type: "text", required: true, matchedFromProfile: false },
  { id: "address", label: "Permanent Address", type: "text", required: true, matchedFromProfile: true },
  { id: "phone", label: "Mobile Number", type: "text", required: true, matchedFromProfile: true },
  { id: "email", label: "Email Address", type: "text", required: false, matchedFromProfile: true },
  { id: "aadhaar", label: "Aadhaar Number", type: "number", required: true, matchedFromProfile: false },
  { id: "bloodGroup", label: "Blood Group", type: "text", required: false, matchedFromProfile: false },
  { id: "vehicleClass", label: "Vehicle Class", type: "checkbox", required: true, matchedFromProfile: false },
  { id: "declaration", label: "Declaration Accepted", type: "checkbox", required: true, matchedFromProfile: false },
];

export const api = {
  async upload(file: File): Promise<{ fileId: string; pageCount: number; sizeKB: number }> {
    await wait(900);
    return {
      fileId: "f_" + Date.now(),
      pageCount: Math.max(1, Math.round(file.size / (180 * 1024))),
      sizeKB: Math.round(file.size / 1024),
    };
  },

  async analyze(_fileId: string): Promise<AnalysisResult> {
    await wait(1200);
    const fields = SAMPLE_FIELDS;
    const matched = fields.filter((f) => f.matchedFromProfile).length;
    return {
      formType: "Driving License Application",
      pageCount: 4,
      fields,
      coverage: Math.round((matched / fields.length) * 100),
    };
  },

  async autofill(fields: DetectedField[], user: UserProfile | null): Promise<AutofillResult> {
    await wait(1000);
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      if (!f.matchedFromProfile || !user) return;
      switch (f.id) {
        case "fullName": values[f.id] = user.name; break;
        case "dob": values[f.id] = user.dob ?? ""; break;
        case "age": values[f.id] = String(user.age ?? ""); break;
        case "gender": values[f.id] = user.gender ?? ""; break;
        case "address": values[f.id] = user.address ?? ""; break;
        case "phone": values[f.id] = user.phone ?? ""; break;
        case "email": values[f.id] = user.email; break;
        default: break;
      }
    });
    const filled = Object.values(values).filter(Boolean).length;
    return { values, filled, manual: fields.length - filled };
  },

  async validate(fields: DetectedField[], values: Record<string, string>): Promise<ValidationResult> {
    await wait(700);
    const errors: ValidationIssue[] = [];
    fields.forEach((f) => {
      if (f.required && !values[f.id]) {
        errors.push({
          fieldId: f.id, fieldLabel: f.label,
          severity: f.matchedFromProfile ? "medium" : "high",
          message: `Required field “${f.label}” is empty.`,
        });
      }
    });
    const total = fields.filter((f) => f.required).length;
    const filledRequired = fields.filter((f) => f.required && values[f.id]).length;
    const score = Math.round((filledRequired / Math.max(total, 1)) * 100);
    const risk: ValidationResult["risk"] = score >= 85 ? "low" : score >= 60 ? "medium" : "high";
    const suggestions = errors.slice(0, 3).map((e) => `Manually verify “${e.fieldLabel}”.`);
    return { score, risk, errors, suggestions };
  },
};
