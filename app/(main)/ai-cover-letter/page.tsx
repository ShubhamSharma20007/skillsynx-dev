import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'
import CoverLetterList from './_components/CoverLetterList'
import Link from 'next/link' // Import Link from Next.js, not from lucide-react
import { getCoverLetters } from '@/services/cover-letter'
export default async function AICoverLetter() {
  const coverLetters = await getCoverLetters()
  

  return (
   <>
    <div className='container mx-auto space-y-10 py-6'>
     <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">My Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button variant={'default'}  className="cursor-pointer">
            <Plus className="h-4 w-4 " />
            Create New
          </Button>
        </Link>
      </div>

    <CoverLetterList coverLetters={coverLetters} />
  </div>
   </>
  )
}