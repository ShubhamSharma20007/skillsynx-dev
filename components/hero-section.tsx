"use client"
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

export default function HeroSection() {
  const imageRef = useRef<HTMLDivElement | null>(null)
  useEffect(()=>{
   const handleScroll =()=>{
    const scrollPostion = window.scrollY;
    const scrollThreshold = 100;
    if(scrollPostion > scrollThreshold){
      imageRef.current?.classList.add('scrolled')
    }else{
      imageRef.current?.classList.remove('scrolled')
    }
   }
   window.addEventListener('scroll',handleScroll)
   return ()=>{
    window.removeEventListener('scroll',handleScroll)
   }
  
  },[])
  return (
    <section className='w-full pt-24 md:pt-28 pb-10 overflow-hidden bg-gradient-to-b'>
      <div className=' space-y-6 text-center'>
      <div className='space-y-6 mx-auto'>
        <h1 className='gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl'>Your Personal AI Assistant for
        <br />
        Professional Success
        </h1>
        <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl'>Advance your career with personalized guidance, interview prep, and  AI-powered tools for job success.</p>
      </div>
      <div>
        <Button size={'lg'} className='px-8' asChild>
        <Link href={'/dashboard'}>
          Get Started
        </Link>
        </Button>
      </div>

      <div className='hero-image-wrapper mt-5 md:mt-0'>
        <div ref={imageRef} className='hero-image'>
          <Image alt='banner img' src="/banner.jpeg" width={1280} height={720} className='rounded-lg shadow-2xl border mx-auto' priority></Image>
        </div>
      </div>
      </div>

    </section>
  )
}
