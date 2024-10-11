
// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Sun, Moon } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { useTheme } from "next-themes"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface College {
  id: number
  name: string
  votes: number
  rank?: number
}

export default function CollegeList() {
  const [colleges, setColleges] = useState<College[]>([])
  const [currentColleges, setCurrentColleges] = useState<College[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const collegesPerPage = 20
  const { theme, setTheme } = useTheme()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase.from('colleges-t2').select('*')
      if (error) {
        console.error('Error fetching colleges:', error)
      } else {
        setColleges(data || [])
        setLoading(false)
      }
    }

    fetchColleges()

    const channel = supabase
      .channel('colleges-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'colleges-t2' }, payload => {
        setColleges(prevColleges => 
          prevColleges.map(college => 
            college.id === payload.new.id ? { ...college, ...payload.new } : college
          )
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    const sortedColleges = [...colleges].sort((a, b) => b.votes - a.votes)
    const rankedColleges = sortedColleges.map((college, index) => ({ ...college, rank: index + 1 }))
    const filteredColleges = rankedColleges.filter((college) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const sortedFilteredColleges = sortOrder === "desc" ? filteredColleges : [...filteredColleges].reverse()
    const indexOfLastCollege = currentPage * collegesPerPage
    const indexOfFirstCollege = indexOfLastCollege - collegesPerPage
    setCurrentColleges(sortedFilteredColleges.slice(indexOfFirstCollege, indexOfLastCollege))
  }, [colleges, searchTerm, sortOrder, currentPage])

  const handleSort = () => {
    setSortOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const totalPages = Math.ceil(colleges.length / collegesPerPage)

  const getPaginationItems = (currentPage: number, totalPages: number) => {
    const paginationItems = []

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(i)
      }
    } else {
      if (currentPage > 2) {
        paginationItems.push('...')
      }

      const startPage = Math.max(1, currentPage - 1)
      const endPage = Math.min(totalPages, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        paginationItems.push(i)
      }

      if (currentPage < totalPages - 1) {
        paginationItems.push('...')
      }
    }

    return paginationItems
  }

  const PaginationList = ({ currentPage, totalPages, setCurrentPage }: {
    currentPage: number
    totalPages: number
    setCurrentPage: (page: number) => void
  }) => {
    const paginationItems = getPaginationItems(currentPage, totalPages)

    return (
      <>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === '...' ? (
              <PaginationEllipsis onClick={() => (index === 0) ? setCurrentPage(1) : setCurrentPage(totalPages - 1)} />
            ) : (
              <PaginationLink
                onClick={() => typeof item === 'number' && setCurrentPage(item)}
                isActive={currentPage === item}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </>
    )
  }

  if (loading) {
    return <div className="w-full h-1  bg-gradient-to-br from-purple-700 via-purple-500 to-yellow-400">
      </div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold font-mono">WORST INDIAN COLLEGES</h1>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
        <h3 className="text-xl font-medium mb-4 text-left animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-5xl font-black">Vote for which is the WORST indian college out there. Click the search bar, search your college and HIT the VOTE BUTTON</h3>
        <div className="mb-8 flex gap-4">
          <Input
            type="text"
            placeholder="Search for a college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSort} variant="outline">
            Sort
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>College Name</TableHead>
                <TableHead className="text-right">Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentColleges.map((college) => (
                <TableRow key={college.id} className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-medium">{college.rank}</TableCell>
                  <TableCell>
                    <Link href={`/college/${college.id}`} className="hover:underline hover:text-primary">
                      {college.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{college.votes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-center overflow-x-auto">
          <Pagination>
            <PaginationContent>
              <PaginationList currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <Toaster />
    </div>
  )
}












 // <div className="min-h-screen bg-yellow-300 p-8 font-mono">
    //   <div className="max-w-4xl mx-auto">
    //     <h1 className="text-5xl font-black text-center mb-8 text-blue-900 transform ">
    //       Indian College Voter
    //     </h1>
    //     <div className="mb-8 flex gap-4">
    //       <Input
    //         type="text"
    //         placeholder="Search for a college..."
    //         value={searchTerm}
    //         onChange={(e) => setSearchTerm(e.target.value)}
    //         className="flex-grow border-4 border-blue-900 rounded-none shadow-[4px_4px_0_0_#1e3a8a] 
    //                    bg-white text-blue-900 placeholder-blue-400 font-bold py-2 px-4"
    //       />
    //       <Button
    //         onClick={handleSort}
    //         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 
    //                    border-4 border-blue-900 rounded-none shadow-[4px_4px_0_0_#1e3a8a] 
    //                    transform transition-all hover:translate-x-1 hover:translate-y-1 
    //                    hover:shadow-[2px_2px_0_0_#1e3a8a]"
    //       >
    //         Sort
    //         <ArrowUpDown className="ml-2 h-4 w-4" />
    //       </Button>
    //     </div>
    //     <div className="border-4 border-blue-900 bg-white shadow-[8px_8px_0_0_#1e3a8a]">
    //       <Table>
    //         <TableHeader>
    //           <TableRow>
    //             <TableHead className="w-[80px]">Rank</TableHead>
    //             <TableHead>College Name</TableHead>
    //             <TableHead className="text-right">Votes</TableHead>
    //             <TableHead className="w-[100px]"></TableHead>
    //           </TableRow>
    //         </TableHeader>
    //         <TableBody>
    //           {currentColleges.map((college) => (
    //             <TableRow key={college.id} className="hover:bg-blue-100 transition-colors">
    //               <TableCell>
    //                 <div className="flex items-center">
    //                   <span className="mr-2">{college.rank}</span>
    //                   {college.rank < college.id && <TrendingUp className="text-green-500 w-4 h-4" />}
    //                   {college.rank > college.id && <TrendingDown className="text-red-500 w-4 h-4" />}
    //                 </div>
    //               </TableCell>
    //               <TableCell className="font-medium">{college.name}</TableCell>
    //               <TableCell className="text-right">{college.votes}</TableCell>
    //               <TableCell>
    //                 <Button
    //                   onClick={() => handleVote(college.id)}
    //                   disabled={!canVote(college.id)}
    //                   className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 
    //                              border-2 border-blue-900 rounded-none shadow-[2px_2px_0_0_#1e3a8a] 
    //                              transform transition-all hover:translate-x-0.5 hover:translate-y-0.5 
    //                              hover:shadow-[1px_1px_0_0_#1e3a8a] disabled:opacity-50 
    //                              disabled:cursor-not-allowed"
    //                 >
    //                   <ThumbsUp className="h-4 w-4 mr-1" />
    //                   Vote
    //                 </Button>
    //               </TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     </div>
    //     <div className="mt-4 flex justify-center">
    //       <Pagination>
    //         <PaginationContent>
    //           <PaginationItem>
    //             <PaginationPrevious 
    //               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
    //               className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
    //             />
    //           </PaginationItem>
    //           {Array.from({ length: Math.ceil(filteredColleges.length / collegesPerPage) }, (_, i) => (
    //             <PaginationItem key={i}>
    //               <PaginationLink
    //                 onClick={() => setCurrentPage(i + 1)}
    //                 isActive={currentPage === i + 1}
    //               >
    //                 {i + 1}
    //               </PaginationLink>
    //             </PaginationItem>
    //           ))}
    //           <PaginationItem>
    //             <PaginationNext 
    //               onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredColleges.length / collegesPerPage), prev + 1))}
    //               className={currentPage === Math.ceil(filteredColleges.length / collegesPerPage) ? "pointer-events-none opacity-50" : ""}
    //             />
    //           </PaginationItem>
    //         </PaginationContent>
    //       </Pagination>
    //     </div>
    //   </div>
    //   <Toaster />
    // </div>