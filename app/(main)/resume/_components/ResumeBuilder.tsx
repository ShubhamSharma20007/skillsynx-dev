"use client"
import { Button } from '@/components/ui/button'
import { AlertTriangle, CirclePause, Download, Edit, Loader2, Mic, Monitor, Pause, Save } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFetch } from '@/hooks/user-fetch'
import { saveResume } from '@/services/resume'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resumeSchema } from '@/lib/Schema'
import MDEditor from '@uiw/react-md-editor';
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import EntryForm from './EntryForm'
import { enteriesToMarkdown } from '@/lib/helper'
import { useUser } from '@clerk/nextjs'
import { jsPDF } from "jspdf";
import html2pdf from 'html2pdf.js'
import { toast } from 'sonner'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
const ResumeBuilder = ({ initialContent: initialResumeContent }: { initialContent?: string }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = React.useState('edit');
  const [resumeMode, setResumeMode] = React.useState<'edit' | 'preview'>('edit');
  const [recognitionBtnColor, setRecognitionBtnColor] = React.useState<'destructive' | 'secondary'>('secondary');
  const [previewContent, setPreviewContent] = useState<string>(initialResumeContent || '');
  const [isGenrating, setIsGenerating] = React.useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  let recognition: any = null;
  const {
    loading: isResuming,
    data: resumeData,
    error:resumeSaveError,
    fn: saveResumeHandler,
  } = useFetch(saveResume);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    register, 
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        email: '',
        mobile: '',
        twitter: '',
        linkedin: '',
      },
      summary: '',
      skills: '',
      experience: [],
      education: [],
      projects: [],
    }
  });
  
  const formValues = watch();

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user?.fullName}</div>
    \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  }

  const getCombineContent = () => {
    if (!formValues) return '';
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      enteriesToMarkdown(experience, 'Experience'),
      enteriesToMarkdown(education, 'Education'),
      enteriesToMarkdown(projects, 'Project'),
    ].filter(Boolean).join('\n\n');
  }

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombineContent();
      if (newContent) {
        setPreviewContent(newContent);
      } else if (initialResumeContent) {
        setPreviewContent(initialResumeContent);
      }
    }
  }, [formValues, activeTab, initialResumeContent]);

  // Define the onSubmit function to save the resume
  async function onSubmit(data: any) {
    const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

    try {
      await saveResumeHandler(formattedContent);
    } catch (error) {
      console.error("Error saving resume:", error);
    }
  }


  useEffect(() => {
    if(resumeData && !isResuming){
      toast.success("Resume saved successfully");
    }
    if(resumeSaveError){
      toast.error(resumeSaveError.message || resumeSaveError ||'Save to failed resume')
    }
  },[resumeData,isResuming,resumeSaveError])

  async function generatePDF() {
    setIsGenerating(true);
  
    try {
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }


  let timer = useRef<NodeJS.Timeout | null>(null);

  const startInactivityTimer = () => {
    console.log("Timer started");
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      SpeechRecognition.stopListening();
      setRecognitionBtnColor('secondary');
    }, 1000 * 10);
  };
  
  const clearInactivityTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  
  const handleSpeechRecognition = () => {
    if (recognitionBtnColor === 'secondary') {
      SpeechRecognition.startListening({
        continuous: true,
        language: 'en-US'
      });
      setRecognitionBtnColor('destructive');
      startInactivityTimer()
    } else {
      clearInactivityTimer(); 
      SpeechRecognition.stopListening();
      setRecognitionBtnColor('secondary');
    }
  };
  
  useEffect(() => {
    if (recognitionBtnColor === 'destructive' && transcript) {
      startInactivityTimer();
    }
  }, [transcript]);

  useEffect(() => {
    if (transcript) {
      setValue('summary',transcript);
    }
  }, [transcript]);
  
  // Helper function to load html2pdf.js
  // const loadHTML2PDF = (): Promise<void> => {
  //   return new Promise((resolve, reject) => {
  //     // Check if already loaded
  //     if (window.hasOwnProperty('html2pdf')) {
  //       resolve();
  //       return;
  //     }
      
  //     const htmlToPdfCDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  //     const script = document.createElement('script');
  //     script.src = htmlToPdfCDN;
  //     script.async = true;
      
  //     script.onload = () => resolve();
  //     script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
      
  //     document.body.appendChild(script);
  //   });
  // };

  useEffect(() => {
    if (initialResumeContent) {
      setActiveTab('edit');
    }
  }, [initialResumeContent]);

  // Fixed MDEditor onChange handler
  const handleEditorChange = (value: string | undefined) => {
    console.log("Editor value changed:", value);
    setPreviewContent(value || '');
  };

  if (!browserSupportsSpeechRecognition) {
    return toast.error('Your browser does not support speech recognition.');
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            className='cursor-pointer'
            variant="default"
            onClick={onSubmit}
            disabled={isResuming}
          >
            {isResuming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            onClick={generatePDF}
            className='cursor-pointer'
            variant="destructive"
            disabled={isGenrating}
          >
            {isGenrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-2">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-2">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+91 1234567890"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-2">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-2">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name='summary'
                control={control}
                render={({ field }) => (
                  <div className='relative'>
                    <Button type='button'onClick={handleSpeechRecognition}  variant={recognitionBtnColor} size={'icon'} className='cursor-pointer absolute bottom-2 right-2'>
                      {
                        recognitionBtnColor === "secondary" ?  <Mic className='h-5 w-5'/> : <CirclePause className='h-5 w-5'/>
                      }

                    
                    </Button>
                    <Textarea
                    {...field}
                    placeholder="Write a brief summary of your professional background and career goals."
                    className='h-32 resize-none '
                  ></Textarea>
                  </div>
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>
            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>
            {/* Work Exp. */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type='Experience'
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience.message}</p>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type='Education'
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">{errors.education.message}</p>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => {
                  return (
                    <EntryForm
                      type='Project'
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )
                }}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">{errors.projects.message}</p>
              )}
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="preview">
          <Button
            onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
            variant={'link'} 
            type='button' 
            className='mb-2 cursor-pointer'
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className='h-4 w-4 mr-2' />
                Edit Resume
              </>
            ) : (
              <>
                <Monitor className='h-4 w-4 mr-2' />
                Show Preview
              </>
            )}
          </Button>
          
          {activeTab === "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={handleEditorChange}
              height={800}
              preview={resumeMode}
            />
          </div>
          
          <div className='hidden'>
            <div id='resume-pdf'>
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: 'white',
                  color: 'black'
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ResumeBuilder