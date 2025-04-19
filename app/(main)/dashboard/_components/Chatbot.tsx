"use client"
import { Bot } from 'lucide-react'
import React, { useEffect } from 'react'

import { Toggle } from "@/components/ui/toggle"
import { useAbly } from '@/app/context/PusherContext'
import { AiChatInterface } from '@/interface/aiChatInterfce'
import { useAuth } from '@clerk/nextjs'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'

const ChatBotComponent = dynamic(()=>import('./ChatBotContainer').then(mod=>mod.ChatBotContainer),{ssr:false})

const Chatbot = ({ aiChats }: { aiChats: AiChatInterface[] }) => {

  const user = useAuth()
  const [visible, setVisible] = React.useState(false)
  const { setMessages } = useAbly()
  function showChatBotContainer(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const element = (e.target as HTMLButtonElement)
    if (!element) return 'element not found'
    if (element) {
      if (element.dataset['state'] !== "off") {
        setVisible(!visible)
      } else {
        setVisible(!visible)
      }
    }

  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    showChatBotContainer(e);
  }
  useEffect(() => {
    setMessages(aiChats)
  }, [user?.userId])
  return (
    <>
      <Toggle
        onClick={handleClick}
        variant="outline"
        aria-label="Chatbot"
        className='bg-black/80 fixed bottom-4 right-5 z-10 cursor-pointer border-white/30'
        asChild
      >
        {visible ? (
          <X className='w-10 h-10 text-muted-foreground ' />
        ) : (
          <Bot className='w-10 h-10 text-white ' />
        )}
      </Toggle>
      {
        visible && <ChatBotComponent setVisible={setVisible} visible={visible} />
      }

    </>
  )
}

export default Chatbot