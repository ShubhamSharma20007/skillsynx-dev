import React from 'react'
import StatesCards from './_components/StatesCards'
import { getAssesments } from '@/services/interview'
import QuizList from './_components/QuizList'
import PerformanceChart from './_components/PerformanceChart'
import { getUserOnboardingStatus } from '@/services/user'
import { redirect } from 'next/navigation'
export default async function Interview() {
  const { isOnboarded } = await getUserOnboardingStatus()
  if (!isOnboarded) {
    redirect('/onboarding')
  }
  const assessments = await getAssesments()
  return (
    <div className='container mx-auto space-y-10 py-6'>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatesCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  )
}
