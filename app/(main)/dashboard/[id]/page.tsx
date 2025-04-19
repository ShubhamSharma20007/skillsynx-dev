"use client"
import React, { use, useEffect, useState } from 'react'
import { IndustriesInterface, Industry } from '@/interface/IndustriesInterface'
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema } from '@/lib/Schema'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
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
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getUser, updateUser, updateUserDetails } from '@/services/user'
import { industries } from '@/data/industries'
import { useTransition } from 'react'
import { BarLoader } from 'react-spinners'
import { useFetch } from '@/hooks/user-fetch'

type FormValues = {
  industry: string;
  subIndustry: string;
  experience: string;
  skills: string;
  bio: string;
}

const UpdateProfile = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const [isPending, startTransition] = useTransition()
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()


  const{
    data:updateUserData,
    fn:updateUserFn,
    loading:isLoading
  }= useFetch(updateUserDetails)


  // Initialize form with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      industry: "",
      subIndustry: "",
      experience: '',
      skills: "",
      bio: ""
    }
  })

  const watchIndustry = watch("industry")

  // Fetch user data and set form values
  useEffect(() => {
    startTransition(async () => {
      try {
        const userData = await getUser()
        console.log(userData)
        if (userData) {
          if (userData.industry) {
            const [industryId, subIndustryValue] = userData.industry.industry.split('-')
            setValue('industry', industryId)
            const industry = industries.find(ind=>ind.id === industryId)
            if (industry) {
              setSelectedIndustry(industry)
              if (subIndustryValue) {
                const formattedSubIndustry = userData.industry.industry.slice(industryId.length).split("-").join('')
                const subIndustry = industry.subIndustries.find(ind=>ind.replace(/ /g,'').toLowerCase() === formattedSubIndustry.replace(/ /g,''))
          
                setValue('subIndustry', subIndustry!)
              }
            }
          }
          
          // Set other form values
          if (userData.experience) setValue('experience', userData.experience)
          if (userData.skills) setValue('skills', userData.skills.join(', '))
          if (userData.bio) setValue('bio', userData.bio)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load profile data")
      }
    })
  }, [id, setValue])

  const onSubmit= async (value:any) => {
      const formatedIndustry = `${value.industry}-${value.subIndustry.toLowerCase().replace(/ /g,"-")}`
    try {
     const response = await updateUserFn({
        ...value,
        industry: formatedIndustry
      })
    console.log(updateUserData)
     if(updateUserData){
      toast.success('Profile updated successfully')
      router.back()
      router.refresh()
     }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
    } 
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <BarLoader color="gray" width={'50%'} loading={true} />
      </div>
    )
  }

  return (
    <div className='flex justify-center items-center bg-background'>
      <Card className='w-full max-w-lg mx-2'>
        <CardHeader>
          <CardTitle className='gradient-title px-5 text-4xl'>Update Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-3'>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={watchIndustry}
                onValueChange={(value) => {
                  setValue('industry', value)
                  setValue('subIndustry', '') 
                  const industry = industries.find(ind => ind.id === value)
                  setSelectedIndustry(industry || null)
                }}
              >
                <SelectTrigger id='industry' className='w-full'>
                  <SelectValue placeholder="Select Industry Type" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry, idx) => (
                    <SelectItem value={industry.id} key={idx}>{industry.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className='text-sm text-red-500'>
                  {errors.industry.message?.toString()}
                </p>
              )}
            </div>

            {watchIndustry && selectedIndustry && (
              <div className='space-y-3'>
                <Label htmlFor="subIndustry">SubIndustry</Label>
                <Select
                  value={watch('subIndustry')}
                  onValueChange={(value) => setValue('subIndustry', value)}
                >
                  <SelectTrigger id='subIndustry' className='w-full'>
                    <SelectValue placeholder="Select Sub-Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry.subIndustries.map((subIndustry, idx) => (
                      <SelectItem value={subIndustry} key={idx}>{subIndustry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className='text-sm text-red-500'>
                    {errors.subIndustry.message?.toString()}
                  </p>
                )}
              </div>
            )}

            <div className='space-y-3'>
              <Label htmlFor="exp">Years of Experience</Label>
              <Input
                id='exp'
                type='text'
                placeholder='Enter years of experience'
                min={0}
                max={50}
                {...register('experience')}
              />
              {errors.experience && (
                <p className='text-sm text-red-500'>
                  {errors.experience.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-3'>
              <Label htmlFor="skills">Skills</Label>
              <Input
                id='skills'
                type='text'
                placeholder='Ex. Python, Javascript, Project Manager etc'
                {...register('skills')}
              />
              <p className='text-xs text-muted-foreground'>
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className='text-sm text-red-500'>
                  {errors.skills.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-3'>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id='bio'
                placeholder='Ex. I am a software engineer with 5 years of experience'
                className='h-32'
                {...register('bio')}
              />
              {errors.bio && (
                <p className='text-sm text-red-500'>
                  {errors.bio.message?.toString()}
                </p>
              )}
            </div>

            <Button 
              className='w-full cursor-pointer' 
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default UpdateProfile