"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useFetch } from "@/hooks/user-fetch";
// import { coverLetterSchema } from "@/app/lib/schema";
import { generateCoverLetter } from "@/services/cover-letter";
import { coverLetterSchema } from "@/lib/Schema";
import { useRouter } from "next/navigation";
const CoverLetterGenerator = () => {
  const router = useRouter()
  const {
    loading:generating,
    data:generateCoverLetterData,
    error:generateCoverLetterError,
    fn:generateCoverLetterFN
  } = useFetch(generateCoverLetter)


 const{
  register,
  handleSubmit,
  reset,
  formState:{errors},
 } = useForm({
    resolver:zodResolver(coverLetterSchema),
    defaultValues:{
      companyName:'',
      jobTitle:'',
      jobDescription:'',
    }
  })


 async function onSubmit(data:any){
  try {
    await generateCoverLetterFN(data)
    reset()
    router.refresh()
    router.back()
  } catch (error) {
    console.log('error while generating cover letter:',error)
    toast.error('Error generating cover letter')
  }
  }

  useEffect(()=>{
    if(generateCoverLetterError){
      toast.error(generateCoverLetterError.message || 'Error generating cover letter')
    }
    if(generateCoverLetterData && !generating){
      toast.success('Cover letter generated successfully')
    }
  },[generateCoverLetterData,generateCoverLetterError, generating])
  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Provide information about the position you're applying for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Enter job title"
                {...register("jobTitle")}
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here"
              className="h-32"
              {...register("jobDescription")}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500">
                {errors.jobDescription.message}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-2 ">
            <Button type="submit" disabled={generating} className="cursor-pointer">
              {generating ? (
                <>
                  <Loader2 className=" h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
  )
}

export default CoverLetterGenerator