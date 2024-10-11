// fetchColleges.ts
// import { supabase } from './supabaseClient';
import { createClient } from "@/utils/supabase/client";

export const fetchColleges = async () => {
  const { data, error } = await createClient()
    .from('colleges-t2')
    .select('*')
    .order('rank', { ascending: true });

  console.log(data?.length);

  if (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }

  return data;
};