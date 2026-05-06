import { createClient } from '@supabase/supabase-js';
import type { Risk, Process } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchProcesses(department: string) {
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .eq('department', department)
    .order('process_name');
  if (error) throw error;
  return data as Process[];
}

export async function fetchRisks(department: string) {
  const { data, error } = await supabase
    .from('risks')
    .select('*')
    .eq('department', department)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Risk[];
}

export async function saveRiskData(riskData: Partial<Risk>, id: string | null) {
  if (id) {
    const { error } = await supabase.from('risks').update(riskData).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('risks').insert([riskData]);
    if (error) throw error;
  }
}

export async function deleteRiskData(id: string) {
  const { error } = await supabase.from('risks').delete().eq('id', id);
  if (error) throw error;
}

export async function saveProcessData(department: string, name: string) {
  const { data, error } = await supabase
    .from('processes')
    .insert([{ department, process_name: name }])
    .select()
    .single();
  if (error) throw error;
  return data as Process;
}

export async function deleteProcessData(id: string) {
  const { error } = await supabase.from('processes').delete().eq('id', id);
  if (error) throw error;
}
