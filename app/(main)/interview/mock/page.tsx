"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Quiz from '../_components/Quiz'
import CustomInterviewForm from '../_components/CustomInterviewForm'
import { BarLoader } from 'react-spinners'


export default function MockInterview() {
  const [customInterviewData,setCustomInterviewData] = useState<any>(null)
  const [loading ,setLoading] = useState(false)

  return (
    <div className="container mx-auto space-y-10 py-6">
      <div className="flex justify-between items-center space-y-2 mx-2 flex-wrap">
        <div>
          <Link href="/interview" className='flex  items-center'>
            <ArrowLeft size={20}/>
            <Button disabled={loading} variant="link" className="p-0 cursor-pointer">
              Back to Interview Preparation
            </Button>
          </Link>

          <div>
            <h1 className="text-6xl font-bold gradient-title">Mock Interview</h1>
            <p className="text-muted-foreground">
              Test your knowledge with industry-specific questions
            </p>
          </div>
        </div>
        <div className='mt-5 sm:mt-0'>
        <CustomInterviewForm setCustomInterviewData={setCustomInterviewData} customInterviewData={customInterviewData} setLoading={setLoading}/>
        </div>
      </div>
      {
        loading  ? <BarLoader className="mt-4" width={"100%"} color="gray" />:
      <Quiz customInterviewData={customInterviewData}  setCustomInterviewData={setCustomInterviewData}/>
      }
      
    </div>
  )
}