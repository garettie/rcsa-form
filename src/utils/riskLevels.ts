export const RISK_TEXT: Record<string, string> = {
  Minor: "#10b981",
  Moderate: "#f59e0b",
  Major: "#f97316",
  Critical: "#f43f5e",
};

export const RISK_LEVELS = ["Minor", "Moderate", "Major", "Critical"];

export const CONTROLS_LABEL_COLORS: Record<string, string> = {
  Strong: "#22c55e",
  Satisfactory: "#f59e0b",
  "Needs Improvement": "#f97316",
  Unsatisfactory: "#ef4444",
};

export const IMPLEMENTATION_COLORS: Record<string, string> = {
  "Fully Implemented": "#22c55e",
  "Mostly Implemented": "#f59e0b",
  "Partially Implemented": "#f97316",
  "Not Implemented": "#ef4444",
};

export const CONTROL_BG: Record<string, string> = {
  Strong: "#dcfce7",
  Satisfactory: "#fef3c7",
  "Needs Improvement": "#ffedd5",
  Unsatisfactory: "#fee2e2",
};

export function getRiskLevel(score: number): string {
  if (score === undefined || score === null || isNaN(score)) return "Minor";
  if (score <= 3) return "Minor";
  if (score <= 6) return "Moderate";
  if (score <= 9) return "Major";
  return "Critical";
}

export function getRiskLevelSmall(score: number): string {
  if (score === undefined || score === null || isNaN(score)) return "Minor";
  if (score === 1) return "Minor";
  if (score === 2) return "Moderate";
  if (score === 3) return "Major";
  return "Critical";
}

export function getControlsLabel(score: number): string {
  if (score === undefined || score === null || isNaN(score)) return "Strong";
  if (score <= 3) return "Strong";
  if (score <= 6) return "Satisfactory";
  if (score <= 9) return "Needs Improvement";
  return "Unsatisfactory";
}

export function getControlsLabelSmall(score: number): string {
  if (score === undefined || score === null || isNaN(score)) return "Strong";
  if (score === 1) return "Strong";
  if (score === 2) return "Satisfactory";
  if (score === 3) return "Needs Improvement";
  return "Unsatisfactory";
}

export function getImplementationLabel(score: number): string {
  if (score === undefined || score === null || isNaN(score)) return "Fully Implemented";
  if (score <= 1) return "Fully Implemented";
  if (score <= 2) return "Mostly Implemented";
  if (score <= 3) return "Partially Implemented";
  return "Not Implemented";
}
