"use client"
import React, { useEffect, useState } from 'react'
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { customInterviewValidation } from '@/lib/Schema'
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, PlusIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from 'zod'
import { industries } from '@/data/industries'
import { useFetch } from '@/hooks/user-fetch'
import { generateCustomQuiz } from '@/services/interview'
import Quiz from './Quiz'
import { toast } from 'sonner'

const difficultyLevel = [
    {
        value: "beginner",
        label: 'Beginner'
    },
    {
        value: "intermediate",
        label: 'Intermediate'
    },
    {
        value: "advanced",
        label: 'Advanced'
    }
]

const timerArray = [
    {
        value: "10",
        label: '10 minutes'
    },
    {
        value: "15",
        label: '15 minutes'
    },
    {
        value: "30",
        label: '30 minutes'
    },
    {
        value: "60",
        label: '60 minutes'
    }
]

const LanguagePrefrence = [
    {
        value: 'english',
        label: 'English'
    },
    {
        value: 'hindi',
        label: 'Hindi'
    }
]

interface Props {
    customInterviewData: any,
    setCustomInterviewData: React.Dispatch<React.SetStateAction<any>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const CustomInterviewForm: React.FC<Props> = ({ customInterviewData, setCustomInterviewData,setLoading }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndustry, setSelectedIndustry] = React.useState<any>(null);
    const {
        data: customQuizData,
        loading,
        fn: customQuizFN
    } = useFetch(generateCustomQuiz)
    const { control,
        handleSubmit,
        watch,
        reset,
        setValue,
        register,
        formState: { errors } } = useForm({
            resolver: zodResolver(customInterviewValidation),
            defaultValues: {
                subIndustry: '',
                industry: '',
                difficultyLevel: '',
                questionCount: 10,
                language: "english",
                skills: '',
                isTimer: false,
                experienceLevel: '',
                timerValue: ''
            },
        })

    const isTimer = watch('isTimer')
    const watchIndustry = watch("industry")


    type CustomInterviewFormData = z.infer<typeof customInterviewValidation>;
    const onSubmit: SubmitHandler<CustomInterviewFormData> = async (data) => {
        setIsOpen(false)
        try {
            await customQuizFN(data)
        } catch (error : any) {
            toast.error('error during generating custom interview',error || error.message)
        }
    };
    useEffect(() => {
        if (!isTimer) {
            setValue('timerValue', '')
        } else if (isTimer && !watch('timerValue')) {
            setValue('timerValue', '15 minutes')
        }
    }, [isTimer, setValue, watch])

    useEffect(() => {
        if (customQuizData) {
            setCustomInterviewData(customQuizData);
            setIsOpen(false);
            reset();
        }
    }, [customQuizData, setCustomInterviewData]);

