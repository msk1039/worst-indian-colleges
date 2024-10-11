// VoteButton.tsx
"use client";

import React from 'react';
import { writeCollege } from '../../api/writeCollege';

interface VoteButtonProps {
  onClick: () => void;
  disabled: boolean;
    college: any;
}

const VoteButton: React.FC<VoteButtonProps> = ({  college   }) => {

    const handleVote = async (collegeId: number) => {
        if (typeof window === 'undefined') {
          return;
        }
        const lastVoteTime = localStorage.getItem(`lastVoteTime_${collegeId}`);
        const now = Date.now();
      
        if (!lastVoteTime || now - parseInt(lastVoteTime) >= 300000) {
          const newVotes = college.votes + 1;
          const updatedCollege = { ...college, votes: newVotes };
      
          await writeCollege(updatedCollege);
      
          console.log("Voted for college", collegeId, " at ", new Date().toLocaleTimeString());
      
          localStorage.setItem(`lastVoteTime_${collegeId}`, now.toString());
          // toast({
          //     title: "Vote Recorded",
          //     description: "You can vote for this college again in 5 minutes.",
          //     duration: 30000,
          // });
        } else {
          const remainingTime = Math.ceil((300000 - (now - parseInt(lastVoteTime))) / 1000);
          // toast({
          //     title: "Cooldown Active",
          //     description: `You can vote for this college again in ${remainingTime} seconds.`,
          //     duration: 3000,
          // });
        }
      };
    
      const canVote = () => {
        if (typeof window === 'undefined') {
          return false;
        }
        const lastVoteTime = localStorage.getItem(`lastVoteTime_`);
        return !lastVoteTime || Date.now() - parseInt(lastVoteTime) >= 300000;
      };



  return (
    <button onClick={() => handleVote(college.id)} disabled={!canVote()}>
      Vote
    </button>
  );
};

export default VoteButton;