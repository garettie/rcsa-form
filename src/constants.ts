import { Search, Edit2, Trash2, Save, X, Plus, ChevronDown, Book, Check, LogOut, Eye } from 'lucide-react';

export const DEPARTMENTS = [
        "Accounting Department",
        "Branch Banking Group",
        "Compliance Monitoring Office",
        "Credit Department",
        "Digital Banking Department",
        "Human Resource Department",
        "Information Technology Department",
        "Internal Audit Department",
        "Legal Department",
        "Loans and Assets Management Department",
        "Marketing Department",
        "Risk Management Office",
        "Security and Safety Department",
        "Treasury Department",
      ];
export const ROOT_CAUSES = ["People", "Process", "Systems", "External Events"];
export const EVENT_TYPES = [
        "Execution delivery and process management",
        "Business disruption and system failures",
        "External fraud",
        "Employment practices and workplace safety",
        "Internal fraud",
        "Damage to physical assets",
        "Clients products and business practices",
      ];
export const LIKELIHOOD_LABELS = {
        1: "Rare",
        2: "Possible",
        3: "Probable",
        4: "Frequent",
      };
export const IMPACT_LABELS = {
        1: "Minor",
        2: "Moderate",
        3: "Major",
        4: "Critical",
      };
export const CONTROL_DESIGN_LABELS = {
        1: "Strong",
        2: "Satisfactory",
        3: "Needs Improvement",
        4: "Unsatisfactory",
      };
export const CONTROL_IMPL_LABELS = {
        1: "Fully Implemented",
        2: "Mostly Implemented",
        3: "Partially Implemented",
        4: "Not Implemented",
      };
export const CONTROLS_RATING_LABELS = {
        1: "Strong",
        2: "Satisfactory",
        3: "Needs Improvement",
        4: "Unsatisfactory",
      };
export const RESIDUAL_RISK_LABELS = {
        1: "Minor",
        2: "Moderate",
        3: "Major",
        4: "Critical",
      };
export const RISK_TREATMENTS = ["Accept", "Avoid", "Reduce", "Transfer"];
export const CONTROL_TYPES = ["Preventive", "Detective", "Corrective", "None"];
export const STATUSES = ["Open", "In Progress", "Closed"];
export const RISK_COLORS = {
        1: "#10b981",
        2: "#f59e0b",
        3: "#f97316", 4: "#f43f5e" };

export const ICONS = {
  search: Search,
  edit: Edit2,
  trash: Trash2,
  save: Save,
  x: X,
  plus: Plus,
  chevronDown: ChevronDown,
  book: Book,
  check: Check,
  logout: LogOut,
  view: Eye,
};
