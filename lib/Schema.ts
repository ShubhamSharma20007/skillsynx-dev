import {z} from "zod"
export  const onboardingSchema = z.object({
    industry:z.string({
        required_error:"Industry is required",
    
    }),
    subIndustry: z.string({
        required_error: "Please select a specialization",
      }),
     bio: z.string().max(500).optional(),
     experience: z
     .string()
     .transform((val) => parseInt(val, 10))
     .pipe(
       z
         .number()
         .min(0, "Experience must be at least 0 years")
         .max(50, "Experience cannot exceed 50 years")
     ),
     skills: z.string().transform((val) =>
        val
          ? val
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined
      ),
})


export const contactSchema = z.object({
  email:z.string().email({
    message:'Email is required'
  }),
  mobile:z.string().min(10).max(12).optional(),
  linkedin:z.string().optional(),
  twitter:z.string().optional(),
})

export const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  organization: z.string().min(1, "Organization is required").max(50),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(5, "Description is required"),
  isCurrent: z.boolean().default(false)
}).refine((data)=>{
  if(!data.isCurrent && !data.endDate){
    return false
  }
  return true
},{
  message:'End date is required if not current position',
  path:['endDate']
})

export const resumeSchema = z.object({
  contactInfo:contactSchema,
  summary:z.string().min(1, "Summary is required").max(500),
  skills:z.string().min(1, "Skills is required"),
  experience:z.array(entrySchema),
  education:z.array(entrySchema),
  projects:z.array(entrySchema)
})

export const coverLetterSchema = z.object({
  companyName:z.string().min(1, "Company name is required"),
  jobTitle:z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(5, "Job description is required and should be at least 10 characters long"),
})

export const customInterviewValidation=z.object({
  industry:z.string().min(1, "Industry is required"),
subIndustry: z.string().min(1, "Sub Industry is required"),

  difficultyLevel:z.string().min(1, "Difficulty level is required"),
  questionCount:z.number().min(10, "Question should be at least 10 and maxiumum 25"),
  skills: z.string().min(1, "Skills is required").transform((val) =>
    val
      ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined
  ),
  isTimer:z.optional(z.boolean()),
  experienceLevel:z.string().min(1, "Experience level is required"),
  timerValue: z.string().optional(),
  language:z.string().optional()
})