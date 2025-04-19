'use client'
import React, { useEffect } from 'react'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default  function Header() {

//  useEffect(()=>{
//  if(!!user){
//   axios.post('/api/user',{...user},{
//     headers:{
//       'Content-Type':'application/json'
//     }
//   }).then((data)=>{
//     console.log(data)
//   }).catch(err=>{
//     console.log(err)
//   })
//  }
//  },[user])
  return (
    <div className='sticky top-5 z-20'>
      <header className="flex justify-between items-center bg-muted/50 p-4 gap-4 h-16 backdrop-blur-xs shadow-muted py-5 my-2 sm:my-5 mx-1 sm:mx-5 rounded-xl">
      <nav>
        <Link href={'/'}>
        <p className='gredient-title text-2xl font-medium tracking-wide '><span className='text-3xl text-primary'>S</span>killSynx Ai</p>
        </Link>
      </nav>
      
<div className='flex items-center space-x-3'>
<SignedIn>
      <Button variant={'outline'} asChild>
      <Link href={'/dashboard'} >
     <LayoutDashboard className='h-4 w-4'/>
      <span className='hidden md:block'> Industry Insign</span>
      </Link>
      </Button>
    
    <DropdownMenu>
  <DropdownMenuTrigger asChild>
  <Button >
     <StarsIcon className='h-4 w-4'/>
      <span className='hidden md:block'>Growth Tools</span>
     <ChevronDown className='h-4 w-4'/>
      </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>

    <DropdownMenuItem>
      <Link href={'/resume'} className='flex items-center gap-2'>
      <FileText className='h-4 w-4'/>
      <span className=''>Build Resume</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
    <Link href={'/ai-cover-letter'} className='flex items-center gap-2'>
      <PenBox className='h-4 w-4'/>
      <span className=''>Cover Letter</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
    <Link href={'/interview'} className='flex items-center gap-2'>
      <GraduationCap className='h-4 w-4'/>
      <span className=''>Interview Prep.</span>
      </Link>
    </DropdownMenuItem>
   
  </DropdownMenuContent>
</DropdownMenu>
</SignedIn>
   <SignedOut>
      <SignInButton>
        <Button className='cursor-pointer text-md' variant={'outline'}>Sign In</Button>
      </SignInButton>
    </SignedOut>
    <SignedIn>
      <UserButton
      afterSignOutUrl='/'
       appearance={{
        elements:{
          avatarBox:"w-12 h-12 ",
          userButtonPopoverCard:'shadow-xl',
          userPreviewMainIdentifier:'font-semibold'
        },
      
      }}/>
    </SignedIn>
      {/* <SignUpButton /> */}
</div>

   
  </header>
    </div>
  )
}
