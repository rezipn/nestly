import { createClient } from '@supabase/supabase-js';

const url = 'https://nveeybyotasduyjthlqs.supabase.co';
const key = 'sb_publishable_vRCXlCRXkrR_BIK5UYsZng_1FzA1lVo';

export const supabase = createClient(url, key);

export interface GoalRow {
  id: number;
  name: string;
  target: number;
  deadline: string;
  color: string;
}

export interface ContributionRow {
  id: number;
  goal_id: number;
  who: string;
  amount: number;
  note: string;
  created_at: string;
}

export async function fetchGoals(): Promise<GoalRow[]> {
  const { data, error } = await supabase.from('goals').select('*').order('id');
  if (error) throw error;
  return data as GoalRow[];
}

export async function fetchContributions(): Promise<ContributionRow[]> {
  const { data, error } = await supabase.from('contributions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as ContributionRow[];
}

export async function fetchGoalById(id: number): Promise<GoalRow> {
  const { data, error } = await supabase.from('goals').select('*').eq('id', id).single();
  if (error) throw error;
  return data as GoalRow;
}

export async function fetchContributionsByGoal(goalId: number): Promise<ContributionRow[]> {
  const { data, error } = await supabase.from('contributions').select('*').eq('goal_id', goalId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as ContributionRow[];
}

export async function insertContribution(goalId: number, who: string, amount: number, note: string) {
  const { error } = await supabase.from('contributions').insert({ goal_id: goalId, who, amount, note });
  if (error) throw error;
}

export async function insertGoal(name: string, target: number, deadline: string, color: string) {
  const { error } = await supabase.from('goals').insert({ name, target, deadline, color });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function deleteGoal(id: number) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteContribution(id: number) {
  const { error } = await supabase.from('contributions').delete().eq('id', id);
  if (error) throw error;
}

export interface TransactionRow {
  id: number;
  type: 'income' | 'expense';
  category: string;
  who: string;
  amount: number;
  note: string;
  created_at: string;
}

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as TransactionRow[];
}

export async function insertTransaction(t: Omit<TransactionRow, 'id' | 'created_at'>) {
  const { error } = await supabase.from('transactions').insert(t);
  if (error) throw error;
}

export async function deleteTransaction(id: number) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export interface PersonRow { id: number; name: string; created_at: string; }

export async function fetchPeople() {
  const { data, error } = await supabase.from('people').select('*').order('id');
  if (error) throw error;
  return data as PersonRow[];
}

export async function insertPerson(name: string) {
  const { error } = await supabase.from('people').insert({ name });
  if (error) throw error;
}

export async function updatePerson(id: number, name: string) {
  const { error } = await supabase.from('people').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deletePerson(id: number) {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}
