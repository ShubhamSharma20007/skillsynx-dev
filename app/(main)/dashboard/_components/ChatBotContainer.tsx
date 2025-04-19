
import * as React from "react"
import { CheckIcon, PaperclipIcon, PlusIcon, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { useAbly } from "@/app/context/PusherContext"
import { useForm } from "react-hook-form"
import Loader from "@/components/Loader"
import { useUser } from "@clerk/nextjs";

type VisibityDispatcherProps ={
  setVisible: React.Dispatch<React.SetStateAction<boolean>>,
  visible:boolean
}


export function ChatBotContainer(VisibityDispatcherProps: VisibityDispatcherProps) {
  const {user} = useUser();
  const { isConnected, hasStreamingMessageRef, messages, sendMessage, streaming } = useAbly();
  let chatContainer = React.useRef<HTMLDivElement | null>(null)
  const { watch, register, handleSubmit, reset, getValues, formState: { errors } } = useForm({
    defaultValues: {
      message: ''
    }
  })


  const messageWatch = watch('message')
  function onSubmit() {
    const msg = getValues("message").trim();
    if (!msg) return;
    sendMessage(msg)
    reset();
  }

  useEffect(()=>{
    if(chatContainer.current){
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  },[messages])

  return (
    <>
      <Card className="max-w-sm w-full fixed bottom-16 right-5 z-[20]" vocab="english">
        <CardHeader className="flex flex-row items-center justify-between">
          {
            user && user.firstName && user.lastName && (
              <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt="Image" />
              <AvatarFallback>{user.firstName[0].toUpperCase()+user?.lastName[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
            )
          }
          {/* <Button
          onClick={()=>{
            VisibityDispatcherProps.setVisible(!VisibityDispatcherProps.visible)
          }}
          size={'icon'} className="cursor-pointer   h-7 w-7 p-[3px] rounded-full" variant={'outline'} asChild>
          <X className="w-5 h-5"></X>
        </Button> */}
        </CardHeader>
        <CardContent className="h-[50vh] overflow-y-auto " ref={chatContainer}>
        <div className="space-y-4">
  {messages.map((message, index) => (
    (message.content || (message.role === "assistant" && streaming && index === messages.length - 1)) && (
      <div
        key={index}
        className={cn(
          "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
          message.role === "user"
            ? "ml-auto bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {message.role === "assistant" && streaming && index === messages.length - 1 && !hasStreamingMessageRef.current ? (
          <Loader />
        ) : (
          message.content
        )}
      </div>
    )
  ))}
</div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
            autoComplete="off"
            spellCheck="true"
              onKeyUp={(e) => {
                if (e.key.toLowerCase() === 'enter' && !e.shiftKey) {
                  handleSubmit(onSubmit)()
                }
              }}
              id="message" {...register('message', {
                required: true,
                minLength: {
                  value: 3,
                  message: 'Message must be at least 3 character long',
                }
              })} placeholder="Type your message..." className="flex-1" />
            <Button

              disabled={!messageWatch && isConnected || streaming} size="icon" onClick={handleSubmit(onSubmit)}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
        {/* {errors.message && (
                <p className="text-sm text-red-500">
                  {errors.message.message}
                </p>
              )} */}
      </Card>
    </>
  )
}
