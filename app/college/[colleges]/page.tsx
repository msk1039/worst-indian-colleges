"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

interface College {
  id: number
  name: string
  votes: number
}

export default function CollegeDetail() {
  const [college, setCollege] = useState<College | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const params = useParams()

  useEffect(() => {
    const fetchCollege = async () => {
      const { data, error } = await supabase
        .from('colleges-t2')
        .select('*')
        .eq('id', params.colleges)
        .single()

      if (error) {
        console.error('Error fetching college:', error)
        toast({
          title: "Error",
          description: "College not found.",
          duration: 5000,
        })
      } else {
        setCollege(data)
      }
      setLoading(false)
    }

    fetchCollege()

    const channel = supabase
      .channel(`college-${params.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'colleges-t2', filter: `id=eq.${params.id}` }, payload => {
        setCollege(prevCollege => prevCollege ? { ...prevCollege, ...payload.new } : null)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, params.id, toast])

  const handleVote = async () => {
    if (!college) return

    const lastVoteTime = localStorage.getItem(`lastVoteTime_${college.id}`)
    const now = Date.now()

    if (!lastVoteTime || now - parseInt(lastVoteTime) >= 300000) {
      const { data, error } = await supabase
        .from('colleges-t2')
        .update({ votes: college.votes + 1 })
        .eq('id', college.id)
        .select()
        .single()

      if (error) {
        console.error('Error voting:', error)
        toast({
          title: "Error",
          description: "Failed to vote. Please try again.",
          duration: 5000,
        })
      } else {
        setCollege(data)
        localStorage.setItem(`lastVoteTime_${college.id}`, now.toString())
        toast({
          title: "Vote Recorded",
          description: "You can vote for this college again in 5 minutes.",
          duration: 5000,
        })
      }
    } else {
      const remainingTime = Math.ceil((300000 - (now - parseInt(lastVoteTime))) / 1000)
      toast({
        title: "Cooldown Active",
        description: `You can vote for this college again in ${remainingTime} seconds.`,
        duration: 5000,
      })
    }
  }

  const canVote = () => {
    if (!college) return false
    const lastVoteTime = localStorage.getItem(`lastVoteTime_${college.id}`)
    return !lastVoteTime || Date.now() - parseInt(lastVoteTime) >= 300000
  }

  if (loading) {
    return <>
    <div className="w-full h-1   bg-gradient-to-br from-purple-700 via-purple-500 to-yellow-400">
      </div>

    </>
  }

  if (!college) {
    return <div>College not found</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans ">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to list
        </Link>
        <h1 className="text-3xl font-bold mb-4">{college.name}</h1>
        <p className="text-xl mb-4">Current Votes: {college.votes}</p>
        <Button
          onClick={handleVote}
          disabled={!canVote()}
          className="w-full "
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Vote for this College
        </Button>
        {!canVote() && (
          <p className="text-md text-red-500 mt-2">
            You can vote again in 5 minutes.
          </p>
        )}
      </div>
      <Toaster />
    </div>
  )
}






// "use client"
// import { createClient } from "@supabase/supabase-js";
// import { useState, useEffect } from "react"
// import { useParams } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { ThumbsUp } from "lucide-react"
// import { Toaster } from "@/components/ui/toaster"
// import { useToast } from "@/hooks/use-toast"

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// const supabase = createClient(supabaseUrl, supabaseKey);

// interface College {
//     id: number;
//     name: string;
//     votes: number;
//     rank: number;
// }

// const CollegePage = () => {
//     const params = useParams();
//     const [college, setCollege] = useState<College | null>(null);
//     const [loading, setLoading] = useState(true);
//     const { toast } = useToast();

//     useEffect(() => {
//         const fetchCollege = async () => {
//             const { data, error } = await supabase
//                 .from('colleges-t2')
//                 .select('*')
//                 .eq('id', params.colleges)
//                 .single();

//             if (error) {
//                 console.error('Error fetching college:', error);
//                 toast({
//                     title: "Error",
//                     description: "College not found.",
//                     duration: 5000,
//                 });
//                 setLoading(false);
//                 return;
//             }

//             setCollege(data);
//             setLoading(false);
//         };

//         fetchCollege();
//     }, [params.colleges, toast]);

//     const handleVote = async (collegeId: number) => {
//         if (!college) return;

//         const lastVoteTime = localStorage.getItem(`lastVoteTime_${collegeId}`);
//         const now = Date.now();
    
//         if (!lastVoteTime || now - parseInt(lastVoteTime) >= 300000) {
//             const newVotes = college.votes + 1;
//             const updatedCollege = { ...college, votes: newVotes };
    
//             // Update Supabase
//             const { data, error } = await supabase
//                 .from('colleges-t2')
//                 .update({ votes: newVotes })
//                 .eq('id', collegeId)
//                 .select()
//                 .single();
    
//             if (error) {
//                 console.error('Error updating votes:', error);
//                 toast({
//                     title: "Error",
//                     description: "Failed to update vote. Please try again.",
//                     duration: 5000,
//                 });
//                 return;
//             }
    
//             // Update local state
//             setCollege(data);
    
//             // Update local storage
//             const storedColleges = JSON.parse(localStorage.getItem('colleges') || '[]');
//             const updatedColleges = storedColleges.map((c: College) => 
//                 c.id === collegeId ? { ...c, votes: newVotes } : c
//             );
//             localStorage.setItem('colleges', JSON.stringify(updatedColleges));
    
//             // Set vote timestamp
//             localStorage.setItem(`lastVoteTime_${collegeId}`, now.toString());
    
//             toast({
//                 title: "Vote Recorded",
//                 description: "You can vote for this college again in 5 minutes.",
//                 duration: 5000,
//             });
//         } else {
//             const remainingTime = Math.ceil((300000 - (now - parseInt(lastVoteTime))) / 1000);
//             toast({
//                 title: "Cooldown Active",
//                 description: `You can vote for this college again in ${remainingTime} seconds.`,
//                 duration: 5000,
//             });
//         }
//     };
    
//     const canVote = (collegeId: number) => {
//         const lastVoteTime = localStorage.getItem(`lastVoteTime_${collegeId}`);
//         return !lastVoteTime || Date.now() - parseInt(lastVoteTime) >= 300000;
//     };

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (!college) {
//         return <div>College not found</div>;
//     }

//     return (
//         <div className="min-h-screen bg-background text-foreground p-8 font-sans">
//             <div className="max-w-2xl mx-auto">
//                 <Link href="/" className="text-primary hover:underline mb-4 inline-block">
//                     &larr; Back to list
//                 </Link>
//                 <h1 className="text-3xl font-bold mb-4">{college.name}</h1>
//                 <p className="text-xl mb-4">Current Votes: {college.votes}</p>
//                 <Button
//                     onClick={() => handleVote(college.id)}
//                     disabled={!canVote(college.id)}
//                     className="w-full"
//                 >
//                     <ThumbsUp className="mr-2 h-4 w-4" />
//                     Vote for this College
//                 </Button>

//                 {!canVote(college.id) && (
//                     <p className="text-md text-red-500 mt-2">
//                         You can vote again in 5 minutes.
//                     </p>
//                 )}
//             </div>
//             <Toaster />
//         </div>
//     );
// };

// export default CollegePage;




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