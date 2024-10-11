// writeCollege.ts
// import { supabase } from './supabaseClient';
import { createClient } from "@/utils/supabase/client";

export const writeCollege = async (college: any) => {
  const { data, error } = await createClient()
    .from('colleges-t2')
    .update({ votes: college.votes })
    .eq('id', college.id);

  if (error) {
    console.error('Error writing college:', error);
    return null;
  }

  return data;
};