export interface FormState {
  department: string;
  risk_description: string;
  possible_causes: string;
  root_cause: string;
  event_type: string;
  likelihood_score: number;
  impact_score: number;
  inherent_risk_score: number;
  control_description: string;
  control_type: string;
  control_design_score: number;
  control_implementation_score: number;
  controls_rating: number;
  residual_risk_score: number;
  risk_treatment: string;
  action_plan: string;
  action_plan_deadline: string;
  status: string;
  assessment_period: string;
  process_id: string;
  process_name: string;
}

export interface Risk extends FormState {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Process {
  id: string;
  department: string;
  process_name: string;
}
