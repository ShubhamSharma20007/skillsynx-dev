"use client"
import React, { useEffect } from 'react'
import { IndustriesInterface, Industry } from '@/interface/IndustriesInterface'
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema } from '@/lib/Schema'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/user-fetch'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateUser } from '@/services/user'
const OnBoardingForm: React.FC<IndustriesInterface> = ({ industries }) => {
  const [selectedIndustry, setSelectedIndustry] = React.useState<Industry | null>(null);
  
  const {
    data: updateResult,
    fn:updateUserfn,
    loading:updateLoading
  } = useFetch(updateUser)

  const router = useRouter()
  const { register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch

  } = useForm({
    resolver: zodResolver(onboardingSchema)
  })

  const watchIndustry = watch("industry")

  async function onSubmit(value:any){
    try {
      const formatedIndustry = `${value.industry}-${value.subIndustry.toLowerCase().replace(/ /g,"-")}`
     await updateUserfn({
      ...value,
      industry: formatedIndustry
    })
    } catch (error) {
      console.log('onboarding error:', error)
      
    }
  }


  useEffect(() => {

  if(!updateLoading && updateResult){
    toast.success('Profile updated successfully')
    router.push('/dashboard')
    router.refresh()

  }
  
  }, [updateLoading,updateResult])
  
  return (
    <div className='flex justify-center items-center bg-background'>
      <Card className='w-full max-w-lg  mx-2'>
        <CardHeader>
          <CardTitle className='gradient-title text-4xl'>Complete Your Profile</CardTitle>
          <CardDescription>Select your industry to get  personalized career insignts and recommendation's</CardDescription>
        </CardHeader>
        <CardContent className='z-50'>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-3'>
              <Label htmlFor="industry" >Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue('industry', value)
                  const selected = industries.find((industry) => industry.id === value);
                  setSelectedIndustry(
                    selected || null
                  )
                  setValue('subIndustry', '')
                }}
              >
                <SelectTrigger id='industry' className='w-full'>
                  <SelectValue placeholder="Select Industry Type" />
                </SelectTrigger>
                <SelectContent>
                  {
                    industries.map((industry, idx) => <SelectItem value={industry.id} key={idx}>{industry.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              {
                errors.industry && (
                  <p className='text-sm text-red-500'>
                    {errors.industry.message}
                  </p>
                )
              }
            </div>
            {watchIndustry &&
              <div className='space-y-3'>
                <Label htmlFor="subIndustry" >SubIndustry</Label>
                <Select
                  onValueChange={(value) => {
                    setValue('subIndustry', value)
                  }}
                >
                  <SelectTrigger id='subIndustry' className='w-full'>
                    <SelectValue placeholder="Select Industry Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      selectedIndustry?.subIndustries.map((industry, idx) => <SelectItem value={industry} key={idx}>{industry}</SelectItem>)
                    }

                  </SelectContent>
                </Select>
                {
                  errors.subIndustry && (
                    <p className='text-sm text-red-500'>
                      {errors.subIndustry.message}
                    </p>
                  )
                }
              </div>
            }
            {/* exp */}
                <div className='space-y-3'>
                <Label htmlFor="exp" >Year of Experience</Label>
               <Input
               id='exp'
               type='number'
               placeholder='Enter years of experience'
               min={0}
               max={50}
               {...register('experience')}

               ></Input>
                {
                  errors.experience && (
                    <p className='text-sm text-red-500'>
                      {errors.experience.message}
                    </p>
                  )
                }
              </div>

              <div className='space-y-3'>
                <Label htmlFor="skills" >Skills</Label>
                <Input
               id='skills'
               type='text'
               placeholder='Ex. Python, Javascript,Project Manager etc'
               {...register('skills')}

               ></Input>
               <p className='text-xs text-muted-foreground'>
                Separate multiple skills with commas
               </p>
              
                {
                  errors.skills && (
                    <p className='text-sm text-red-500'>
                      {errors.skills.message}
                    </p>
                  )
                }
              </div>
              <div className='space-y-3'>
                <Label htmlFor="bio" >Professional Bio</Label>
                <Textarea
               id='bio'
               placeholder='Ex. I am a software engineer with 5 years of experience'
               className='h-32'
               {...register('bio')}
               ></Textarea>
            
                {
                  errors.bio && (
                    <p className='text-sm text-red-500'>
                      {errors.bio.message}
                    </p>
                  )
                }
              </div>
              <Button 
              disabled={updateLoading}
              className='w-full cursor-pointer' type='submit'>
                {
                  updateLoading ?
                  <Loader2 className=' h-4 w-4 animate-spin'>Saving...</Loader2>
                  : 'Complete Profile'
                }
              </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnBoardingForm
