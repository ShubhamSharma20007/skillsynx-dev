import HeroSection from "@/components/hero-section";
import { features } from "../data/features"
import { howItWorks } from "../data/howItWork"
import { faqs } from "../data/faqs"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";
import { currentUser } from '@clerk/nextjs/server'
import { createUser } from "@/services/user";
import Chatbot from "./(main)/dashboard/_components/Chatbot";
// import { getAssistantResponse } from "@/services/assistant-api";
import { getAIChats } from "@/services/ai-chats";
export default async function Home() {
 const user =await currentUser();
 
 if(user){
   await createUser(user)
  }
let aiChats=[];
 const aiChatResponse = await getAIChats()
 aiChats = aiChatResponse?.chats
  return (
    <div className="relative">
      {/* bg */}
      <div className="grid-background"></div>
  
      {
        user?.id  && <Chatbot aiChats={aiChats && aiChats.length > 0 ? aiChats : []} />
      }

      <HeroSection />
      {/* feature section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6  py-5 ">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Powerfull Feature for Your Career Growth</h2>
          <div className="grid grid-cols-1   md:grid-cols-4  gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => <Card key={index + 1} className="border-2 hover:border-primary transition-colors duration-300 ease-in-out">
              <CardContent className="pt-5 text-center flex flex-col items-center">
                <div className="flex flex-col items-center justify-center">{feature.icon}</div>
                <h3 className="tetx-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>)}
          </div>
        </div>
      </section>
      {/* Tiles section */}
      <section className="w-full py-12 md:py-30 bg-muted/50 ">
        <div className="container mx-auto px-4 md:px-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="text-muted-foreground">Industries Covered</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Interview Question's</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">95%</h3>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">24*7</h3>
              <p className="text-muted-foreground">Ai Support</p>
            </div>
          </div>
        </div>
      </section>
      {/* Work's section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6  py-5 ">
          <div className="text-3xl max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold  mb-4">How It Works</h2>
            <p className="text-muted-foreground">For simple steps to accelerate your career growth</p>
          </div>
          <div className="grid grid-cols-1   md:grid-cols-4  gap-6 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => <div
              className="flex flex-col items-center text-center space-y-4"
              key={index + 1}>
              <div className="w-15 h-15 rounded-full bg-primary/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            )}
          </div>
        </div>
      </section>
      {/* FAQ section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6  py-5 ">
          <div className="text-3xl max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold  mb-4">Frequently Asked Question's</h2>
            <p className="text-muted-foreground">Find answers to common questions about our platform</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible >
              {faqs.map((item, index) =>
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-md">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>

              )}
            </Accordion>
          </div>
        </div>
      </section>

          {/* Career section */}
            <section className="w-full ">
        <div className=" mx-auto py-24 bg-gradient-to-b from-gray-400 via-gray-200 to-gray-200 rounded-t-3xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-3xl max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">Ready to Accelerate Your Career? </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 font-medium md:text-xl">Join thousands of professionals whi are advancing theri careers with AI-powered gudiance.</p>
          <Link href="/dashboard" passHref>
          <Button
          size={'lg'}
          variant={'secondary'}
          className="h-11 mt-5 animate-bounce"
          >
            Start Your Jounary Today <ArrowRight className="h-4 w-4"/>
            </Button></Link>
          </div>
         
        </div>
      </section>

    </div>
  )
}
