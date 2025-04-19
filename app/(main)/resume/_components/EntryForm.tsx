"use client"
import { Button } from '@/components/ui/button';
import { entrySchema } from '@/lib/Schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, Sparkle, Sparkles, X } from 'lucide-react';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { inhancePrompt } from '@/services/resume';
import { useFetch } from '@/hooks/user-fetch';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
const EntryForm = ({ type, entries, onChange }: { type: string, entries: any[], onChange: any }) => {
    const [isAdding, setIsAdding] = React.useState(false)
    const {
        register,
        handleSubmit: handleValidation,
        formState: { errors },
        reset,
        watch,
        setValue,
        getValues
    } = useForm({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            isCurrent: false,
        },
    });
    const current = watch('isCurrent')

    // imporve the prompt
    const {
        loading: isImproving,
        fn: improveWithAIFn,
        data: improvedContent,
        error: improveError,
    } = useFetch(inhancePrompt);


    const formmatedDate = (dateString: string) => {
        if (!dateString) return ''
        const date = parse(dateString, 'yyyy-MM', new Date())
  
        return format(date, 'MMM yyyy')
    }

    console.log(entries)

    const handleDelete =(index:number)=>{
        const newEntries = entries.filter((_, i) => i !== index)
        onChange(newEntries)

    }

    const handleAddEntry = handleValidation((data) => {
        const formattedEntry = {
            ...data,
            startDate: formmatedDate(data.startDate),
            endDate: data.isCurrent ? '' : formmatedDate(data.endDate!)
        }
        onChange([...entries, formattedEntry])
        reset();
        setIsAdding(false)
    })
    const inhanceDiscription = async () => {
        const discription = watch('description')
        if (!discription) {
            toast.error('Please add a description')
            return;
        }
        await improveWithAIFn({ string: getValues('description'), type: type.toLowerCase() })

    }



    useEffect(() => {
        if (improvedContent) {
            setValue('description', improvedContent)
        }
        if (improveError) {
            toast.error('Error improving description')
        }
    }, [improvedContent, improveError, isImproving, setValue])

    return (
        <div className='space-y-4'>
            <div className='space-y-4'>
                {
                   entries.map((entry,index) => (
                        <Card key={index} className='gap-2'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className='text-lg font-medium'>{entry.title} @ {entry.organization}</CardTitle>
                                <Button
                                type='button'
                                variant='outline'
                                className='cursor-pointer '
                                size={'icon'}
                                onClick={()=>{
                                    handleDelete(index)
                                }}
                                >
                            <X className='w-4 h-4 '/>
                                </Button>
                           
                            </CardHeader>
                            <CardContent>
                            <p className="text-sm text-muted-foreground">
                            {entry.isCurrent
                            ? `${entry.startDate} - Present`
                            : `${entry.startDate} - ${entry.endDate}`}
                        </p>
                        <p className="mt-2 text-sm whitespace-pre-wrap">
                {entry.description}
              </p>
                            </CardContent>
                      
                        </Card>
                    ))
                }


            </div>
            {
                isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add {type}</CardTitle>

                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Input
                                        type='text'
                                        placeholder={type === 'Education' ? 'Degree/Program' : 'Title/Position'}
                                        {...register("title")}
                                    ></Input>
                                    {errors.title && <p className='text-red-500 text-sm'>{errors.title.message}</p>}
                                </div>
                                <div className='space-y-2'>
                                    <Input
                                        type='text'
                                        placeholder={type === 'Education' ? 'University/College' : 'Company/Organization'}
                                        {...register("organization")}
                                    ></Input>
                                    {errors.organization && <p className='text-red-500 text-sm'>{errors.organization.message}</p>}
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className="space-y-2">
                                    <Input

                                        type="month"
                                        {...register("startDate")}

                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-500">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="month"
                                        {...register("endDate")}
                                        disabled={current}
                                    />
                                    {errors.endDate && (
                                        <p className="text-sm text-red-500">
                                            {errors.endDate.message}
                                        </p>
                                    )}
                                </div>

                                {/* checkbox */}
                                <div className='flex items-center space-x-2'>
                                    <Input
                                        type='checkbox'
                                        id='current'
                                        checked={current}
                                        className='h-4 w-4'
                                        {...register("isCurrent")}
                                        onChange={(e) => {
                                            setValue('isCurrent', e.target.checked)
                                            if (e.target.checked) {
                                                setValue('endDate', '')
                                            }
                                        }}
                                    />
                                    <Label htmlFor='current'>Current {type}</Label>
                                </div>

                            </div>


                            <div className="space-y-2">
                                <Textarea
                                    placeholder={`Description of your ${type.toLowerCase()}`}
                                    className="h-32"
                                    {...register("description")}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                variant={'default'}
                                size={'sm'}
                                onClick={inhanceDiscription}
                                disabled={isImproving || !watch('description')}
                            >

                                {
                                    isImproving ?
                                        <>
                                            <Loader2 className='h-4 w-4 mr-2 animate-spin'></Loader2>
                                            Improving...
                                        </>

                                        :
                                        <>
                                            <Sparkles className='h-4 w-4 mr-2' ></Sparkles>
                                            Improve with AI
                                        </>

                                }

                            </Button>
                        </CardContent>
                        <CardFooter className='flex justify-end space-x-3 '>
                            <Button
                                type='button'
                                variant={'outline'}
                                className='cursor-pointer'
                                onClick={() => {
                                    reset();
                                    setIsAdding(false);
                                }
                                }
                            >Cancel</Button>
                            <Button
                                type='button'
                                variant={'outline'}
                                className='cursor-pointer'
                                onClick={() => {
                                    handleAddEntry()
                                }
                                }
                            >
                                <PlusCircle className=' w-4 h-4 mr-0 ' />
                                Add Entry
                            </Button>
                        </CardFooter>
                    </Card>
                )
            }
            {
                !isAdding && (
                    <Button
                        className='w-full cursor-pointer '
                        variant={"outline"}
                        onClick={() => {
                            setIsAdding(true)
                        }}
                    >
                        <PlusCircle className='h-4 w-4 mr-2' />
                        Add {type}
                    </Button>
                )
            }
        </div>
    )
}

export default EntryForm