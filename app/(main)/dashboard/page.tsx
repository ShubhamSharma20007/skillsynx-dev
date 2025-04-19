import { getIndustryInsights } from '@/services/dashboard'
import { getUserOnboardingStatus } from '@/services/user'
import { redirect } from 'next/navigation'
import React from 'react'
import { DashboardView } from './_components/DashboardView'
import { Button } from '@/components/ui/button'
import { UserRoundPen } from 'lucide-react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'

export default async function IndustryInsights() {
  const user = await currentUser()
    const [onboardingStatus, insights] = await Promise.all([
        getUserOnboardingStatus(),
        getIndustryInsights(),
    ])

    if(!onboardingStatus.isOnboarded) {
        redirect('/onboarding')
    }
    return (
        <div className='container mx-auto'>
            <div className="grid grid-cols-2 gap-4 sm:mb-5 mt-5 space-y-4 sm:space-y-0">
                <h1 className=" text-3xl sm:text-6xl gradient-title mb-0 font-bold ">Dashboard</h1>
                <div className="flex justify-end self-center h-full">
          <Button type='button' variant={'default'} asChild>
            <Link href={`/dashboard/${user?.id}`} className="flex items-center ">
              <UserRoundPen className='w-4 h-4' />
              Update Profile
            </Link>
          </Button>
        </div>
            </div>
            <DashboardView insights={insights} />
        </div>
    )
}
