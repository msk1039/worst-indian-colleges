"use client"
import { createClient } from "@supabase/supabase-js";

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"


import { writeCollege } from '../../api/writeCollege';
// import { generateStaticParams } from './generateStaticParams';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface College {
    id: number;
    name: string;
    votes: number;
    rank: number;
}

// export async function generateStaticParams() {
//     const { data: colleges, error } = await supabase.from('colleges').select('id');

//     if (error) {
//         console.error('Error fetching colleges:', error);
//         return [];
//     }

//     return colleges.map((college: { id: string | number }) => ({
//         colleges: college.id.toString(),
//     }));
// }
const CollegePage = () => {
    const params = useParams();
    const [college, setCollege] = useState<College | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCollege = async () => {
            const { data, error } = await supabase
                .from('colleges-t2')
                .select('*')
                .eq('id', params.colleges)
                .single();

            if (error) {
                console.error('Error fetching college:', error);
                toast({
                    title: "Error",
                    description: "College not found.",
                    duration: 5000,
                });
                setLoading(false);
                return;
            }

            setCollege(data);
            setLoading(false);
        };

        fetchCollege();
    }, [params.colleges, toast]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!college) {
        return <div>College not found</div>;
    }


    const handleVote = async (collegeId: number) => {
        const lastVoteTime = localStorage.getItem(`lastVoteTime_`)
        const now = Date.now()
    
        const newVotes = college.votes + 1;
        const updatedCollege = { ...college, votes: newVotes };
    
        
        if (!lastVoteTime || now - parseInt(lastVoteTime) >= 300000) {
          
          await writeCollege(updatedCollege);

          const newCurrentColleges = JSON.parse(localStorage.getItem('colleges') || '[]')
          const newColleges = newCurrentColleges.map((college: any) => {
            if (college.id === collegeId) {
              return updatedCollege
            }
            return college
          })
          localStorage.setItem('colleges', JSON.stringify(newColleges)) 


    
        console.log("Voted for college", collegeId  ," at ", new Date().toLocaleTimeString())

        
          localStorage.setItem(`lastVoteTime_`, now.toString())
          toast({
            title: "Vote Recorded",
            description: "You can vote for this college again in 5 minutes.",
            duration: 30000,
          })
          setCollege(updatedCollege);
        } else {
          const remainingTime = Math.ceil((300000 - (now - parseInt(lastVoteTime))) / 1000)
          toast({
            title: "Cooldown Active",
            description: `You can vote for this college again in ${remainingTime} seconds.`,
            duration: 30000,
          })
        }
      }
    
      const canVote = (collegeId: number) => {
        const lastVoteTime = localStorage.getItem(`lastVoteTime_`)
        return !lastVoteTime || Date.now() - parseInt(lastVoteTime) >= 300000
      }

    return (
        // <div>
        //     <h1>{college.name}</h1>
        //     <p>Votes: {college.votes}</p>
        //     <p>Rank: {college.rank}</p>
        // </div>
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to list
        </Link>
        <h1 className="text-3xl font-bold mb-4">{college.name}</h1>
        <p className="text-xl mb-4">Current Votes: {college.votes}</p>
        <Button
          onClick={() => handleVote(college.id)}
          disabled={!canVote(college.id)}
          className="w-full"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Vote for this College
        </Button>

        {!canVote(college.id) && (
          <p className="text-md text-red-500 mt-2">
            You can vote again in 5 minutes.
          </p>
        )}
      </div>
      <Toaster />
    </div>
    );
};

export default CollegePage;