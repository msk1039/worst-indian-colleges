// app/[colleges]/generateStaticParams.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateStaticParams() {
    const { data: colleges, error } = await supabase.from('colleges').select('id');

    if (error) {
        console.error('Error fetching colleges:', error);
        return [];
    }

    return colleges.map((college: { id: string | number }) => ({
        colleges: college.id.toString(),
    }));
}