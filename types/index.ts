export interface User {
  id: string
  username: string
  email?: string
  name?: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  yearly_income_aed: number
  yearly_income_inr: number
  monthly_takehome_aed: number
  income_source: 'salary' | 'self-employed' | 'mixed'
  risk_tolerance: 'low' | 'medium' | 'high'
  time_horizon: 'short' | 'medium' | 'long'
  primary_motivation: 'freedom' | 'family' | 'security'
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  currency: string
  target_date?: string
  notes?: string
  is_primary: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface GoalHistory {
  id: string
  goal_id: string
  changed_field: string
  old_value: string
  new_value: string
  changed_at: string
}

export interface Investment {
  id: string
  user_id: string
  goal_id?: string
  platform: string
  type: string
  invested_amount: number
  current_value: number
  currency: string
  month: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  due_date?: string
  category: string
  payment_type: 'essential' | 'lifestyle' | 'discretionary'
  status: 'due' | 'paid' | 'overdue'
  is_recurring: boolean
  icon: string
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: string
  user_id: string
  analysis_json: {
    whereYouStand: Array<{
      goal: string
      status: 'on_track' | 'at_risk' | 'overdue'
      message: string
      percentage: number
    }>
    whatsWorking: Array<{
      title: string
      detail: string
    }>
    holdingYouBack: Array<{
      title: string
      detail: string
      severity: 'high' | 'medium' | 'low'
    }>
    nextActions: Array<{
      priority: number
      action: string
      impact: string
      timeline: string
    }>
  }
  created_at: string
}

export interface PsychologyProgress {
  id: string
  user_id: string
  trap_number: number
  status: 'aware' | 'working' | 'mastered'
  updated_at: string
}

export interface ExchangeRate {
  from_currency: string
  to_currency: string
  rate: number
  fetched_at: string
}

export interface SessionPayload {
  userId: string
  username: string
  name: string
  iat: number
  exp: number
}
