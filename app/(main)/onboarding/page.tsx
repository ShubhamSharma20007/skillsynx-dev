
import React from 'react'
import {industries} from "@/data/industries.js"
import OnBoardingForm from './_components/OnBoardingForm'
import { getUserOnboardingStatus } from '@/services/user'
import { redirect } from 'next/navigation'
export default async function OnBoarding() {
  const {isOnboarded} = await getUserOnboardingStatus()
  if(isOnboarded) {
    redirect('/dashboard')
  }
    return (
    <div>
        <OnBoardingForm industries={industries}/> 
    </div>
  )
}