    useEffect(()=>{
    setLoading(loading)
    },[loading])
    return (
        <>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {!customInterviewData &&
                        <Button type='button' variant={'outline'} className='cursor-pointer flex items-center'>
                            Start New Custom Quiz
                        </Button>
                    }
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[95vh] z-50  overflow-y-scroll flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className='gradient-title text-3xl'>Custom Interview Form</DialogTitle>
                        <DialogDescription>
                            Fill in the form to create your custom interview questions.
                        </DialogDescription>
                    </DialogHeader>
                    <form className='space-y-4 pt-4' onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="industry"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <Label htmlFor="industry">Industry</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            const selected = industries.find((industry) => industry.id === value);
                                            setSelectedIndustry(selected || null);
                                            setValue('subIndustry', '');
                                        }}
                                        value={field.value}
                                    >
                                        <SelectTrigger id="industry" className="w-full">
                                            <SelectValue placeholder="Select Industry Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map((industry, idx) => (
                                                <SelectItem value={industry.id} key={idx}>
                                                    {industry.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.industry && (
                                        <p className="text-sm text-red-500">{errors.industry.message}</p>
                                    )}
                                </>
                            )}
                        />
                        {watchIndustry && (
                            <Controller
                                name="subIndustry"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Label htmlFor="subIndustry">SubIndustry</Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger id="subIndustry" className="w-full">
                                                <SelectValue placeholder="Select SubIndustry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedIndustry?.subIndustries.map((industry: any, idx: number) => (
                                                    <SelectItem value={industry} key={idx}>
                                                        {industry}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subIndustry && (
                                            <p className="text-sm text-red-500">{errors.subIndustry.message}</p>
                                        )}
                                    </>
                                )}
                            />
                        )}

                        <Controller
                            control={control}
                            name="difficultyLevel"
                            render={({ field }) => (
                                <div className='space-y-3'>
                                    <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                                    <Select
                                        onValueChange={(value) => field.onChange(value)}
                                        value={field.value}
                                    >
                                        <SelectTrigger id='difficultyLevel' className='w-full'>
                                            <SelectValue placeholder="Select Difficulty Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {difficultyLevel.map((level, idx) => (
                                                <SelectItem value={level.value} key={idx}>{level.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.difficultyLevel && (
                                        <p className='text-sm text-red-500'>
                                            {errors.difficultyLevel.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <div className='space-y-3'>
                            <Label htmlFor="question-count">Number of questions</Label>
                            <Input
                                id='question-count'
                                type='number'
                                placeholder='10'
                                {...register('questionCount', { valueAsNumber: true })}
                            />
                            {
                                errors.questionCount && (
                                    <p className='text-sm text-red-500'>
                                        {errors.questionCount.message}
                                    </p>
                                )
                            }
                        </div>

                        <div className=' grid grid-cols-2 gap-4 mb-3'>
                            <Controller
                                control={control}
                                name='experienceLevel'
                                render={({ field }) => (
                                    <div className='space-y-3'>
                                        <Label htmlFor="experienceLevel">Experience Level</Label>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger id='experienceLevel' className='w-full'>
                                                <SelectValue placeholder="Select Experience Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Fresher', 'Mid-level', 'Senior'].map((level, idx) => (
                                                    <SelectItem key={idx} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {
                                            errors.experienceLevel && (
                                                <p className='text-sm text-red-500'>
                                                    {errors.experienceLevel.message}
                                                </p>
                                            )
                                        }
                                    </div>
                                )}
                            ></Controller>

                            <div className='space-y-3'>
                                <Label htmlFor="language">Preferred Language</Label>
                                <Select
                                    onValueChange={(value) => {
                                        setValue('language', value)
                                    }}>
                                    <SelectTrigger id='language' className='w-full'>
                                        <SelectValue placeholder="Select Preferred Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            LanguagePrefrence.map((lang, idx) => <SelectItem value={lang.value} key={idx}>{lang.label}</SelectItem>)
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
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
                            {
                                errors.skills && (
                                    <p className='text-sm text-red-500'>
                                        {errors.skills.message}
                                    </p>
                                )
                            }
                        </div>

                        <div className='space-y-3'>
                            <div className="flex items-center space-x-2">
                                <Controller
                                    control={control}
                                    name="isTimer"
                                    render={({ field: { onChange, value } }) => (
                                        <Switch
                                            id="add-timer"
                                            checked={value}
                                            onCheckedChange={onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="add-timer">Do you want to add timer?</Label>
                            </div>
                        </div>

                        {isTimer && (
                            <div className='grid grid-cols-4 gap-2 mt-3'>
                                {timerArray.map((item) => (
                                    <Badge
                                        key={item.value}
                                        onClick={() => setValue('timerValue', item.label)}
                                        className='text-xs cursor-pointer flex justify-center'
                                        variant={watch('timerValue') === item.label ? 'default' : 'outline'}
                                    >
                                        {item.label}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                disabled={loading}
                                className='w-full cursor-pointer' type='submit'>
                                {
                                    loading ?
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin'>Generating...</Loader2>
                                        : 'Start Quiz'
                                }

                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CustomInterviewForm